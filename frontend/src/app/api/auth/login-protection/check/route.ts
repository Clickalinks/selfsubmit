import { NextResponse } from "next/server";

import { API_RATE_LIMITS, rateLimitKey, checkApiRateLimit } from "@/lib/api-rate-limit";
import { checkLoginAllowed, recordLoginPreCheck, recordRateLimitHit } from "@/lib/login-protection";
import { getRequestIp } from "@/lib/request-ip";

export async function POST(request: Request) {
  const ip = getRequestIp(request) ?? "unknown";

  const limited = await checkApiRateLimit({
    key: rateLimitKey("login-protection", ip),
    ...API_RATE_LIMITS.loginProtection,
  });
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  let body: { email?: string } = {};
  try {
    body = (await request.json()) as { email?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  try {
    await recordRateLimitHit(ip);
    const result = await checkLoginAllowed(email, ip);
    if (!result.allowed) {
      return NextResponse.json(
        {
          allowed: false,
          lockedUntil: result.lockedUntil?.toISOString() ?? null,
          message: result.message,
          reason: result.reason,
        },
        { status: 429 },
      );
    }

    await recordLoginPreCheck(email, ip);

    return NextResponse.json({ allowed: true, lockedUntil: null, message: null, reason: null });
  } catch (err) {
    console.error("[login-protection/check]", err);
    // Fail open so Clerk sign-in still works if the protection store is unavailable.
    return NextResponse.json({ allowed: true, lockedUntil: null, message: null, reason: null });
  }
}
