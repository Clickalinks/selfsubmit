import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { linkBusinessToHmrc, listLocalBusinessHmrcLinks } from "@/lib/hmrc-business-server";
import { fetchHmrcBusinessDetails, isValidHmrcBusinessId } from "@/lib/hmrc-business-details";
import { hmrcRateLimitOrNull } from "@/lib/hmrc-api-rate-limit";
import { readFraudContextCookie } from "@/lib/hmrc-fraud-context";
import { getDecryptedTaxIds } from "@/lib/tax-ids-server";

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
  const typeOfBusinessRaw = b.typeOfBusiness;

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

  let typeOfBusiness =
    typeof typeOfBusinessRaw === "string" && typeOfBusinessRaw.trim()
      ? typeOfBusinessRaw.trim()
      : null;

  if (hmrcBusinessId && !typeOfBusiness) {
    const taxIds = await getDecryptedTaxIds(userId);
    if (taxIds.niNumber) {
      const cookieStore = await cookies();
      const fraudContext = readFraudContextCookie(cookieStore.get("hmrc_fp_ctx")?.value);
      const clerkUser = await currentUser();
      const retrieved = await fetchHmrcBusinessDetails({
        userId,
        request,
        nino: taxIds.niNumber,
        businessId: hmrcBusinessId,
        fraudContext,
        userLoginId: clerkUser?.primaryEmailAddress?.emailAddress ?? null,
      });
      if (!("error" in retrieved) && retrieved.details.typeOfBusiness) {
        typeOfBusiness = retrieved.details.typeOfBusiness;
      }
    }
  }

  try {
    const business = await linkBusinessToHmrc(userId, businessId, hmrcBusinessId, typeOfBusiness);
    return NextResponse.json({ ok: true, business });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save link.";
    const status = message === "Business not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
