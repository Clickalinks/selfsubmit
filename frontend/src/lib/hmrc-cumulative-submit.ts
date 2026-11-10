import { hmrcApiRequest } from "@/lib/hmrc-api-client";
import { getHmrcConfig } from "@/lib/hmrc-config";
import { HMRC_LIVE_FILING_ENABLED } from "@/lib/hmrc-filing-status";
import type { HmrcFraudClientContext } from "@/lib/hmrc-fraud-context";
import type { HmrcIncomeSource } from "@/lib/hmrc-income-source";
import {
  isUkPropertyCumulativeBody,
  type HmrcCumulativeUpdateBody,
} from "@/lib/hmrc-quarterly-mapper";

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

type PropertyCumulativeRetrieved = {
  fromDate?: string;
  toDate?: string;
  ukProperty?: {
    income?: {
      periodAmount?: number;
      otherIncome?: number;
    };
    expenses?: {
      consolidatedExpenses?: number;
    };
  };
};

function selfEmploymentCumulativePath(nino: string, businessId: string, taxYear: string): string {
  return `/individuals/business/self-employment/${encodeURIComponent(nino)}/${encodeURIComponent(businessId)}/cumulative/${encodeURIComponent(taxYear)}`;
}

function ukPropertyCumulativePath(nino: string, businessId: string, taxYear: string): string {
  return `/individuals/business/property/uk/${encodeURIComponent(nino)}/${encodeURIComponent(businessId)}/cumulative/${encodeURIComponent(taxYear)}`;
}

function acceptForSource(source: HmrcIncomeSource): string {
  return source === "uk-property" ? "application/vnd.hmrc.6.0+json" : "application/vnd.hmrc.5.0+json";
}

function pathForSource(source: HmrcIncomeSource, nino: string, businessId: string, taxYear: string): string {
  return source === "uk-property"
    ? ukPropertyCumulativePath(nino, businessId, taxYear)
    : selfEmploymentCumulativePath(nino, businessId, taxYear);
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

function periodReference(body: HmrcCumulativeUpdateBody): string {
  if (isUkPropertyCumulativeBody(body)) {
    return `${body.fromDate}_${body.toDate}`;
  }
  return `${body.periodDates.periodStartDate}_${body.periodDates.periodEndDate}`;
}

function normalizePropertyRetrieved(data: PropertyCumulativeRetrieved): HmrcCumulativeRetrieved {
  return {
    periodDates: {
      periodStartDate: data.fromDate ?? "",
      periodEndDate: data.toDate ?? "",
    },
    periodIncome: {
      turnover: data.ukProperty?.income?.periodAmount,
      other: data.ukProperty?.income?.otherIncome,
    },
    periodExpenses: {
      consolidatedExpenses: data.ukProperty?.expenses?.consolidatedExpenses,
    },
  };
}

export async function submitHmrcCumulativeQuarterlyUpdate(input: {
  userId: string;
  request: Request;
  nino: string;
  businessId: string;
  taxYear: string;
  incomeSource: HmrcIncomeSource;
  body: HmrcCumulativeUpdateBody;
  fraudContext?: HmrcFraudClientContext | null;
  userLoginId?: string | null;
}): Promise<{ reference: string } | { error: string }> {
  if (input.incomeSource === "uk-property" && !isUkPropertyCumulativeBody(input.body)) {
    return { error: "UK property submit received a self-employment payload." };
  }
  if (input.incomeSource === "self-employment" && isUkPropertyCumulativeBody(input.body)) {
    return { error: "Self-employment submit received a UK property payload." };
  }

  const nino = input.nino.replace(/\s/g, "").toUpperCase();
  const path = pathForSource(input.incomeSource, nino, input.businessId, input.taxYear);
  const sandbox = isSandboxApiBase();

  if (!sandbox && !HMRC_LIVE_FILING_ENABLED) {
    return { error: "Live HMRC filing is not enabled." };
  }

  const result = await hmrcApiRequest<Record<string, never>>({
    userId: input.userId,
    request: input.request,
    path,
    method: "PUT",
    body: input.body,
    fraudContext: input.fraudContext,
    userLoginId: input.userLoginId,
    accept: acceptForSource(input.incomeSource),
    govTestScenario: sandbox && wantStatefulSandbox() ? "STATEFUL" : undefined,
  });

  if (!result.ok) {
    return { error: formatHmrcError(result.error.code, result.error.message) };
  }

  return { reference: periodReference(input.body) };
}

/** Retrieve the cumulative period summary held by HMRC for this tax year (In-Year checklist). */
export async function retrieveHmrcCumulativeQuarterlyUpdate(input: {
  userId: string;
  request: Request;
  nino: string;
  businessId: string;
  taxYear: string;
  incomeSource: HmrcIncomeSource;
  fraudContext?: HmrcFraudClientContext | null;
  userLoginId?: string | null;
}): Promise<{ summary: HmrcCumulativeRetrieved } | { error: string; status?: number }> {
  const nino = input.nino.replace(/\s/g, "").toUpperCase();
  const path = pathForSource(input.incomeSource, nino, input.businessId, input.taxYear);
  const sandbox = isSandboxApiBase();

  let scenario: string | undefined;
  if (sandbox) {
    if (wantStatefulSandbox()) {
      scenario = "STATEFUL";
    } else if (input.incomeSource === "self-employment") {
      scenario = "CONSOLIDATED_EXPENSES";
    }
  }

  const result = await hmrcApiRequest<HmrcCumulativeRetrieved & PropertyCumulativeRetrieved>({
    userId: input.userId,
    request: input.request,
    path,
    method: "GET",
    fraudContext: input.fraudContext,
    userLoginId: input.userLoginId,
    accept: acceptForSource(input.incomeSource),
    govTestScenario: scenario,
  });

  if (!result.ok) {
    return {
      error: formatHmrcError(result.error.code, result.error.message),
      status: result.error.status,
    };
  }

  if (input.incomeSource === "uk-property") {
    return { summary: normalizePropertyRetrieved(result.data) };
  }

  return { summary: result.data };
}
