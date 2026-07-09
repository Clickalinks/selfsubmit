import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getHmrcConnectionStatus } from "@/lib/hmrc-connection-server";
import { isHmrcOAuthConfigured } from "@/lib/hmrc-config";
import { hmrcRateLimitOrNull } from "@/lib/hmrc-api-rate-limit";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimited = await hmrcRateLimitOrNull(userId);
  if (rateLimited) return rateLimited;

  const status = await getHmrcConnectionStatus(userId);
  return NextResponse.json({
    ...status,
    oauthConfigured: isHmrcOAuthConfigured(),
  });
}
