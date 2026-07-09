import type { SubscriptionState } from "@/lib/billing-server";

export function formatSubscriptionEndDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function subscriptionIsEnding(state: SubscriptionState): boolean {
  const periodEnd = state.stripeCurrentPeriodEnd;
  if (!periodEnd || periodEnd.getTime() <= Date.now()) return false;

  if (state.stripeCancelAtPeriodEnd) return true;
  if (state.stripeSubscriptionStatus === "canceled") return true;

  return false;
}
