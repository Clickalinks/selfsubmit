import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { clearStripeSubscription, upsertStripeSubscription } from "@/lib/billing-server";
import { isPlanId, normalizePlanId, type PlanId } from "@/lib/plan-config";
import { prisma } from "@/lib/db";
import { getStripe, isStripeConfigured } from "@/lib/stripe-server";
import { subscriptionSyncPayload } from "@/lib/stripe-subscription";

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const stripe = getStripe();
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!signature || !secret) {
    return NextResponse.json({ error: "Missing webhook signature or secret." }, { status: 400 });
  }

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.created":
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe-webhook]", event.type, err);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id ?? session.metadata?.clerkUserId;
  const planRaw = session.metadata?.plan;
  if (!userId || !planRaw || !isPlanId(planRaw)) return;

  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  if (!subscriptionId || !customerId) return;

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  await upsertStripeSubscription(userId, {
    plan: planRaw as PlanId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    ...subscriptionSyncPayload(subscription),
  });
}

async function resolveUserIdFromSubscription(subscription: Stripe.Subscription): Promise<string | null> {
  const fromMeta = subscription.metadata?.clerkUserId?.trim();
  if (fromMeta) return fromMeta;

  const row = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscription.id },
    select: { id: true },
  });
  return row?.id ?? null;
}

async function resolvePlanFromSubscription(
  subscription: Stripe.Subscription,
  userId: string,
): Promise<PlanId | null> {
  const fromMeta = subscription.metadata?.plan;
  if (fromMeta && isPlanId(fromMeta)) return fromMeta;

  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  return normalizePlanId(row?.plan);
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = await resolveUserIdFromSubscription(subscription);
  if (!userId) return;

  const plan = await resolvePlanFromSubscription(subscription, userId);
  if (!plan) return;

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  await upsertStripeSubscription(userId, {
    plan,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    ...subscriptionSyncPayload(subscription),
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = await resolveUserIdFromSubscription(subscription);
  if (!userId) return;
  await clearStripeSubscription(userId);
}
