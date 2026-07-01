/** Reminder offsets used for monthly records and quarterly HMRC deadlines. */
export const REMINDER_DAYS_BEFORE = [5, 1] as const;
export type ReminderDaysBefore = (typeof REMINDER_DAYS_BEFORE)[number];

export type ReminderKind = "monthly" | "quarterly";
export type ReminderChannel = "sms" | "email";

export function isReminderDay(daysUntil: number): daysUntil is ReminderDaysBefore {
  return (REMINDER_DAYS_BEFORE as readonly number[]).includes(daysUntil);
}

export const MONTHLY_SMS_MESSAGES: Record<ReminderDaysBefore, string> = {
  5: "Your monthly records are due in 5 days. Log income and expenses in SelfSubmit.",
  1: "Reminder: update your monthly records by tomorrow in SelfSubmit.",
};

export const QUARTERLY_SMS_MESSAGES: Record<ReminderDaysBefore, string> = {
  5: "Your quarterly HMRC update is due in 5 days.",
  1: "Final reminder: submit your quarterly update by tomorrow.",
};

export function quarterlyEmailSubject(daysBefore: ReminderDaysBefore): string {
  return daysBefore === 5
    ? "SelfSubmit: quarterly HMRC update due in 5 days"
    : "SelfSubmit: final reminder — quarterly update due tomorrow";
}

export function quarterlyEmailText(daysBefore: ReminderDaysBefore, deadlineLabel: string, submitUrl: string): string {
  const lead =
    daysBefore === 5
      ? `Your quarterly HMRC update for the period ending ${deadlineLabel} is due in 5 days.`
      : `Final reminder: your quarterly HMRC update is due by ${deadlineLabel}.`;
  return `${lead}\n\nSubmit in SelfSubmit: ${submitUrl}\n\nSelfSubmit — MTD record keeping and submissions.`;
}

export function quarterlyEmailHtml(
  daysBefore: ReminderDaysBefore,
  deadlineLabel: string,
  submitUrl: string,
): string {
  const lead =
    daysBefore === 5
      ? `Your quarterly HMRC update is due in <strong>5 days</strong> (${deadlineLabel}).`
      : `Final reminder: submit your quarterly HMRC update by <strong>${deadlineLabel}</strong>.`;
  return `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#0f172a">
<p>${lead}</p>
<p><a href="${submitUrl}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Open your return form</a></p>
<p style="font-size:12px;color:#64748b">SelfSubmit — MTD record keeping and submissions.</p>
</body></html>`;
}
