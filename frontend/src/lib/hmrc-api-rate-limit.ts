import type { NextResponse } from "next/server";

import { API_RATE_LIMITS, rateLimitOrNull } from "@/lib/api-rate-limit";

export function hmrcRateLimitOrNull(userId: string): Promise<NextResponse | null> {
  return rateLimitOrNull("hmrc", userId, API_RATE_LIMITS.hmrc);
}
