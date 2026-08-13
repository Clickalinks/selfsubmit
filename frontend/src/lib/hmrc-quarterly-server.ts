import { prisma } from "@/lib/db";
import {
  retrieveHmrcCumulativeQuarterlyUpdate,
  submitHmrcCumulativeQuarterlyUpdate,
  type HmrcCumulativeRetrieved,
} from "@/lib/hmrc-cumulative-submit";
import { getHmrcConnectionStatus } from "@/lib/hmrc-connection-server";
import { isHmrcSandboxFilingEnabled } from "@/lib/hmrc-filing-status";
import type { HmrcFraudClientContext } from "@/lib/hmrc-fraud-context";
import { buildQuarterlyPreview, type QuarterlyPreview } from "@/lib/hmrc-quarterly-mapper";
import { currentUkTaxYearLabel } from "@/lib/hmrc-tax-year";
import { assertQuarterlySubmitWindowOpen } from "@/lib/quarterly-submit-window";
import { getDecryptedTaxIds } from "@/lib/tax-ids-server";

export async function assertSandboxQuarterlyReady(
  userId: string,
  businessId: string,
): Promise<{ nino: string; hmrcBusinessId: string; businessCategory: string }> {
  if (!isHmrcSandboxFilingEnabled()) {
    throw new Error("HMRC sandbox filing is not enabled on this server.");
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
    select: { hmrcBusinessId: true, category: true },
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
  };
}

export async function getSandboxQuarterlyPreview(
  userId: string,
  businessId: string,
  periodEndDate?: string,
): Promise<QuarterlyPreview> {
  await assertSandboxQuarterlyReady(userId, businessId);
  const window = assertQuarterlySubmitWindowOpen(undefined, { sandboxTesting: true });
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
  const window = assertQuarterlySubmitWindowOpen(undefined, { sandboxTesting: true });
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
      templateId: "hmrc_sandbox_quarterly",
      submissionType: "quarterly_hmrc_sandbox",
      status: "sandbox_submitted",
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
      hmrcMessage: `Submitted to HMRC sandbox (cumulative quarterly update).${retrieveNote}`,
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
    fraudContext: input.fraudContext,
    userLoginId: input.userLoginId,
  });

  if ("error" in retrieved) {
    throw new Error(retrieved.error);
  }

  return { taxYear, summary: retrieved.summary };
}
