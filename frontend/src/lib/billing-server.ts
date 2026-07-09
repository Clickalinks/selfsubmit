import type Stripe from "stripe";
import StripeSdk from "stripe";

import { prisma } from "@/lib/db";
import { normalizePlanId, type PlanId } from "@/lib/plan-config";
import { ACTIVE_STRIPE_STATUSES, getStripe, isStripeConfigured } from "@/lib/stripe-server";
import { subscriptionPeriodEnd } from "@/lib/stripe-subscription";

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
};

function rowToSubscriptionState(row: {
  plan: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeSubscriptionStatus: string | null;
  stripeCurrentPeriodEnd: Date | null;
  stripeCancelAtPeriodEnd: boolean;
}): SubscriptionState {
  const plan = normalizePlanId(row.plan);
  const status = row.stripeSubscriptionStatus;
  const stripeActive = status ? ACTIVE_STRIPE_STATUSES.has(status) : false;
  const active = isStripeConfigured() ? stripeActive && Boolean(plan) : Boolean(plan);

  return {
    plan: active ? plan : isStripeConfigured() ? null : plan,
    active,
    stripeCustomerId: row.stripeCustomerId,
    stripeSubscriptionId: row.stripeSubscriptionId,
    stripeSubscriptionStatus: row.stripeSubscriptionStatus,
    stripeCurrentPeriodEnd: row.stripeCurrentPeriodEnd,
    stripeCancelAtPeriodEnd: row.stripeCancelAtPeriodEnd,
  };
}

async function syncStripeSubscriptionFromApi(userId: string): Promise<void> {
  if (!isStripeConfigured()) return;

  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeSubscriptionId: true, plan: true },
  });
  if (!row?.stripeSubscriptionId) return;

  try {
    const subscription = await getStripe().subscriptions.retrieve(row.stripeSubscriptionId);
    const planRaw = subscription.metadata?.plan;
    const plan = planRaw && normalizePlanId(planRaw) ? (planRaw as PlanId) : normalizePlanId(row.plan);
    if (!plan) return;

    const customerId =
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

    await upsertStripeSubscription(userId, {
      plan,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: subscription.status,
      stripeCurrentPeriodEnd: subscriptionPeriodEnd(subscription),
      stripeCancelAtPeriodEnd: subscription.cancel_at_period_end,
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
    },
    update: {
      plan: data.plan,
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      stripeSubscriptionStatus: data.stripeSubscriptionStatus,
      stripeCurrentPeriodEnd: data.stripeCurrentPeriodEnd,
      stripeCancelAtPeriodEnd: data.stripeCancelAtPeriodEnd ?? false,
    },
  });
}

export async function clearStripeSubscription(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeSubscriptionStatus: "canceled",
      stripeSubscriptionId: null,
      stripeCurrentPeriodEnd: null,
      stripeCancelAtPeriodEnd: false,
    },
  });
}
