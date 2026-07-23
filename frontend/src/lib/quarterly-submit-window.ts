import { getUkTaxYearQuarters, type MtdQuarter } from "@/lib/mtd-quarters";

/** Open HMRC quarterly submit from 14 days before quarter end through the HMRC deadline. */
export const QUARTERLY_SUBMIT_APPROACH_DAYS = 14;

export type QuarterlySubmitWindow = {
  open: boolean;
  quarter: MtdQuarter | null;
  /** ISO date (YYYY-MM-DD) for period end when submit is open */
  periodEndDate: string | null;
  /** Short user-facing explanation */
  message: string;
};

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatUk(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

function windowStart(quarter: MtdQuarter): Date {
  const start = startOfDay(quarter.to);
  start.setDate(start.getDate() - QUARTERLY_SUBMIT_APPROACH_DAYS);
  return start;
}

function isInSubmitWindow(quarter: MtdQuarter, now: Date): boolean {
  const t = startOfDay(now).getTime();
  const from = windowStart(quarter).getTime();
  const to = startOfDay(quarter.deadline).getTime();
  return t >= from && t <= to;
}

/**
 * Whether the user may preview/submit a cumulative quarterly update to HMRC.
 * Mid-quarter: keep adding monthly records only.
 */
export function resolveQuarterlySubmitWindow(now = new Date()): QuarterlySubmitWindow {
  const quarters = getUkTaxYearQuarters(now);
  const open = quarters.filter((q) => isInSubmitWindow(q, now));

  if (open.length > 0) {
    // Prefer the latest open window (most recent quarter due)
    const quarter = open[open.length - 1];
    return {
      open: true,
      quarter,
      periodEndDate: toIsoDate(quarter.to),
      message: `Quarterly HMRC submit is open for ${quarter.label} (period ending ${formatUk(quarter.to)}, deadline ${formatUk(quarter.deadline)}).`,
    };
  }

  // Next upcoming approach window
  const upcoming = quarters.find((q) => startOfDay(now).getTime() < windowStart(q).getTime());
  if (upcoming) {
    return {
      open: false,
      quarter: upcoming,
      periodEndDate: null,
      message: `Keep saving monthly records. Quarterly HMRC submit opens from ${formatUk(windowStart(upcoming))} (near the end of ${upcoming.label}).`,
    };
  }

  return {
    open: false,
    quarter: null,
    periodEndDate: null,
    message: "Keep saving monthly records. Quarterly HMRC submit opens near the end of each tax quarter.",
  };
}

export function assertQuarterlySubmitWindowOpen(now = new Date()): QuarterlySubmitWindow {
  const window = resolveQuarterlySubmitWindow(now);
  if (!window.open) {
    throw new Error(window.message);
  }
  return window;
}
