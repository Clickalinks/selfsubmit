import { prisma } from "@/lib/db";
import { normalizePlanId, type PlanId } from "@/lib/plan-config";
import { ACTIVE_STRIPE_STATUSES, isStripeConfigured } from "@/lib/stripe-server";

export type SubscriptionState = {
  plan: PlanId | null;
  active: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeSubscriptionStatus: string | null;
  stripeCurrentPeriodEnd: Date | null;
};

export async function getSubscriptionState(userId: string): Promise<SubscriptionState> {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      stripeSubscriptionStatus: true,
      stripeCurrentPeriodEnd: true,
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
    };
  }

  const plan = normalizePlanId(row.plan);
  const status = row.stripeSubscriptionStatus;
  const stripeActive = status ? ACTIVE_STRIPE_STATUSES.has(status) : false;

  // Dev / manual mode when Stripe is not configured — honour stored plan.
  const active = isStripeConfigured() ? stripeActive && Boolean(plan) : Boolean(plan);

  return {
    plan: active ? plan : isStripeConfigured() ? null : plan,
    active,
    stripeCustomerId: row.stripeCustomerId,
    stripeSubscriptionId: row.stripeSubscriptionId,
    stripeSubscriptionStatus: row.stripeSubscriptionStatus,
    stripeCurrentPeriodEnd: row.stripeCurrentPeriodEnd,
  };
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
    },
    update: {
      plan: data.plan,
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      stripeSubscriptionStatus: data.stripeSubscriptionStatus,
      stripeCurrentPeriodEnd: data.stripeCurrentPeriodEnd,
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
    },
  });
}
