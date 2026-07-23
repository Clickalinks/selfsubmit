/** Allowed monthly record periods: current calendar month + previous month only. */

function lastDayOfMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export type MonthlyPeriodOption = {
  label: string;
  from: string;
  to: string;
};

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

  return [
    { label: "This month", from: thisFrom, to: thisTo },
    { label: "Last month", from: lastFrom, to: lastTo },
  ];
}

export function isAllowedMonthlyRecordPeriod(
  periodFrom: string,
  periodTo: string,
  now = new Date(),
): boolean {
  return getAllowedMonthlyPeriods(now).some((p) => p.from === periodFrom && p.to === periodTo);
}

export function defaultAllowedMonthlyPeriod(now = new Date()): MonthlyPeriodOption {
  return getAllowedMonthlyPeriods(now)[0];
}
