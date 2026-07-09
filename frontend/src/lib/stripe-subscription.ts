import type Stripe from "stripe";

/** True when the subscription is set to end at a future date (portal cancel, etc.). */
export function subscriptionScheduledToCancel(subscription: Stripe.Subscription): boolean {
  if (subscription.cancel_at_period_end) return true;

  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof subscription.cancel_at === "number" && subscription.cancel_at > nowSec) {
    return true;
  }

  const reason = subscription.cancellation_details?.reason;
  if (reason === "cancellation_requested") {
    return true;
  }

  return false;
}

/** Stripe API 2025+ exposes period end on subscription items; fall back to cancel_at when needed. */
export function subscriptionPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const itemEnds =
    subscription.items?.data
      ?.map((item) => item.current_period_end)
      .filter((end): end is number => typeof end === "number" && end > 0) ?? [];

  if (itemEnds.length > 0) {
    return new Date(Math.max(...itemEnds) * 1000);
  }

  if (typeof subscription.cancel_at === "number" && subscription.cancel_at > 0) {
    return new Date(subscription.cancel_at * 1000);
  }

  const legacyEnd = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end;
  if (typeof legacyEnd === "number" && legacyEnd > 0) {
    return new Date(legacyEnd * 1000);
  }

  return null;
}

export function subscriptionSyncPayload(subscription: Stripe.Subscription) {
  return {
    stripeSubscriptionStatus: subscription.status,
    stripeCurrentPeriodEnd: subscriptionPeriodEnd(subscription),
    stripeCancelAtPeriodEnd: subscriptionScheduledToCancel(subscription),
  };
}
