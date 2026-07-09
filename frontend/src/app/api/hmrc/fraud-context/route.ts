import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isHmrcOAuthConfigured } from "@/lib/hmrc-config";
import { hmrcRateLimitOrNull } from "@/lib/hmrc-api-rate-limit";
import { createFraudContextCookie, type HmrcFraudClientContext } from "@/lib/hmrc-fraud-context";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimited = await hmrcRateLimitOrNull(userId);
  if (rateLimited) return rateLimited;

  if (!isHmrcOAuthConfigured()) {
    return NextResponse.json({ error: "HMRC OAuth is not configured on this server." }, { status: 503 });
  }

  let body: Partial<HmrcFraudClientContext>;
  try {
    body = (await request.json()) as Partial<HmrcFraudClientContext>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.deviceId?.trim() || !body.browserJsUserAgent?.trim()) {
    return NextResponse.json({ error: "Missing fraud prevention device context." }, { status: 400 });
  }

  const context: HmrcFraudClientContext = {
    deviceId: body.deviceId.trim(),
    browserJsUserAgent: body.browserJsUserAgent.trim(),
    screens: body.screens?.trim() || "width=1920&height=1080&scaling-factor=1&colour-depth=24",
    windowSize: body.windowSize?.trim() || "width=1280&height=800",
    timezone: body.timezone?.trim() || "UTC+00:00",
    collectedAt: new Date().toISOString(),
  };

  const cookie = createFraudContextCookie(context);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookie.name, cookie.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: cookie.maxAge,
  });
  return response;
}
