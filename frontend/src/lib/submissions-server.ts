import { prisma } from "@/lib/db";
import { submitToHmrcMock } from "@/lib/hmrc-mock";
import { getTemplateIdForProfession, isKnownProfession } from "@/data/expenseCategories";

export type SubmissionLinePayload = {
  id: string;
  label: string;
  amount: string;
};

export type CreateSubmissionInput = {
  businessId?: string;
  trade: string;
  periodFrom: string;
  periodTo: string;
  templateId?: string;
  vehicleCostMethod?: string | null;
  income: SubmissionLinePayload[];
  expenses: SubmissionLinePayload[];
  totals: {
    incomeGbp: number;
    expensesGbp: number;
    netProfitGbp: number;
  };
  receiptIds?: string[];
  receiptCapture?: unknown;
  cis?: unknown;
  simplifiedMileageInputs?: unknown;
};

function parseIsoDate(iso: string): Date {
  const d = new Date(`${iso}T12:00:00.000Z`);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid date");
  return d;
}

export async function createMonthlySubmission(userId: string, input: CreateSubmissionInput) {
  const trade = input.trade.trim();
  if (!isKnownProfession(trade)) {
    throw new Error("Invalid business type");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.periodFrom) || !/^\d{4}-\d{2}-\d{2}$/.test(input.periodTo)) {
    throw new Error("Invalid period dates");
  }
  if (input.periodFrom > input.periodTo) {
    throw new Error("Period end must be on or after start");
  }

  const templateId = input.templateId ?? getTemplateIdForProfession(trade);

  let business = null;
  if (input.businessId?.trim()) {
    business = await prisma.business.findFirst({
      where: { userId, id: input.businessId.trim() },
    });
    if (!business) {
      throw new Error("Business not found");
    }
  } else {
    business = await prisma.business.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  }

  if (business?.category && business.category !== trade) {
    throw new Error("Profession is locked to your registered business type.");
  }

  const hmrc = submitToHmrcMock({
    trade,
    periodFrom: input.periodFrom,
    periodTo: input.periodTo,
    netProfitGbp: input.totals.netProfitGbp,
  });

  const payload = {
    trade,
    periodFrom: input.periodFrom,
    periodTo: input.periodTo,
    templateId,
    vehicleCostMethod: input.vehicleCostMethod ?? null,
    income: input.income,
    expenses: input.expenses,
    totals: input.totals,
    receiptCapture: input.receiptCapture ?? null,
    cis: input.cis ?? null,
    simplifiedMileageInputs: input.simplifiedMileageInputs ?? null,
  };

  const receiptIds = input.receiptIds ?? [];

  const submission = await prisma.$transaction(async (tx) => {
    const row = await tx.submission.create({
      data: {
        userId,
        businessId: business?.id ?? null,
        trade,
        periodFrom: parseIsoDate(input.periodFrom),
        periodTo: parseIsoDate(input.periodTo),
        templateId,
        submissionType: "monthly_return",
        status: "practice_saved",
        payloadJson: JSON.stringify(payload),
        totalIncomeGbp: input.totals.incomeGbp,
        totalExpensesGbp: input.totals.expensesGbp,
        netProfitGbp: input.totals.netProfitGbp,
        hmrcReference: hmrc.reference,
        hmrcStatus: hmrc.status,
        hmrcMessage: hmrc.message,
      },
    });

    if (receiptIds.length > 0) {
      await tx.receipt.updateMany({
        where: { userId, id: { in: receiptIds } },
        data: { submissionId: row.id },
      });
    }

    return row;
  });

  return submission;
}

export async function listSubmissionsForUser(userId: string) {
  return prisma.submission.findMany({
    where: { userId },
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      trade: true,
      periodFrom: true,
      periodTo: true,
      status: true,
      totalIncomeGbp: true,
      totalExpensesGbp: true,
      netProfitGbp: true,
      hmrcReference: true,
      hmrcStatus: true,
      submittedAt: true,
    },
  });
}

export async function getSubmissionForUser(userId: string, submissionId: string) {
  return prisma.submission.findFirst({
    where: { id: submissionId, userId },
    include: {
      receipts: {
        orderBy: { uploadedAt: "desc" },
        select: {
          id: true,
          fileName: true,
          mimeType: true,
          title: true,
          amountGbp: true,
          uploadedAt: true,
        },
      },
    },
  });
}
