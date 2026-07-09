import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { linkBusinessToHmrc, listLocalBusinessHmrcLinks } from "@/lib/hmrc-business-server";
import { isValidHmrcBusinessId } from "@/lib/hmrc-business-details";
import { hmrcRateLimitOrNull } from "@/lib/hmrc-api-rate-limit";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimited = await hmrcRateLimitOrNull(userId);
  if (rateLimited) return rateLimited;

  const businesses = await listLocalBusinessHmrcLinks(userId);
  return NextResponse.json({ businesses });
}

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimited = await hmrcRateLimitOrNull(userId);
  if (rateLimited) return rateLimited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const businessId = typeof b.businessId === "string" ? b.businessId.trim() : "";
  const hmrcBusinessIdRaw = b.hmrcBusinessId;

  if (!businessId) {
    return NextResponse.json({ error: "businessId is required." }, { status: 400 });
  }

  let hmrcBusinessId: string | null = null;
  if (hmrcBusinessIdRaw === null || hmrcBusinessIdRaw === "") {
    hmrcBusinessId = null;
  } else if (typeof hmrcBusinessIdRaw === "string") {
    hmrcBusinessId = hmrcBusinessIdRaw.trim();
    if (!isValidHmrcBusinessId(hmrcBusinessId)) {
      return NextResponse.json({ error: "Invalid HMRC business ID format." }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "hmrcBusinessId must be a string or null." }, { status: 400 });
  }

  try {
    const business = await linkBusinessToHmrc(userId, businessId, hmrcBusinessId);
    return NextResponse.json({ ok: true, business });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save link.";
    const status = message === "Business not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
