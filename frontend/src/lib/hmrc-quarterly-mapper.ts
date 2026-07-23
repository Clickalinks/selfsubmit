import { prisma } from "@/lib/db";
import { currentUkTaxYearLabel, taxYearStartIso } from "@/lib/hmrc-tax-year";
import { getCurrentQuarter } from "@/lib/mtd-dashboard";

export type HmrcCumulativeUpdateBody = {
  periodDates: {
    periodStartDate: string;
    periodEndDate: string;
  };
  periodIncome: {
    turnover: number;
    other: number;
  };
  periodExpenses: {
    consolidatedExpenses: number;
  };
};

export type QuarterlyPreview = {
  taxYear: string;
  periodStartDate: string;
  periodEndDate: string;
  turnover: number;
  otherIncome: number;
  consolidatedExpenses: number;
  netProfit: number;
  monthlyRecordCount: number;
  hmrcPayload: HmrcCumulativeUpdateBody;
};

type StoredPayload = {
  income?: Array<{ amount: string }>;
  expenses?: Array<{ amount: string }>;
  totals?: { incomeGbp?: number; expensesGbp?: number; netProfitGbp?: number };
};

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function parseAmount(value: string | undefined): number {
  const n = Number.parseFloat((value ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function buildQuarterlyPreview(input: {
  userId: string;
  businessId: string;
  periodEndDate?: string;
}): Promise<QuarterlyPreview> {
  const taxYear = currentUkTaxYearLabel();
  const periodStartDate = taxYearStartIso(taxYear);
  const periodEndDate = input.periodEndDate ?? toIsoDate(getCurrentQuarter().to);

  if (periodEndDate < periodStartDate) {
    throw new Error("Invalid cumulative period end date.");
  }

  const business = await prisma.business.findFirst({
    where: { id: input.businessId, userId: input.userId },
    select: { id: true, category: true },
  });
  if (!business) {
    throw new Error("Business not found");
  }

  // Only monthly records feed HMRC cumulative totals — never re-sum prior quarterly submits.
  const submissions = await prisma.submission.findMany({
    where: {
      userId: input.userId,
      OR: [{ businessId: business.id }, { businessId: null, trade: business.category }],
      submissionType: "monthly_return",
      periodFrom: { gte: new Date(`${periodStartDate}T00:00:00.000Z`) },
      periodTo: { lte: new Date(`${periodEndDate}T23:59:59.999Z`) },
    },
    select: {
      totalIncomeGbp: true,
      totalExpensesGbp: true,
      netProfitGbp: true,
      payloadJson: true,
    },
  });

  let turnover = 0;
  let otherIncome = 0;
  let consolidatedExpenses = 0;

  for (const row of submissions) {
    turnover += row.totalIncomeGbp;
    consolidatedExpenses += row.totalExpensesGbp;

    try {
      const payload = JSON.parse(row.payloadJson) as StoredPayload;
      if (payload.totals?.incomeGbp !== undefined) {
        // Prefer stored totals when present — already counted above via row totals
      }
      for (const line of payload.income ?? []) {
        void line;
      }
      for (const line of payload.expenses ?? []) {
        void parseAmount(line.amount);
      }
    } catch {
      // Ignore malformed payload — row totals still count
    }
  }

  turnover = roundMoney(turnover);
  otherIncome = roundMoney(otherIncome);
  consolidatedExpenses = roundMoney(consolidatedExpenses);
  const netProfit = roundMoney(turnover + otherIncome - consolidatedExpenses);

  const hmrcPayload: HmrcCumulativeUpdateBody = {
    periodDates: {
      periodStartDate,
      periodEndDate,
    },
    periodIncome: {
      turnover,
      other: otherIncome,
    },
    periodExpenses: {
      consolidatedExpenses,
    },
  };

  return {
    taxYear,
    periodStartDate,
    periodEndDate,
    turnover,
    otherIncome,
    consolidatedExpenses,
    netProfit,
    monthlyRecordCount: submissions.length,
    hmrcPayload,
  };
}
