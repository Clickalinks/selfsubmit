import { prisma } from "@/lib/db";
import {
  retrieveHmrcCumulativeQuarterlyUpdate,
  submitHmrcCumulativeQuarterlyUpdate,
  type HmrcCumulativeRetrieved,
} from "@/lib/hmrc-cumulative-submit";
import { getHmrcConnectionStatus } from "@/lib/hmrc-connection-server";
import { getHmrcConfig } from "@/lib/hmrc-config";
import { getHmrcFilingMode } from "@/lib/hmrc-filing-status";
import type { HmrcFraudClientContext } from "@/lib/hmrc-fraud-context";
import { resolveHmrcIncomeSource, type HmrcIncomeSource } from "@/lib/hmrc-income-source";
import { buildQuarterlyPreview, type QuarterlyPreview } from "@/lib/hmrc-quarterly-mapper";
import { currentUkTaxYearLabel } from "@/lib/hmrc-tax-year";
import {
  assertQuarterlySubmitWindowOpen,
  resolveQuarterlySubmitWindow,
} from "@/lib/quarterly-submit-window";
import { getDecryptedTaxIds } from "@/lib/tax-ids-server";

export async function assertSandboxQuarterlyReady(
  userId: string,
  businessId: string,
): Promise<{
  nino: string;
  hmrcBusinessId: string;
  businessCategory: string;
  incomeSource: HmrcIncomeSource;
}> {
  const mode = getHmrcFilingMode();
  if (mode === "off") {
    const sandboxApi = getHmrcConfig().apiBase.includes("test-api.service.hmrc.gov.uk");
    throw new Error(
      sandboxApi
        ? "HMRC sandbox filing is not enabled on this server."
        : "Live HMRC filing is not enabled.",
    );
  }

  const sandboxApi = getHmrcConfig().apiBase.includes("test-api.service.hmrc.gov.uk");
  if (mode === "sandbox" && !sandboxApi) {
    throw new Error("Sandbox filing cannot run against the production HMRC API.");
  }
  if (mode === "live" && sandboxApi) {
    throw new Error("Live filing cannot run against the HMRC sandbox API.");
  }

  const connection = await getHmrcConnectionStatus(userId);
  if (!connection.connected) {
    throw new Error("Connect your HMRC account on HMRC connect first.");
  }

  const taxIds = await getDecryptedTaxIds(userId);
  if (!taxIds.niNumber) {
    throw new Error("Add your National Insurance number on the dashboard first.");
  }

  const business = await prisma.business.findFirst({
    where: { id: businessId, userId },
    select: { hmrcBusinessId: true, category: true, hmrcTypeOfBusiness: true },
  });
  if (!business) {
    throw new Error("Business not found");
  }
  if (!business.hmrcBusinessId) {
    throw new Error("Link this business to HMRC on HMRC connect first.");
  }

  return {
    nino: taxIds.niNumber,
    hmrcBusinessId: business.hmrcBusinessId,
    businessCategory: business.category,
    incomeSource: resolveHmrcIncomeSource({
      category: business.category,
      hmrcTypeOfBusiness: business.hmrcTypeOfBusiness,
    }),
  };
}

export async function getSandboxQuarterlyPreview(
  userId: string,
  businessId: string,
  periodEndDate?: string,
): Promise<QuarterlyPreview> {
  await assertSandboxQuarterlyReady(userId, businessId);
  const window = resolveQuarterlySubmitWindow(new Date(), {
    sandboxTesting: getHmrcFilingMode() === "sandbox",
  });
  return buildQuarterlyPreview({
    userId,
    businessId,
    periodEndDate: periodEndDate ?? window.periodEndDate ?? undefined,
  });
}

export async function submitSandboxQuarterlyUpdate(input: {
  userId: string;
  request: Request;
  businessId: string;
  periodEndDate?: string;
  fraudContext?: HmrcFraudClientContext | null;
  userLoginId?: string | null;
}): Promise<{
  submissionId: string;
  reference: string;
  preview: QuarterlyPreview;
  retrieved: HmrcCumulativeRetrieved | null;
}> {
  const ready = await assertSandboxQuarterlyReady(input.userId, input.businessId);
  const mode = getHmrcFilingMode();
  const window = assertQuarterlySubmitWindowOpen(new Date(), { sandboxTesting: mode === "sandbox" });
  const preview = await buildQuarterlyPreview({
    userId: input.userId,
    businessId: input.businessId,
    periodEndDate: input.periodEndDate ?? window.periodEndDate ?? undefined,
  });

  const result = await submitHmrcCumulativeQuarterlyUpdate({
    userId: input.userId,
    request: input.request,
    nino: ready.nino,
    businessId: ready.hmrcBusinessId,
    taxYear: preview.taxYear,
    incomeSource: ready.incomeSource,
    body: preview.hmrcPayload,
    fraudContext: input.fraudContext,
    userLoginId: input.userLoginId,
  });

  if ("error" in result) {
    throw new Error(result.error);
  }

  // In-Year checklist: submit and retrieve. Confirm HMRC holds the cumulative summary.
  const retrieved = await retrieveHmrcCumulativeQuarterlyUpdate({
    userId: input.userId,
    request: input.request,
    nino: ready.nino,
    businessId: ready.hmrcBusinessId,
    taxYear: preview.taxYear,
    incomeSource: ready.incomeSource,
    fraudContext: input.fraudContext,
    userLoginId: input.userLoginId,
  });

  const retrievedSummary = "summary" in retrieved ? retrieved.summary : null;
  const retrieveNote =
    "error" in retrieved
      ? ` Submit succeeded; retrieve returned: ${retrieved.error}`
      : " Retrieved cumulative summary from HMRC after submit.";

  const submission = await prisma.submission.create({
    data: {
      userId: input.userId,
      businessId: input.businessId,
      trade: ready.businessCategory,
      periodFrom: new Date(`${preview.periodStartDate}T12:00:00.000Z`),
      periodTo: new Date(`${preview.periodEndDate}T12:00:00.000Z`),
      templateId: mode === "live" ? "hmrc_quarterly" : "hmrc_sandbox_quarterly",
      submissionType: mode === "live" ? "quarterly_hmrc" : "quarterly_hmrc_sandbox",
      status: mode === "live" ? "hmrc_submitted" : "sandbox_submitted",
      payloadJson: JSON.stringify({
        hmrcPayload: preview.hmrcPayload,
        preview,
        retrievedFromHmrc: retrievedSummary,
      }),
      totalIncomeGbp: preview.turnover + preview.otherIncome,
      totalExpensesGbp: preview.consolidatedExpenses,
      netProfitGbp: preview.netProfit,
      hmrcReference: result.reference,
      hmrcStatus: "accepted",
      hmrcMessage:
        mode === "live"
          ? `Submitted to HMRC (${ready.incomeSource} cumulative quarterly update).${retrieveNote}`
          : `Submitted to HMRC sandbox (${ready.incomeSource} cumulative quarterly update).${retrieveNote}`,
    },
  });

  return {
    submissionId: submission.id,
    reference: result.reference,
    preview,
    retrieved: retrievedSummary,
  };
}

export async function retrieveSandboxQuarterlySummary(input: {
  userId: string;
  request: Request;
  businessId: string;
  taxYear?: string;
  fraudContext?: HmrcFraudClientContext | null;
  userLoginId?: string | null;
}): Promise<{ taxYear: string; summary: HmrcCumulativeRetrieved }> {
  const ready = await assertSandboxQuarterlyReady(input.userId, input.businessId);
  const taxYear = input.taxYear?.trim() || currentUkTaxYearLabel();

  const retrieved = await retrieveHmrcCumulativeQuarterlyUpdate({
    userId: input.userId,
    request: input.request,
    nino: ready.nino,
    businessId: ready.hmrcBusinessId,
    taxYear,
    incomeSource: ready.incomeSource,
    fraudContext: input.fraudContext,
    userLoginId: input.userLoginId,
  });

  if ("error" in retrieved) {
    throw new Error(retrieved.error);
  }

  return { taxYear, summary: retrieved.summary };
}
