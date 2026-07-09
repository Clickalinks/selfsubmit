import type { SubscriptionState } from "@/lib/billing-server";

export function formatSubscriptionEndDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function subscriptionIsEnding(state: SubscriptionState): boolean {
  return Boolean(
    state.stripeCancelAtPeriodEnd &&
      state.active &&
      state.stripeCurrentPeriodEnd &&
      state.stripeCurrentPeriodEnd.getTime() > Date.now(),
  );
}
