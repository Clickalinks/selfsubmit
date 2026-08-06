import { fetchHmrcBusinessDetails, fetchHmrcBusinessList } from "@/lib/hmrc-business-details";
import { linkBusinessToHmrc } from "@/lib/hmrc-business-server";
import type { HmrcFraudClientContext } from "@/lib/hmrc-fraud-context";
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

  const selfEmployment = list.businesses.filter((b) => b.typeOfBusiness === "self-employment");
  if (selfEmployment.length !== 1) {
    return { linked: false, reason: selfEmployment.length === 0 ? "no_business" : "multiple" };
  }

  const hmrcBusinessId = selfEmployment[0].businessId;

  // HMRC production sample check requires Retrieve Business Details (not only List).
  const retrieved = await fetchHmrcBusinessDetails({
    ...callCtx,
    businessId: hmrcBusinessId,
  });
  if ("error" in retrieved) {
    return { linked: false, reason: "api_error" };
  }

  try {
    await linkBusinessToHmrc(input.userId, input.businessId, hmrcBusinessId);
    return { linked: true, hmrcBusinessId };
  } catch {
    return { linked: false, reason: "not_found" };
  }
}
