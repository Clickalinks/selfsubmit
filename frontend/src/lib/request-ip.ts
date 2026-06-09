import type { NextRequest } from "next/server";

/** Best-effort client IP for rate limiting and audit logs. */
export function getRequestIp(request: Request | NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export function getRequestUserAgent(request: Request): string | null {
  return request.headers.get("user-agent");
}
