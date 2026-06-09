import type Stripe from "stripe";

/** Stripe API 2025+ exposes period end on subscription items rather than the subscription root. */
export function subscriptionPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const end = subscription.items?.data?.[0]?.current_period_end;
  if (typeof end === "number" && end > 0) {
    return new Date(end * 1000);
  }
  return null;
}
