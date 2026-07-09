import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { upsertStripeSubscription } from "@/lib/billing-server";
import { isPlanId, type PlanId } from "@/lib/plan-config";
import { getStripe, isStripeConfigured } from "@/lib/stripe-server";
import { subscriptionPeriodEnd } from "@/lib/stripe-subscription";

/** Confirm a Stripe Checkout session after redirect (handles webhook delay). */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sessionId =
    body && typeof body === "object" ? (body as { sessionId?: unknown }).sessionId : undefined;
  if (typeof sessionId !== "string" || !sessionId.trim()) {
    return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });

  if (session.client_reference_id !== userId && session.metadata?.clerkUserId !== userId) {
    return NextResponse.json({ error: "Session does not belong to this account." }, { status: 403 });
  }

  const planRaw = session.metadata?.plan;
  if (!planRaw || !isPlanId(planRaw)) {
    return NextResponse.json({ error: "Missing plan on checkout session." }, { status: 400 });
  }

  const subscription =
    typeof session.subscription === "string"
      ? await stripe.subscriptions.retrieve(session.subscription)
      : session.subscription;

  if (!subscription) {
    return NextResponse.json({ error: "Subscription not found on session." }, { status: 404 });
  }

  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  if (!customerId) {
    return NextResponse.json({ error: "Customer not found on session." }, { status: 404 });
  }

  await upsertStripeSubscription(userId, {
    plan: planRaw as PlanId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    stripeSubscriptionStatus: subscription.status,
    stripeCurrentPeriodEnd: subscriptionPeriodEnd(subscription),
    stripeCancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  return NextResponse.json({ ok: true, plan: planRaw, status: subscription.status });
}
