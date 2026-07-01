import { prisma } from "@/lib/db";
import { getTaxIdsStatus } from "@/lib/tax-ids-server";
import {
  deadlineDateOnly,
  daysUntilDeadline,
  resolveNextQuarterlyDeadline,
} from "@/lib/quarterly-deadlines";
import { getBusinessCount, getUserPlan } from "@/lib/subscription-server";
import { isTwilioConfigured, sendSms } from "@/lib/twilio-sms";

export const REMINDER_DAYS = [30, 14, 7, 1] as const;
export type ReminderDaysBefore = (typeof REMINDER_DAYS)[number];

export const REMINDER_MESSAGES: Record<ReminderDaysBefore, string> = {
  30: "Your quarterly submission is due in 30 days.",
  14: "Two weeks remaining to submit.",
  7: "One week left.",
  1: "Final reminder: Submit by tomorrow.",
};

export type ReminderRunSummary = {
  scanned: number;
  eligible: number;
  sent: number;
  skipped: number;
  failed: number;
  errors: string[];
};

function isReminderDay(daysUntil: number): daysUntil is ReminderDaysBefore {
  return (REMINDER_DAYS as readonly number[]).includes(daysUntil);
}

export async function runQuarterlySmsReminders(now = new Date()): Promise<ReminderRunSummary> {
  const summary: ReminderRunSummary = {
    scanned: 0,
    eligible: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  if (!isTwilioConfigured()) {
    summary.errors.push("Twilio is not configured.");
    return summary;
  }

  const users = await prisma.user.findMany({
    where: {
      profile: { isNot: null },
      plan: { not: null },
    },
    select: {
      id: true,
      profile: {
        select: {
          phone: true,
        },
      },
      submissions: {
        select: {
          periodFrom: true,
          periodTo: true,
        },
      },
    },
  });

  summary.scanned = users.length;

  for (const user of users) {
    const phone = user.profile?.phone?.trim();
    if (!phone) {
      summary.skipped += 1;
      continue;
    }

    const [plan, businessCount, taxIds] = await Promise.all([
      getUserPlan(user.id),
      getBusinessCount(user.id),
      getTaxIdsStatus(user.id),
    ]);

    if (!plan || businessCount === 0 || !taxIds.complete) {
      summary.skipped += 1;
      continue;
    }

    const target = resolveNextQuarterlyDeadline(user.submissions, now);
    if (!target) {
      summary.skipped += 1;
      continue;
    }

    const { deadline, daysUntilDeadline: daysLeft } = target;
    if (daysLeft < 0 || !isReminderDay(daysLeft)) {
      summary.skipped += 1;
      continue;
    }

    summary.eligible += 1;

    const deadlineDate = deadlineDateOnly(deadline);
    const existing = await prisma.smsReminderLog.findUnique({
      where: {
        userId_deadlineDate_daysBefore: {
          userId: user.id,
          deadlineDate,
          daysBefore: daysLeft,
        },
      },
    });

    if (existing) {
      summary.skipped += 1;
      continue;
    }

    const message = REMINDER_MESSAGES[daysLeft];
    const result = await sendSms(phone, message);

    if (!result.ok) {
      summary.failed += 1;
      summary.errors.push(`User ${user.id}: ${result.error}`);
      continue;
    }

    await prisma.smsReminderLog.create({
      data: {
        userId: user.id,
        deadlineDate,
        daysBefore: daysLeft,
        twilioSid: result.sid,
      },
    });

    summary.sent += 1;
  }

  return summary;
}

/** Exposed for tests and manual dry-run checks. */
export function getReminderMessageForDaysLeft(daysLeft: number): string | null {
  if (!isReminderDay(daysLeft)) return null;
  return REMINDER_MESSAGES[daysLeft];
}

export { daysUntilDeadline, resolveNextQuarterlyDeadline };
