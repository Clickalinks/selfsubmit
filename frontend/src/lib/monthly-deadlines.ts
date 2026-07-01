import { daysUntilDeadline, deadlineDateOnly } from "@/lib/quarterly-deadlines";

export type SubmissionPeriod = {
  periodFrom: Date;
  periodTo: Date;
};

function lastDayOfMonth(year: number, monthIndex: number): Date {
  return new Date(year, monthIndex + 1, 0);
}

function periodsOverlap(aFrom: Date, aTo: Date, bFrom: Date, bTo: Date): boolean {
  return aFrom.getTime() <= bTo.getTime() && aTo.getTime() >= bFrom.getTime();
}

/** Calendar month-end is the monthly record deadline for all users. */
export function resolveCurrentMonthRecordDeadline(now = new Date()): {
  deadline: Date;
  daysUntilDeadline: number;
  monthLabel: string;
} {
  const year = now.getFullYear();
  const month = now.getMonth();
  const deadline = lastDayOfMonth(year, month);
  const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(
    new Date(year, month, 1),
  );
  return {
    deadline,
    daysUntilDeadline: daysUntilDeadline(now, deadline),
    monthLabel,
  };
}

export function hasMonthlyRecordsForMonth(
  submissions: SubmissionPeriod[],
  year: number,
  monthIndex: number,
): boolean {
  const from = new Date(year, monthIndex, 1);
  const to = lastDayOfMonth(year, monthIndex);
  return submissions.some((s) => periodsOverlap(s.periodFrom, s.periodTo, from, to));
}

export { deadlineDateOnly };
