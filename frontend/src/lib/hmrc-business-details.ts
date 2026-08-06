import { hmrcApiRequest } from "@/lib/hmrc-api-client";
import type { HmrcFraudClientContext } from "@/lib/hmrc-fraud-context";

export type HmrcBusinessRow = {
  businessId: string;
  typeOfBusiness: string;
  tradingName: string | null;
};

/** Fields from GET /individuals/business/details/{nino}/{businessId} (Retrieve Business Details). */
export type HmrcBusinessDetails = {
  businessId: string;
  typeOfBusiness: string;
  tradingName: string | null;
  accountingType: string | null;
  commencementDate: string | null;
  cessationDate: string | null;
  quarterlyTypeChoice: string | null;
};

type BusinessListApiResponse = {
  listOfBusinesses?: Array<{
    businessId?: string;
    typeOfBusiness?: string;
    tradingName?: string;
  }>;
};

type BusinessDetailsApiResponse = {
  businessId?: string;
  typeOfBusiness?: string;
  tradingName?: string;
  accountingType?: string;
  commencementDate?: string;
  cessationDate?: string;
  quarterlyTypeChoice?: {
    quarterlyPeriodType?: string;
  };
};

type HmrcCallContext = {
  userId: string;
  request: Request;
  nino: string;
  fraudContext?: HmrcFraudClientContext | null;
  userLoginId?: string | null;
};

const HMRC_BUSINESS_ID_RE = /^X[a-zA-Z0-9]{1}IS[0-9]{11}$/;
const HMRC_ACCEPT = "application/vnd.hmrc.2.0+json";

export function isValidHmrcBusinessId(value: string): boolean {
  return HMRC_BUSINESS_ID_RE.test(value.trim());
}

function normalizeNino(nino: string): string {
  return nino.replace(/\s/g, "").toUpperCase();
}

export async function fetchHmrcBusinessList(
  input: HmrcCallContext,
): Promise<{ businesses: HmrcBusinessRow[] } | { error: string }> {
  const nino = normalizeNino(input.nino);
  const path = `/individuals/business/details/${encodeURIComponent(nino)}/list`;

  const result = await hmrcApiRequest<BusinessListApiResponse>({
    userId: input.userId,
    request: input.request,
    path,
    fraudContext: input.fraudContext,
    userLoginId: input.userLoginId,
    accept: HMRC_ACCEPT,
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

/**
 * Retrieve Business Details (MTD) — required for HMRC production sample checks.
 * Distinct from List All Businesses (`…/list`).
 */
export async function fetchHmrcBusinessDetails(
  input: HmrcCallContext & { businessId: string },
): Promise<{ details: HmrcBusinessDetails } | { error: string }> {
  const nino = normalizeNino(input.nino);
  const businessId = input.businessId.trim();
  if (!isValidHmrcBusinessId(businessId)) {
    return { error: "Invalid HMRC business ID." };
  }

  const path = `/individuals/business/details/${encodeURIComponent(nino)}/${encodeURIComponent(businessId)}`;

  const result = await hmrcApiRequest<BusinessDetailsApiResponse>({
    userId: input.userId,
    request: input.request,
    path,
    fraudContext: input.fraudContext,
    userLoginId: input.userLoginId,
    accept: HMRC_ACCEPT,
  });

  if (!result.ok) {
    return { error: result.error.message };
  }

  const data = result.data;
  return {
    details: {
      businessId: data.businessId ?? businessId,
      typeOfBusiness: data.typeOfBusiness ?? "",
      tradingName: data.tradingName?.trim() || null,
      accountingType: data.accountingType?.trim() || null,
      commencementDate: data.commencementDate?.trim() || null,
      cessationDate: data.cessationDate?.trim() || null,
      quarterlyTypeChoice: data.quarterlyTypeChoice?.quarterlyPeriodType?.trim() || null,
    },
  };
}

/** List businesses, then retrieve details for each (caps at `maxRetrieve` for safety). */
export async function fetchHmrcBusinessListAndDetails(
  input: HmrcCallContext & { maxRetrieve?: number },
): Promise<
  | { businesses: HmrcBusinessRow[]; details: HmrcBusinessDetails[]; retrieveErrors: string[] }
  | { error: string }
> {
  const list = await fetchHmrcBusinessList(input);
  if ("error" in list) return list;

  const maxRetrieve = input.maxRetrieve ?? 5;
  const details: HmrcBusinessDetails[] = [];
  const retrieveErrors: string[] = [];

  for (const row of list.businesses.slice(0, maxRetrieve)) {
    const retrieved = await fetchHmrcBusinessDetails({
      ...input,
      businessId: row.businessId,
    });
    if ("error" in retrieved) {
      retrieveErrors.push(`${row.businessId}: ${retrieved.error}`);
      continue;
    }
    details.push(retrieved.details);
  }

  return { businesses: list.businesses, details, retrieveErrors };
}
