import { prisma } from "@/lib/db";
import { getActiveBusinessContext } from "@/lib/active-business";
import { getHmrcConnectionStatus } from "@/lib/hmrc-connection-server";
import { isHmrcSandboxFilingEnabled } from "@/lib/hmrc-filing-status";
import { resolveQuarterlySubmitWindow } from "@/lib/quarterly-submit-window";
import { getCurrentQuarter, getUkTaxYearQuarters, type MtdQuarter } from "@/lib/mtd-quarters";
import { getTaxIdsStatus } from "@/lib/tax-ids-server";
import { getBusinessCount, getUserPlan } from "@/lib/subscription-server";

export type MtdStatus = "not_started" | "on_track" | "action_needed" | "overdue";

export type { MtdQuarter };
export { getCurrentQuarter, getUkTaxYearQuarters };

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
  activeBusinessId: string | null;
  activeBusinessName: string | null;
  activeBusinessCategory: string | null;
  canSwitchBusiness: boolean;
  hmrcConnected: boolean;
  activeBusinessHmrcId: string | null;
  hmrcSandboxReady: boolean;
  anyBusinessHmrcLinked: boolean;
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
    activeBusinessId: null,
    activeBusinessName: null,
    activeBusinessCategory: null,
    canSwitchBusiness: false,
    hmrcConnected: false,
    activeBusinessHmrcId: null,
    hmrcSandboxReady: false,
    anyBusinessHmrcLinked: false,
  };
}

export async function getMtdDashboardSnapshot(
  userId: string,
  preferredBusinessId?: string | null,
): Promise<MtdDashboardSnapshot> {
  const now = new Date();
  const currentQuarter = getCurrentQuarter(now);
  const quarters = getUkTaxYearQuarters(now);

  const [plan, businessCount, businessContext, receiptCount, taxIds, hmrcConnection] = await Promise.all([
    getUserPlan(userId),
    getBusinessCount(userId),
    getActiveBusinessContext(userId, preferredBusinessId),
    prisma.receipt.count({ where: { userId } }),
    getTaxIdsStatus(userId),
    getHmrcConnectionStatus(userId),
  ]);

  const activeBusiness = businessContext.activeBusiness;
  const activeCategory = activeBusiness?.category ?? null;
  const hmrcConnected = hmrcConnection.connected;
  const activeBusinessHmrcId = activeBusiness?.hmrcBusinessId ?? null;
  const anyBusinessHmrcLinked = businessContext.businesses.some((b) => Boolean(b.hmrcBusinessId));

  const submissionWhere = activeBusiness
    ? {
        userId,
        OR: [
          { businessId: activeBusiness.id },
          ...(activeCategory ? [{ businessId: null, trade: activeCategory }] : []),
        ],
      }
    : { userId };

  const submissions = await prisma.submission.findMany({
    where: submissionWhere,
    select: {
      periodFrom: true,
      periodTo: true,
      totalIncomeGbp: true,
      totalExpensesGbp: true,
      netProfitGbp: true,
      submittedAt: true,
      submissionType: true,
      status: true,
    },
    orderBy: { submittedAt: "desc" },
  });

  // Dashboard money and quarter progress come from monthly records only.
  // HMRC quarterly sandbox rows store cumulative totals and must not be summed again.
  const monthlySubmissions = submissions.filter(
    (s) => s.submissionType === "monthly_return" || s.status === "practice_saved",
  );

  const hasPlan = Boolean(plan);
  const hasBusiness = businessCount > 0;
  const hasTaxIds = taxIds.complete;
  const hmrcSandboxReady = hmrcConnected && hasTaxIds && Boolean(activeBusinessHmrcId);
  const quarterlyWindow = resolveQuarterlySubmitWindow(now);

  const quarterSubmissions = monthlySubmissions.filter((s) =>
    periodsOverlap(s.periodFrom, s.periodTo, currentQuarter.from, currentQuarter.to),
  );

  const quarterIncomeGbp = quarterSubmissions.reduce((sum, s) => sum + s.totalIncomeGbp, 0);
  const quarterExpensesGbp = quarterSubmissions.reduce((sum, s) => sum + s.totalExpensesGbp, 0);
  const estimatedProfitGbp = quarterIncomeGbp - quarterExpensesGbp;
  const currentQuarterSubmitted = quarterSubmissions.length > 0;

  const endedQuarters = quarters.filter((q) => q.to.getTime() < now.getTime());
  const pendingQuarter = endedQuarters.find(
    (q) =>
      !monthlySubmissions.some((s) => periodsOverlap(s.periodFrom, s.periodTo, q.from, q.to)),
  );

  const nextDeadline = pendingQuarter?.deadline ?? currentQuarter.deadline;
  const daysUntilDeadline = daysUntil(now, nextDeadline);

  let mtdStatus: MtdStatus = "not_started";
  let mtdStatusLabel = "Not started";

  if (monthlySubmissions.length === 0) {
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

  if (!hasPlan) {
    todayMessage = "Choose a subscription plan to get started.";
    todayTone = "info";
  } else if (!hasBusiness) {
    todayMessage = "Select your business and profession to continue setup.";
    todayTone = "info";
  } else if (!hasTaxIds) {
    todayMessage = "Add your UTR and National Insurance number.";
    todayTone = "info";
  } else if (!hmrcConnected) {
    todayMessage = "Connect your HMRC account to link your business.";
    todayTone = "info";
  } else if (!activeBusinessHmrcId) {
    todayMessage = "Link your business to HMRC — this happens automatically when HMRC returns one self-employment business.";
    todayTone = "info";
  } else if (pendingQuarter && now.getTime() > pendingQuarter.deadline.getTime()) {
    todayMessage = `Your ${pendingQuarter.label} update is overdue — submit it as soon as you can.`;
    todayTone = "urgent";
  } else if (pendingQuarter && daysUntilDeadline <= 10) {
    todayMessage = `Quarterly update due in ${daysUntilDeadline} day${daysUntilDeadline === 1 ? "" : "s"}.`;
    todayTone = daysUntilDeadline <= 3 ? "urgent" : "warning";
  } else if (
    hmrcSandboxReady &&
    isHmrcSandboxFilingEnabled() &&
    quarterlyWindow.open &&
    quarterIncomeGbp + quarterExpensesGbp > 0
  ) {
    todayMessage = "Preview and submit your cumulative quarterly update to HMRC sandbox from the card below.";
    todayTone = "info";
  } else if (hmrcSandboxReady && isHmrcSandboxFilingEnabled() && !quarterlyWindow.open) {
    todayMessage = quarterlyWindow.message;
    todayTone = "info";
  } else if (hmrcConnected && anyBusinessHmrcLinked && !activeBusinessHmrcId) {
    todayMessage =
      "This business is not linked to HMRC. Switch to your linked business or link this one on HMRC connect.";
    todayTone = "warning";
  } else if (hasBusiness && receiptCount === 0 && quarterSubmissions.length === 0) {
    todayMessage = "Upload expense records to keep your quarterly summary up to date.";
    todayTone = "info";
  } else if (!currentQuarterSubmitted && quarterIncomeGbp === 0 && quarterExpensesGbp === 0) {
    todayMessage = "Record this quarter’s income and expenses.";
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
    activeBusinessId: activeBusiness?.id ?? null,
    activeBusinessName: activeBusiness?.name ?? null,
    activeBusinessCategory: activeCategory,
    canSwitchBusiness: businessContext.canSwitchBusiness,
    hmrcConnected,
    activeBusinessHmrcId,
    hmrcSandboxReady,
    anyBusinessHmrcLinked,
  };
}

export { formatGbp, formatUkDate };
