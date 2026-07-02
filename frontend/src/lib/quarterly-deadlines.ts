import { getUkTaxYearQuarters, type MtdQuarter } from "@/lib/mtd-dashboard";

export type SubmissionPeriod = {
  periodFrom: Date;
  periodTo: Date;
};

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function daysUntilDeadline(from: Date, deadline: Date): number {
  const ms = startOfDay(deadline).getTime() - startOfDay(from).getTime();
  return Math.ceil(ms / 86_400_000);
}

function periodsOverlap(aFrom: Date, aTo: Date, bFrom: Date, bTo: Date): boolean {
  return aFrom.getTime() <= bTo.getTime() && aTo.getTime() >= bFrom.getTime();
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

function quarterIsSubmitted(submissions: SubmissionPeriod[], quarter: MtdQuarter): boolean {
  return submissions.some((s) => periodsOverlap(s.periodFrom, s.periodTo, quarter.from, quarter.to));
}

function findQuarterByDeadline(quarters: MtdQuarter[], deadline: Date): MtdQuarter | undefined {
  const key = startOfDay(deadline).getTime();
  return quarters.find((q) => startOfDay(q.deadline).getTime() === key);
}

/** Next quarterly HMRC deadline the user still needs to meet. */
export function resolveNextQuarterlyDeadline(
  submissions: SubmissionPeriod[],
  now = new Date(),
): { deadline: Date; quarter: MtdQuarter; daysUntilDeadline: number } | null {
  const quarters = getUkTaxYearQuarters(now);
  const currentQuarter = getCurrentQuarter(now);

  const endedQuarters = quarters.filter((q) => q.to.getTime() < now.getTime());
  const pendingQuarter = endedQuarters.find((q) => !quarterIsSubmitted(submissions, q));

  const targetQuarter = pendingQuarter ?? currentQuarter;
  if (quarterIsSubmitted(submissions, targetQuarter)) {
    const idx = quarters.findIndex((q) => q.label === targetQuarter.label);
    const upcoming = quarters.slice(idx + 1).find((q) => !quarterIsSubmitted(submissions, q));
    if (!upcoming) return null;
    return {
      deadline: upcoming.deadline,
      quarter: upcoming,
      daysUntilDeadline: daysUntilDeadline(now, upcoming.deadline),
    };
  }

  return {
    deadline: targetQuarter.deadline,
    quarter: targetQuarter,
    daysUntilDeadline: daysUntilDeadline(now, targetQuarter.deadline),
  };
}

export function deadlineDateOnly(deadline: Date): Date {
  return startOfDay(deadline);
}

/** True when today is 5 or 1 days before any UK quarterly HMRC deadline. */
export function isAnyQuarterlyReminderDay(now = new Date()): boolean {
  const years = [now.getFullYear(), now.getFullYear() + 1];
  for (const year of years) {
    const quarters = getUkTaxYearQuarters(new Date(year, 5, 1));
    for (const q of quarters) {
      const days = daysUntilDeadline(now, q.deadline);
      if (days === 5 || days === 1) return true;
    }
  }
  return false;
}

export { findQuarterByDeadline, quarterIsSubmitted };
