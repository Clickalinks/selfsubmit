import type Stripe from "stripe";
import StripeSdk from "stripe";

import { prisma } from "@/lib/db";
import { normalizePlanId, type PlanId } from "@/lib/plan-config";
import { ACTIVE_STRIPE_STATUSES, getStripe, isStripeConfigured } from "@/lib/stripe-server";
import { subscriptionSyncPayload } from "@/lib/stripe-subscription";

function isStripeMissingResource(err: unknown): boolean {
  return err instanceof StripeSdk.errors.StripeInvalidRequestError && err.code === "resource_missing";
}

/**
 * Returns a Stripe customer ID valid for the current API mode (test vs live).
 * Recreates the customer when the stored ID is missing (e.g. after switching to live keys).
 */
export async function ensureStripeCustomer(
  stripe: Stripe,
  userId: string,
  existingCustomerId: string | null,
  email?: string | null,
): Promise<string> {
  if (existingCustomerId) {
    try {
      const customer = await stripe.customers.retrieve(existingCustomerId);
      if (!("deleted" in customer && customer.deleted)) {
        return existingCustomerId;
      }
    } catch (err) {
      if (!isStripeMissingResource(err)) throw err;
    }
  }

  const customer = await stripe.customers.create({
    email: email ?? undefined,
    metadata: { clerkUserId: userId },
  });

  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId, stripeCustomerId: customer.id },
    update: {
      stripeCustomerId: customer.id,
      stripeSubscriptionId: null,
      stripeSubscriptionStatus: null,
      stripeCurrentPeriodEnd: null,
      plan: null,
    },
  });

  return customer.id;
}

export type SubscriptionState = {
  plan: PlanId | null;
  active: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeSubscriptionStatus: string | null;
  stripeCurrentPeriodEnd: Date | null;
  stripeCancelAtPeriodEnd: boolean;
  subscriptionAccessEndedAt: Date | null;
};

function rowToSubscriptionState(row: {
  plan: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeSubscriptionStatus: string | null;
  stripeCurrentPeriodEnd: Date | null;
  stripeCancelAtPeriodEnd: boolean;
  subscriptionAccessEndedAt: Date | null;
}): SubscriptionState {
  const plan = normalizePlanId(row.plan);
  const status = row.stripeSubscriptionStatus;
  const stripeActive = status ? ACTIVE_STRIPE_STATUSES.has(status) : false;
  const inPaidCancelPeriod = Boolean(
    row.stripeCurrentPeriodEnd &&
      row.stripeCurrentPeriodEnd.getTime() > Date.now() &&
      (row.stripeCancelAtPeriodEnd || status === "canceled"),
  );

  const active = isStripeConfigured()
    ? (stripeActive && Boolean(plan)) || (Boolean(plan) && inPaidCancelPeriod)
    : Boolean(plan);

  const visiblePlan = active ? plan : isStripeConfigured() ? (inPaidCancelPeriod ? plan : null) : plan;

  return {
    plan: visiblePlan,
    active,
    stripeCustomerId: row.stripeCustomerId,
    stripeSubscriptionId: row.stripeSubscriptionId,
    stripeSubscriptionStatus: row.stripeSubscriptionStatus,
    stripeCurrentPeriodEnd: row.stripeCurrentPeriodEnd,
    stripeCancelAtPeriodEnd: row.stripeCancelAtPeriodEnd,
    subscriptionAccessEndedAt: row.subscriptionAccessEndedAt,
  };
}

async function fetchStripeSubscriptionForUser(row: {
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
}): Promise<Stripe.Subscription | null> {
  const stripe = getStripe();

  if (row.stripeSubscriptionId) {
    try {
      return await stripe.subscriptions.retrieve(row.stripeSubscriptionId);
    } catch (err) {
      if (!isStripeMissingResource(err)) throw err;
    }
  }

  if (!row.stripeCustomerId) return null;

  const list = await stripe.subscriptions.list({
    customer: row.stripeCustomerId,
    status: "all",
    limit: 10,
  });

  const nowSec = Math.floor(Date.now() / 1000);
  const preferred =
    list.data.find(
      (sub) =>
        sub.status === "active" ||
        sub.status === "trialing" ||
        (typeof sub.cancel_at === "number" && sub.cancel_at > nowSec),
    ) ?? list.data[0];

  return preferred ?? null;
}

async function syncStripeSubscriptionFromApi(userId: string): Promise<void> {
  if (!isStripeConfigured()) return;

  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeSubscriptionId: true, stripeCustomerId: true, plan: true },
  });
  if (!row?.stripeSubscriptionId && !row?.stripeCustomerId) return;

  try {
    const subscription = await fetchStripeSubscriptionForUser(row);
    if (!subscription) return;

    const periodEnd = subscriptionSyncPayload(subscription).stripeCurrentPeriodEnd;
    const fullyEnded =
      subscription.status === "canceled" ||
      subscription.status === "unpaid" ||
      subscription.status === "incomplete_expired";

    if (fullyEnded && (!periodEnd || periodEnd.getTime() <= Date.now())) {
      await clearStripeSubscription(userId);
      return;
    }

    const planRaw = subscription.metadata?.plan;
    const plan = planRaw && normalizePlanId(planRaw) ? (planRaw as PlanId) : normalizePlanId(row.plan);
    if (!plan) return;

    const customerId =
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

    const sync = subscriptionSyncPayload(subscription);

    await upsertStripeSubscription(userId, {
      plan,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      ...sync,
    });
  } catch (err) {
    if (!isStripeMissingResource(err)) {
      console.error("[billing-server] Stripe subscription sync failed", userId, err);
    }
  }
}

export async function getSubscriptionState(userId: string): Promise<SubscriptionState> {
  await syncStripeSubscriptionFromApi(userId);

  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      stripeSubscriptionStatus: true,
      stripeCurrentPeriodEnd: true,
      stripeCancelAtPeriodEnd: true,
      subscriptionAccessEndedAt: true,
    },
  });

  if (!row) {
    return {
      plan: null,
      active: false,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripeSubscriptionStatus: null,
      stripeCurrentPeriodEnd: null,
      stripeCancelAtPeriodEnd: false,
      subscriptionAccessEndedAt: null,
    };
  }

  return rowToSubscriptionState(row);
}

export async function userHasActiveSubscription(userId: string): Promise<boolean> {
  const state = await getSubscriptionState(userId);
  return state.active && Boolean(state.plan);
}

export async function upsertStripeSubscription(
  userId: string,
  data: {
    plan: PlanId;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    stripeSubscriptionStatus: string;
    stripeCurrentPeriodEnd: Date | null;
    stripeCancelAtPeriodEnd?: boolean;
  },
): Promise<void> {
  const clearAccessEnded = ACTIVE_STRIPE_STATUSES.has(data.stripeSubscriptionStatus);

  await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      plan: data.plan,
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      stripeSubscriptionStatus: data.stripeSubscriptionStatus,
      stripeCurrentPeriodEnd: data.stripeCurrentPeriodEnd,
      stripeCancelAtPeriodEnd: data.stripeCancelAtPeriodEnd ?? false,
      subscriptionAccessEndedAt: clearAccessEnded ? null : data.stripeCurrentPeriodEnd,
    },
    update: {
      plan: data.plan,
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      stripeSubscriptionStatus: data.stripeSubscriptionStatus,
      stripeCurrentPeriodEnd: data.stripeCurrentPeriodEnd,
      stripeCancelAtPeriodEnd: data.stripeCancelAtPeriodEnd ?? false,
      ...(clearAccessEnded
        ? { subscriptionAccessEndedAt: null }
        : {
            subscriptionAccessEndedAt: data.stripeCurrentPeriodEnd ?? new Date(),
          }),
    },
  });
}

export async function clearStripeSubscription(userId: string): Promise<void> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCurrentPeriodEnd: true, subscriptionAccessEndedAt: true },
  });

  const endedAt =
    existing?.subscriptionAccessEndedAt ??
    existing?.stripeCurrentPeriodEnd ??
    new Date();

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeSubscriptionStatus: "canceled",
      stripeSubscriptionId: null,
      stripeCancelAtPeriodEnd: false,
      stripeCurrentPeriodEnd: existing?.stripeCurrentPeriodEnd ?? endedAt,
      subscriptionAccessEndedAt: endedAt,
    },
  });
}
