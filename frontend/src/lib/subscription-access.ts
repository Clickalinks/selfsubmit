import type { SubscriptionState } from "@/lib/billing-server";

/** Days after paid access ends when export, delete, and resubscribe remain available. */
export const SUBSCRIPTION_GRACE_DAYS = 30;

export type SubscriptionAccessPhase = "active" | "ending" | "grace" | "lapsed" | "none";

export type SubscriptionAccess = {
  phase: SubscriptionAccessPhase;
  /** Paid features (new records, uploads, extra businesses). */
  canUsePaidFeatures: boolean;
  /** Sign-in, view history, export, delete account, choose a plan. */
  canExportAndManageAccount: boolean;
  periodEnd: Date | null;
  graceEndsAt: Date | null;
};

function addDays(date: Date, days: number): Date {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function formatAccessDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Derives access phase from subscription state.
 * - active: paid plan in force
 * - ending: cancelled but still inside the paid period
 * - grace: paid period over; 30 days to export / delete / resubscribe
 * - lapsed: grace over; still allow export/delete/resubscribe, no paid features
 * - none: never had a recorded end / no subscription history needed for gates
 */
export function getSubscriptionAccess(state: SubscriptionState, now = new Date()): SubscriptionAccess {
  const periodEnd = state.stripeCurrentPeriodEnd;
  const accessEndedAt = state.subscriptionAccessEndedAt;

  if (state.active && state.plan) {
    if (state.stripeCancelAtPeriodEnd && periodEnd && periodEnd.getTime() > now.getTime()) {
      return {
        phase: "ending",
        canUsePaidFeatures: true,
        canExportAndManageAccount: true,
        periodEnd,
        graceEndsAt: addDays(periodEnd, SUBSCRIPTION_GRACE_DAYS),
      };
    }
    return {
      phase: "active",
      canUsePaidFeatures: true,
      canExportAndManageAccount: true,
      periodEnd,
      graceEndsAt: null,
    };
  }

  const endedAt = accessEndedAt ?? (periodEnd && periodEnd.getTime() <= now.getTime() ? periodEnd : null);

  if (endedAt) {
    const graceEndsAt = addDays(endedAt, SUBSCRIPTION_GRACE_DAYS);
    if (graceEndsAt.getTime() > now.getTime()) {
      return {
        phase: "grace",
        canUsePaidFeatures: false,
        canExportAndManageAccount: true,
        periodEnd: endedAt,
        graceEndsAt,
      };
    }
    return {
      phase: "lapsed",
      canUsePaidFeatures: false,
      canExportAndManageAccount: true,
      periodEnd: endedAt,
      graceEndsAt,
    };
  }

  return {
    phase: "none",
    canUsePaidFeatures: false,
    canExportAndManageAccount: true,
    periodEnd: null,
    graceEndsAt: null,
  };
}
