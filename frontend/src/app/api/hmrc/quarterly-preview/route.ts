import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getSandboxQuarterlyPreview } from "@/lib/hmrc-quarterly-server";
import { hmrcRateLimitOrNull } from "@/lib/hmrc-api-rate-limit";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimited = await hmrcRateLimitOrNull(userId);
  if (rateLimited) return rateLimited;

  const url = new URL(request.url);
  const businessId = url.searchParams.get("businessId")?.trim();
  const periodEndDate = url.searchParams.get("periodEndDate")?.trim() || undefined;

  if (!businessId) {
    return NextResponse.json({ error: "businessId is required." }, { status: 400 });
  }

  try {
    const preview = await getSandboxQuarterlyPreview(userId, businessId, periodEndDate);
    return NextResponse.json({ preview });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not build preview.";
    const status = message.includes("not enabled") ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
