import { prisma } from "@/lib/db";
import { submitHmrcCumulativeQuarterlyUpdate } from "@/lib/hmrc-cumulative-submit";
import { getHmrcConnectionStatus } from "@/lib/hmrc-connection-server";
import { isHmrcSandboxFilingEnabled } from "@/lib/hmrc-filing-status";
import type { HmrcFraudClientContext } from "@/lib/hmrc-fraud-context";
import { buildQuarterlyPreview, type QuarterlyPreview } from "@/lib/hmrc-quarterly-mapper";
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
    throw new Error("Connect your HMRC account in Settings first.");
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
    throw new Error("Link this business to HMRC in Settings first.");
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
  return buildQuarterlyPreview({ userId, businessId, periodEndDate });
}

export async function submitSandboxQuarterlyUpdate(input: {
  userId: string;
  request: Request;
  businessId: string;
  periodEndDate?: string;
  fraudContext?: HmrcFraudClientContext | null;
  userLoginId?: string | null;
}): Promise<{ submissionId: string; reference: string; preview: QuarterlyPreview }> {
  const ready = await assertSandboxQuarterlyReady(input.userId, input.businessId);
  const preview = await buildQuarterlyPreview({
    userId: input.userId,
    businessId: input.businessId,
    periodEndDate: input.periodEndDate,
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
      }),
      totalIncomeGbp: preview.turnover + preview.otherIncome,
      totalExpensesGbp: preview.consolidatedExpenses,
      netProfitGbp: preview.netProfit,
      hmrcReference: result.reference,
      hmrcStatus: "accepted",
      hmrcMessage: "Submitted to HMRC sandbox (cumulative quarterly update).",
    },
  });

  return { submissionId: submission.id, reference: result.reference, preview };
}
