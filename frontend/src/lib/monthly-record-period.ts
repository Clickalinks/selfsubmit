/** Record period presets and validation (no future months; catch-up from last UK tax quarter). */

import { getCurrentQuarter, getUkTaxYearQuarters, type MtdQuarter } from "@/lib/mtd-quarters";

function lastDayOfMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function toIsoFromDate(d: Date): string {
  return toIso(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export type MonthlyPeriodOption = {
  label: string;
  from: string;
  to: string;
};

/** Previous completed UK MTD tax quarter (for catch-up after sign-up). */
export function getLastUkTaxQuarter(now = new Date()): MtdQuarter {
  const quarters = getUkTaxYearQuarters(now);
  const current = getCurrentQuarter(now);
  const idx = quarters.findIndex((q) => q.label === current.label);
  if (idx > 0) return quarters[idx - 1];

  const dayBeforeTaxYear = new Date(quarters[0].from);
  dayBeforeTaxYear.setDate(dayBeforeTaxYear.getDate() - 1);
  const previousTaxYearQuarters = getUkTaxYearQuarters(dayBeforeTaxYear);
  return previousTaxYearQuarters[previousTaxYearQuarters.length - 1];
}

export function getRecordPeriodBounds(now = new Date()): { minFrom: string; maxTo: string } {
  const lastQuarter = getLastUkTaxQuarter(now);
  const y = now.getFullYear();
  const m = now.getMonth();
  return {
    minFrom: toIsoFromDate(lastQuarter.from),
    maxTo: toIso(y, m + 1, lastDayOfMonth(y, m)),
  };
}

export function getAllowedMonthlyPeriods(now = new Date()): MonthlyPeriodOption[] {
  const y = now.getFullYear();
  const m = now.getMonth();
  const thisFrom = toIso(y, m + 1, 1);
  const thisTo = toIso(y, m + 1, lastDayOfMonth(y, m));

  const prev = new Date(y, m - 1, 1);
  const py = prev.getFullYear();
  const pm = prev.getMonth();
  const lastFrom = toIso(py, pm + 1, 1);
  const lastTo = toIso(py, pm + 1, lastDayOfMonth(py, pm));

  const lastQuarter = getLastUkTaxQuarter(now);

  return [
    { label: "This month", from: thisFrom, to: thisTo },
    { label: "Last month", from: lastFrom, to: lastTo },
    {
      label: "Last quarter",
      from: toIsoFromDate(lastQuarter.from),
      to: toIsoFromDate(lastQuarter.to),
    },
  ];
}

/** Valid if dates are ordered and within catch-up window (last UK tax quarter → end of this month). */
export function isAllowedMonthlyRecordPeriod(
  periodFrom: string,
  periodTo: string,
  now = new Date(),
): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(periodFrom) || !/^\d{4}-\d{2}-\d{2}$/.test(periodTo)) {
    return false;
  }
  if (periodFrom > periodTo) return false;
  const { minFrom, maxTo } = getRecordPeriodBounds(now);
  return periodFrom >= minFrom && periodTo <= maxTo;
}

export function defaultAllowedMonthlyPeriod(now = new Date()): MonthlyPeriodOption {
  return getAllowedMonthlyPeriods(now)[0];
}
