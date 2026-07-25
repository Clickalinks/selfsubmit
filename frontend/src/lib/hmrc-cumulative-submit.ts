import { hmrcApiRequest } from "@/lib/hmrc-api-client";
import { getHmrcConfig } from "@/lib/hmrc-config";
import type { HmrcFraudClientContext } from "@/lib/hmrc-fraud-context";
import type { HmrcCumulativeUpdateBody } from "@/lib/hmrc-quarterly-mapper";

export type HmrcCumulativeRetrieved = {
  periodDates: {
    periodStartDate: string;
    periodEndDate: string;
  };
  periodIncome: {
    turnover?: number;
    other?: number;
    taxTakenOffTradingIncome?: number;
  };
  periodExpenses: {
    consolidatedExpenses?: number;
    costOfGoods?: number;
    paymentsToSubcontractors?: number;
    wagesAndStaffCosts?: number;
    carVanTravelExpenses?: number;
    premisesRunningCosts?: number;
    maintenanceCosts?: number;
    adminCosts?: number;
    businessEntertainmentCosts?: number;
    advertisingCosts?: number;
    interestOnBankOtherLoans?: number;
    financeCharges?: number;
    irrecoverableDebts?: number;
    professionalFees?: number;
    depreciation?: number;
    otherExpenses?: number;
  };
};

function cumulativePath(nino: string, businessId: string, taxYear: string): string {
  return `/individuals/business/self-employment/${encodeURIComponent(nino)}/${encodeURIComponent(businessId)}/cumulative/${encodeURIComponent(taxYear)}`;
}

function isSandboxApiBase(): boolean {
  try {
    return getHmrcConfig().apiBase.includes("test-api.service.hmrc.gov.uk");
  } catch {
    return false;
  }
}

/**
 * Optional true stateful sandbox (needs a business from HMRC Self Assessment Test Support API).
 * Default sandbox uses HMRC test scenarios so Submit/Retrieve work with connected test users.
 */
function wantStatefulSandbox(): boolean {
  return process.env.HMRC_SANDBOX_STATEFUL === "true";
}

function formatHmrcError(code: string, message: string): string {
  if (!code || code === "HMRC_API_ERROR") return message;
  return `${code}: ${message}`;
}

export async function submitHmrcCumulativeQuarterlyUpdate(input: {
  userId: string;
  request: Request;
  nino: string;
  businessId: string;
  taxYear: string;
  body: HmrcCumulativeUpdateBody;
  fraudContext?: HmrcFraudClientContext | null;
  userLoginId?: string | null;
}): Promise<{ reference: string } | { error: string }> {
  const nino = input.nino.replace(/\s/g, "").toUpperCase();
  const path = cumulativePath(nino, input.businessId, input.taxYear);
  const sandbox = isSandboxApiBase();

  const result = await hmrcApiRequest<Record<string, never>>({
    userId: input.userId,
    request: input.request,
    path,
    method: "PUT",
    body: input.body,
    fraudContext: input.fraudContext,
    userLoginId: input.userLoginId,
    accept: "application/vnd.hmrc.5.0+json",
    // STATEFUL needs a Test Support API business — omit by default so sandbox DEFAULT succeeds.
    govTestScenario: sandbox && wantStatefulSandbox() ? "STATEFUL" : undefined,
  });

  if (!result.ok) {
    return { error: formatHmrcError(result.error.code, result.error.message) };
  }

  const reference = `${input.body.periodDates.periodStartDate}_${input.body.periodDates.periodEndDate}`;
  return { reference };
}

/** Retrieve the cumulative period summary held by HMRC for this tax year (In-Year checklist). */
export async function retrieveHmrcCumulativeQuarterlyUpdate(input: {
  userId: string;
  request: Request;
  nino: string;
  businessId: string;
  taxYear: string;
  fraudContext?: HmrcFraudClientContext | null;
  userLoginId?: string | null;
}): Promise<{ summary: HmrcCumulativeRetrieved } | { error: string; status?: number }> {
  const nino = input.nino.replace(/\s/g, "").toUpperCase();
  const path = cumulativePath(nino, input.businessId, input.taxYear);
  const sandbox = isSandboxApiBase();

  // Sandbox: CONSOLIDATED_EXPENSES returns a success body so Retrieve + FPH can be evidenced.
  // Production: no Gov-Test-Scenario (real HMRC data after live submit).
  // Optional STATEFUL when HMRC_SANDBOX_STATEFUL=true and Test Support business is used.
  let scenario: string | undefined;
  if (sandbox) {
    scenario = wantStatefulSandbox() ? "STATEFUL" : "CONSOLIDATED_EXPENSES";
  }

  const result = await hmrcApiRequest<HmrcCumulativeRetrieved>({
    userId: input.userId,
    request: input.request,
    path,
    method: "GET",
    fraudContext: input.fraudContext,
    userLoginId: input.userLoginId,
    accept: "application/vnd.hmrc.5.0+json",
    govTestScenario: scenario,
  });

  if (!result.ok) {
    return {
      error: formatHmrcError(result.error.code, result.error.message),
      status: result.error.status,
    };
  }

  return { summary: result.data };
}
