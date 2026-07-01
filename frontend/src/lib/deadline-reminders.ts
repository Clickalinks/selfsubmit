import { prisma } from "@/lib/db";
import {
  deadlineDateOnly,
  hasMonthlyRecordsForMonth,
  resolveCurrentMonthRecordDeadline,
} from "@/lib/monthly-deadlines";
import { resolveNextQuarterlyDeadline } from "@/lib/quarterly-deadlines";
import {
  isReminderDay,
  MONTHLY_SMS_MESSAGES,
  QUARTERLY_SMS_MESSAGES,
  quarterlyEmailHtml,
  quarterlyEmailSubject,
  quarterlyEmailText,
  type ReminderChannel,
  type ReminderDaysBefore,
  type ReminderKind,
} from "@/lib/reminder-schedule";
import { isResendConfigured, sendReminderEmail } from "@/lib/reminder-email";
import { appBaseUrl } from "@/lib/stripe-server";
import { getTaxIdsStatus } from "@/lib/tax-ids-server";
import { getBusinessCount, getUserPlan } from "@/lib/subscription-server";
import { isTwilioConfigured, sendSms } from "@/lib/twilio-sms";
import { formatUkDate } from "@/lib/mtd-dashboard";

export type ChannelSummary = {
  eligible: number;
  sent: number;
  skipped: number;
  failed: number;
};

export type DeadlineReminderSummary = {
  scanned: number;
  skipped: number;
  errors: string[];
  monthlySms: ChannelSummary;
  quarterlySms: ChannelSummary;
  quarterlyEmail: ChannelSummary;
};

function emptyChannelSummary(): ChannelSummary {
  return { eligible: 0, sent: 0, skipped: 0, failed: 0 };
}

function emptySummary(): DeadlineReminderSummary {
  return {
    scanned: 0,
    skipped: 0,
    errors: [],
    monthlySms: emptyChannelSummary(),
    quarterlySms: emptyChannelSummary(),
    quarterlyEmail: emptyChannelSummary(),
  };
}

type ReminderUser = {
  id: string;
  profile: { phone: string; email: string } | null;
  submissions: { periodFrom: Date; periodTo: Date }[];
};

async function userIsEligible(userId: string): Promise<boolean> {
  const [plan, businessCount, taxIds] = await Promise.all([
    getUserPlan(userId),
    getBusinessCount(userId),
    getTaxIdsStatus(userId),
  ]);
  return Boolean(plan && businessCount > 0 && taxIds.complete);
}

async function reminderAlreadySent(
  userId: string,
  kind: ReminderKind,
  channel: ReminderChannel,
  deadlineDate: Date,
  daysBefore: ReminderDaysBefore,
): Promise<boolean> {
  const existing = await prisma.reminderLog.findUnique({
    where: {
      userId_kind_channel_deadlineDate_daysBefore: {
        userId,
        kind,
        channel,
        deadlineDate,
        daysBefore,
      },
    },
  });
  return Boolean(existing);
}

async function logReminder(
  userId: string,
  kind: ReminderKind,
  channel: ReminderChannel,
  deadlineDate: Date,
  daysBefore: ReminderDaysBefore,
  externalId: string,
): Promise<void> {
  await prisma.reminderLog.create({
    data: {
      userId,
      kind,
      channel,
      deadlineDate,
      daysBefore,
      externalId,
    },
  });
}

export async function runDeadlineReminders(now = new Date()): Promise<DeadlineReminderSummary> {
  const summary = emptySummary();
  const smsReady = isTwilioConfigured();
  const emailReady = isResendConfigured();

  if (!smsReady) {
    summary.errors.push("Twilio is not configured — SMS reminders skipped.");
  }
  if (!emailReady) {
    summary.errors.push("Resend is not configured — email reminders skipped.");
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
          email: true,
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
  const submitUrl = `${appBaseUrl()}/submit`;

  for (const user of users as ReminderUser[]) {
    if (!(await userIsEligible(user.id))) {
      summary.skipped += 1;
      continue;
    }

    const phone = user.profile?.phone?.trim() ?? "";
    const email = user.profile?.email?.trim() ?? "";

    // --- Monthly SMS (calendar month-end) ---
    const monthTarget = resolveCurrentMonthRecordDeadline(now);
    if (
      isReminderDay(monthTarget.daysUntilDeadline) &&
      !hasMonthlyRecordsForMonth(user.submissions, now.getFullYear(), now.getMonth())
    ) {
      summary.monthlySms.eligible += 1;
      const daysBefore = monthTarget.daysUntilDeadline;
      const deadlineDate = deadlineDateOnly(monthTarget.deadline);

      if (!smsReady || !phone) {
        summary.monthlySms.skipped += 1;
      } else if (await reminderAlreadySent(user.id, "monthly", "sms", deadlineDate, daysBefore)) {
        summary.monthlySms.skipped += 1;
      } else {
        const result = await sendSms(phone, MONTHLY_SMS_MESSAGES[daysBefore]);
        if (!result.ok) {
          summary.monthlySms.failed += 1;
          summary.errors.push(`Monthly SMS ${user.id}: ${result.error}`);
        } else {
          await logReminder(user.id, "monthly", "sms", deadlineDate, daysBefore, result.sid);
          summary.monthlySms.sent += 1;
        }
      }
    }

    // --- Quarterly HMRC ---
    const quarterlyTarget = resolveNextQuarterlyDeadline(user.submissions, now);
    if (!quarterlyTarget || quarterlyTarget.daysUntilDeadline < 0 || !isReminderDay(quarterlyTarget.daysUntilDeadline)) {
      continue;
    }

    const daysBefore = quarterlyTarget.daysUntilDeadline;
    const deadlineDate = deadlineDateOnly(quarterlyTarget.deadline);
    const deadlineLabel = formatUkDate(quarterlyTarget.deadline);

    // Quarterly SMS
    summary.quarterlySms.eligible += 1;
    if (!smsReady || !phone) {
      summary.quarterlySms.skipped += 1;
    } else if (await reminderAlreadySent(user.id, "quarterly", "sms", deadlineDate, daysBefore)) {
      summary.quarterlySms.skipped += 1;
    } else {
      const result = await sendSms(phone, QUARTERLY_SMS_MESSAGES[daysBefore]);
      if (!result.ok) {
        summary.quarterlySms.failed += 1;
        summary.errors.push(`Quarterly SMS ${user.id}: ${result.error}`);
      } else {
        await logReminder(user.id, "quarterly", "sms", deadlineDate, daysBefore, result.sid);
        summary.quarterlySms.sent += 1;
      }
    }

    // Quarterly email
    summary.quarterlyEmail.eligible += 1;
    if (!emailReady || !email) {
      summary.quarterlyEmail.skipped += 1;
    } else if (await reminderAlreadySent(user.id, "quarterly", "email", deadlineDate, daysBefore)) {
      summary.quarterlyEmail.skipped += 1;
    } else {
      const subject = quarterlyEmailSubject(daysBefore);
      const text = quarterlyEmailText(daysBefore, deadlineLabel, submitUrl);
      const html = quarterlyEmailHtml(daysBefore, deadlineLabel, submitUrl);
      const result = await sendReminderEmail(email, subject, html, text);
      if (!result.ok) {
        summary.quarterlyEmail.failed += 1;
        summary.errors.push(`Quarterly email ${user.id}: ${result.error}`);
      } else {
        await logReminder(user.id, "quarterly", "email", deadlineDate, daysBefore, result.id);
        summary.quarterlyEmail.sent += 1;
      }
    }
  }

  return summary;
}
