import { fetchHmrcBusinessDetails, fetchHmrcBusinessList } from "@/lib/hmrc-business-details";
import { linkBusinessToHmrc } from "@/lib/hmrc-business-server";
import { prisma } from "@/lib/db";
import type { HmrcFraudClientContext } from "@/lib/hmrc-fraud-context";
import { expectedHmrcTypeOfBusiness } from "@/lib/hmrc-income-source";
import { getDecryptedTaxIds } from "@/lib/tax-ids-server";

export type HmrcAutoLinkResult =
  | { linked: true; hmrcBusinessId: string }
  | { linked: false; reason: "no_business" | "multiple" | "api_error" | "missing_nino" | "not_found" };

export async function autoLinkHmrcBusinessForUser(input: {
  userId: string;
  businessId: string;
  request: Request;
  fraudContext?: HmrcFraudClientContext | null;
  userLoginId?: string | null;
}): Promise<HmrcAutoLinkResult> {
  const taxIds = await getDecryptedTaxIds(input.userId);
  if (!taxIds.niNumber) {
    return { linked: false, reason: "missing_nino" };
  }

  const local = await prisma.business.findFirst({
    where: { id: input.businessId, userId: input.userId },
    select: { category: true },
  });
  if (!local) {
    return { linked: false, reason: "not_found" };
  }

  const wantedType = expectedHmrcTypeOfBusiness(local.category);

  const callCtx = {
    userId: input.userId,
    request: input.request,
    nino: taxIds.niNumber,
    fraudContext: input.fraudContext,
    userLoginId: input.userLoginId,
  };

  const list = await fetchHmrcBusinessList(callCtx);

  if ("error" in list) {
    return { linked: false, reason: "api_error" };
  }

  const matches = list.businesses.filter((b) => b.typeOfBusiness === wantedType);
  if (matches.length !== 1) {
    return { linked: false, reason: matches.length === 0 ? "no_business" : "multiple" };
  }

  const hmrcBusinessId = matches[0].businessId;

  const retrieved = await fetchHmrcBusinessDetails({
    ...callCtx,
    businessId: hmrcBusinessId,
  });
  if ("error" in retrieved) {
    return { linked: false, reason: "api_error" };
  }

  try {
    await linkBusinessToHmrc(
      input.userId,
      input.businessId,
      hmrcBusinessId,
      retrieved.details.typeOfBusiness || wantedType,
    );
    return { linked: true, hmrcBusinessId };
  } catch {
    return { linked: false, reason: "not_found" };
  }
}
