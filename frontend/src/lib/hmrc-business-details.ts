import { hmrcApiRequest } from "@/lib/hmrc-api-client";
import type { HmrcFraudClientContext } from "@/lib/hmrc-fraud-context";

export type HmrcBusinessRow = {
  businessId: string;
  typeOfBusiness: string;
  tradingName: string | null;
};

type BusinessListApiResponse = {
  listOfBusinesses?: Array<{
    businessId?: string;
    typeOfBusiness?: string;
    tradingName?: string;
  }>;
};

const HMRC_BUSINESS_ID_RE = /^X[a-zA-Z0-9]{1}IS[0-9]{11}$/;

export function isValidHmrcBusinessId(value: string): boolean {
  return HMRC_BUSINESS_ID_RE.test(value.trim());
}

export async function fetchHmrcBusinessList(input: {
  userId: string;
  request: Request;
  nino: string;
  fraudContext?: HmrcFraudClientContext | null;
  userLoginId?: string | null;
}): Promise<{ businesses: HmrcBusinessRow[] } | { error: string }> {
  const nino = input.nino.replace(/\s/g, "").toUpperCase();
  const path = `/individuals/business/details/${encodeURIComponent(nino)}/list`;

  const result = await hmrcApiRequest<BusinessListApiResponse>({
    userId: input.userId,
    request: input.request,
    path,
    fraudContext: input.fraudContext,
    userLoginId: input.userLoginId,
    accept: "application/vnd.hmrc.2.0+json",
  });

  if (!result.ok) {
    return { error: result.error.message };
  }

  const businesses: HmrcBusinessRow[] = [];
  for (const row of result.data.listOfBusinesses ?? []) {
    if (!row.businessId || !row.typeOfBusiness) continue;
    businesses.push({
      businessId: row.businessId,
      typeOfBusiness: row.typeOfBusiness,
      tradingName: row.tradingName?.trim() || null,
    });
  }

  return { businesses };
}
