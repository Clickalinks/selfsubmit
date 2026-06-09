import { NextResponse } from "next/server";

import { checkLoginAllowed, recordLoginFailure, recordRateLimitHit } from "@/lib/login-protection";
import { getRequestIp, getRequestUserAgent } from "@/lib/request-ip";

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  const userAgent = getRequestUserAgent(request);

  let body: { email?: string; reason?: string } = {};
  try {
    body = (await request.json()) as { email?: string; reason?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  try {
    await recordRateLimitHit(ip);
    const preCheck = await checkLoginAllowed(email, ip);
    if (!preCheck.allowed) {
      return NextResponse.json(
        {
          allowed: false,
          lockedUntil: preCheck.lockedUntil?.toISOString() ?? null,
          message: preCheck.message,
          reason: preCheck.reason,
        },
        { status: 429 },
      );
    }

    const result = await recordLoginFailure({
      identifier: email,
      ip,
      userAgent,
      failureReason: typeof body.reason === "string" ? body.reason.slice(0, 200) : "invalid_credentials",
    });

    return NextResponse.json({
      allowed: result.allowed,
      lockedUntil: result.lockedUntil?.toISOString() ?? null,
      message: result.message,
      reason: result.reason,
    });
  } catch (err) {
    console.error("[login-protection/failure]", err);
    return NextResponse.json({ allowed: true, lockedUntil: null, message: null, reason: null });
  }
}
