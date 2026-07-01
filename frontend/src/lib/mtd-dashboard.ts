import { prisma } from "@/lib/db";
import { getTaxIdsStatus } from "@/lib/tax-ids-server";
import { getBusinessCount, getUserPlan } from "@/lib/subscription-server";

export type MtdStatus = "not_started" | "on_track" | "action_needed" | "overdue";

export type MtdQuarter = {
  label: string;
  from: Date;
  to: Date;
  deadline: Date;
};

export type MtdDashboardSnapshot = {
  mtdStatus: MtdStatus;
  mtdStatusLabel: string;
  nextDeadline: Date | null;
  nextDeadlineLabel: string;
  daysUntilDeadline: number | null;
  currentQuarter: MtdQuarter;
  quarterIncomeGbp: number;
  quarterExpensesGbp: number;
  estimatedProfitGbp: number;
  todayMessage: string;
  todayTone: "calm" | "info" | "warning" | "urgent";
  hasPlan: boolean;
  hasBusiness: boolean;
  hasTaxIds: boolean;
  currentQuarterSubmitted: boolean;
  receiptCount: number;
};

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysUntil(from: Date, to: Date): number {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.ceil(ms / 86_400_000);
}

function formatUkDate(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(d);
}

function formatGbp(amount: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);
}

/** UK tax year quarters for MTD (6 Apr start). Deadline = period end + 1 month + 7 days. */
export function getUkTaxYearQuarters(reference = new Date()): MtdQuarter[] {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const day = reference.getDate();
  const taxYearStartYear = month > 3 || (month === 3 && day >= 6) ? year : year - 1;

  const mk = (fromY: number, fromM: number, fromD: number, toY: number, toM: number, toD: number, label: string) => {
    const from = new Date(fromY, fromM, fromD);
    const to = new Date(toY, toM, toD);
    const deadline = new Date(toY, toM, toD);
    deadline.setMonth(deadline.getMonth() + 1);
    deadline.setDate(deadline.getDate() + 7);
    return { label, from, to, deadline };
  };

  return [
    mk(taxYearStartYear, 3, 6, taxYearStartYear, 6, 5, "Apr–Jul"),
    mk(taxYearStartYear, 6, 6, taxYearStartYear, 9, 5, "Jul–Oct"),
    mk(taxYearStartYear, 9, 6, taxYearStartYear + 1, 0, 5, "Oct–Jan"),
    mk(taxYearStartYear + 1, 0, 6, taxYearStartYear + 1, 3, 5, "Jan–Apr"),
  ];
}

function getCurrentQuarter(reference = new Date()): MtdQuarter {
  const quarters = getUkTaxYearQuarters(reference);
  const now = reference.getTime();
  for (const q of quarters) {
    if (now >= q.from.getTime() && now <= q.to.getTime() + 86_400_000) {
      return q;
    }
  }
  return quarters[quarters.length - 1];
}

function periodsOverlap(
  aFrom: Date,
  aTo: Date,
  bFrom: Date,
  bTo: Date,
): boolean {
  return aFrom.getTime() <= bTo.getTime() && aTo.getTime() >= bFrom.getTime();
}

export function emptyMtdDashboardSnapshot(reference = new Date()): MtdDashboardSnapshot {
  const currentQuarter = getCurrentQuarter(reference);
  return {
    mtdStatus: "not_started",
    mtdStatusLabel: "Not started",
    nextDeadline: currentQuarter.deadline,
    nextDeadlineLabel: formatUkDate(currentQuarter.deadline),
    daysUntilDeadline: daysUntil(reference, currentQuarter.deadline),
    currentQuarter,
    quarterIncomeGbp: 0,
    quarterExpensesGbp: 0,
    estimatedProfitGbp: 0,
    todayMessage: "Dashboard data is temporarily unavailable. Please refresh in a moment.",
    todayTone: "info",
    hasPlan: false,
    hasBusiness: false,
    hasTaxIds: false,
    currentQuarterSubmitted: false,
    receiptCount: 0,
  };
}

export async function getMtdDashboardSnapshot(userId: string): Promise<MtdDashboardSnapshot> {
  const now = new Date();
  const currentQuarter = getCurrentQuarter(now);
  const quarters = getUkTaxYearQuarters(now);

  const [plan, businessCount, submissions, receiptCount, taxIds] = await Promise.all([
    getUserPlan(userId),
    getBusinessCount(userId),
    prisma.submission.findMany({
      where: { userId },
      select: {
        periodFrom: true,
        periodTo: true,
        totalIncomeGbp: true,
        totalExpensesGbp: true,
        netProfitGbp: true,
        submittedAt: true,
      },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.receipt.count({ where: { userId } }),
    getTaxIdsStatus(userId),
  ]);

  const hasPlan = Boolean(plan);
  const hasBusiness = businessCount > 0;
  const hasTaxIds = taxIds.complete;

  const quarterSubmissions = submissions.filter((s) =>
    periodsOverlap(s.periodFrom, s.periodTo, currentQuarter.from, currentQuarter.to),
  );

  const quarterIncomeGbp = quarterSubmissions.reduce((sum, s) => sum + s.totalIncomeGbp, 0);
  const quarterExpensesGbp = quarterSubmissions.reduce((sum, s) => sum + s.totalExpensesGbp, 0);
  const estimatedProfitGbp = quarterIncomeGbp - quarterExpensesGbp;
  const currentQuarterSubmitted = quarterSubmissions.length > 0;

  const endedQuarters = quarters.filter((q) => q.to.getTime() < now.getTime());
  const pendingQuarter = endedQuarters.find(
    (q) =>
      !submissions.some((s) => periodsOverlap(s.periodFrom, s.periodTo, q.from, q.to)),
  );

  const nextDeadline = pendingQuarter?.deadline ?? currentQuarter.deadline;
  const daysUntilDeadline = daysUntil(now, nextDeadline);

  let mtdStatus: MtdStatus = "not_started";
  let mtdStatusLabel = "Not started";

  if (submissions.length === 0) {
    mtdStatus = "not_started";
    mtdStatusLabel = "Not started";
  } else if (pendingQuarter && now.getTime() > pendingQuarter.deadline.getTime()) {
    mtdStatus = "overdue";
    mtdStatusLabel = "Update overdue";
  } else if (pendingQuarter && daysUntilDeadline <= 14) {
    mtdStatus = "action_needed";
    mtdStatusLabel = "Action needed";
  } else if (currentQuarterSubmitted) {
    mtdStatus = "on_track";
    mtdStatusLabel = "On track";
  } else {
    mtdStatus = "on_track";
    mtdStatusLabel = "In progress";
  }

  let todayMessage = "No action required today.";
  let todayTone: MtdDashboardSnapshot["todayTone"] = "calm";

  if (!hasTaxIds) {
    todayMessage = "Add your UTR and National Insurance number to continue.";
    todayTone = "info";
  } else if (!hasPlan) {
    todayMessage = "Choose a subscription plan to get started.";
    todayTone = "info";
  } else if (!hasBusiness) {
    todayMessage = "Select your profession to unlock your income and expense form.";
    todayTone = "info";
  } else if (pendingQuarter && now.getTime() > pendingQuarter.deadline.getTime()) {
    todayMessage = `Your ${pendingQuarter.label} update is overdue — submit it as soon as you can.`;
    todayTone = "urgent";
  } else if (pendingQuarter && daysUntilDeadline <= 10) {
    todayMessage = `Quarterly update due in ${daysUntilDeadline} day${daysUntilDeadline === 1 ? "" : "s"}.`;
    todayTone = daysUntilDeadline <= 3 ? "urgent" : "warning";
  } else if (hasBusiness && receiptCount === 0 && quarterSubmissions.length === 0) {
    todayMessage = "Upload expense records to keep your quarterly summary up to date.";
    todayTone = "info";
  } else if (!currentQuarterSubmitted && quarterIncomeGbp === 0 && quarterExpensesGbp === 0) {
    todayMessage = "Add this quarter's income and expenses when you're ready.";
    todayTone = "info";
  }

  const nextDeadlineLabel = nextDeadline ? formatUkDate(nextDeadline) : "—";

  return {
    mtdStatus,
    mtdStatusLabel,
    nextDeadline,
    nextDeadlineLabel,
    daysUntilDeadline,
    currentQuarter,
    quarterIncomeGbp,
    quarterExpensesGbp,
    estimatedProfitGbp,
    todayMessage,
    todayTone,
    hasPlan,
    hasBusiness,
    hasTaxIds,
    currentQuarterSubmitted,
    receiptCount,
  };
}

export { formatGbp, formatUkDate };
