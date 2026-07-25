import { NextResponse } from "next/server";
import Stripe from "stripe";

import { apiAuthErrorResponse, clientMetaFromRequest, requireApiUser } from "@/lib/api-auth";
import { checkoutBodySchema, parseJsonBody } from "@/lib/api-schemas";
import { writeAuditLog } from "@/lib/audit-log";
import { API_RATE_LIMITS, checkApiRateLimit, rateLimitKey } from "@/lib/api-rate-limit";
import { ensureStripeCustomer, upsertStripeSubscription } from "@/lib/billing-server";
import type { PlanId } from "@/lib/plan-config";
import { prisma } from "@/lib/db";
import { ACTIVE_STRIPE_STATUSES, appBaseUrl, getStripe, getStripePriceId, getStripeTrialPeriodDays, isStripeConfigured } from "@/lib/stripe-server";
import { subscriptionSyncPayload } from "@/lib/stripe-subscription";
import { setUserPlan } from "@/lib/subscription-server";

export async function POST(req: Request) {
  try {
    const { userId, role } = await requireApiUser();
    const meta = clientMetaFromRequest(req as import("next/server").NextRequest);

    const limited = await checkApiRateLimit({
      key: rateLimitKey("billing-checkout", userId),
      ...API_RATE_LIMITS.billing,
    });
    if (!limited.allowed) {
      return NextResponse.json(
        { error: "Too many checkout attempts. Please wait and try again." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const input = parseJsonBody(body, checkoutBodySchema);
    if (!input) {
      return NextResponse.json(
        { error: 'Body must include plan: "solo" | "business_plus" | "professional" | "unlimited"' },
        { status: 400 },
      );
    }

    const plan: PlanId = input.plan;

    if (!isStripeConfigured()) {
      await setUserPlan(userId, plan);
      await writeAuditLog({
        userId,
        actorRole: role,
        action: "billing.checkout",
        resource: "plan",
        resourceId: plan,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        metadata: { mode: "manual" },
      });
      return NextResponse.json({ ok: true, plan, mode: "manual" });
    }

    const priceId = getStripePriceId(plan);
    if (!priceId) {
      return NextResponse.json(
        { error: `Stripe price is not configured for plan "${plan}". Set the STRIPE_PRICE_* env variable.` },
        { status: 503 },
      );
    }

    const stripe = getStripe();
    const base = appBaseUrl();

    const userRow = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    const customerId = await ensureStripeCustomer(
      stripe,
      userId,
      userRow?.stripeCustomerId ?? null,
      userRow?.profile?.email,
    );

    // Upgrade / switch / renew an existing live subscription instead of creating a second one.
    if (userRow?.stripeSubscriptionId) {
      try {
        const existing = await stripe.subscriptions.retrieve(userRow.stripeSubscriptionId);
        const itemId = existing.items.data[0]?.id;
        const canUpdate =
          Boolean(itemId) &&
          (ACTIVE_STRIPE_STATUSES.has(existing.status) || existing.status === "past_due");

        if (canUpdate && itemId) {
          const updated = await stripe.subscriptions.update(existing.id, {
            cancel_at_period_end: false,
            items: [{ id: itemId, price: priceId }],
            proration_behavior: "create_prorations",
            metadata: {
              ...existing.metadata,
              clerkUserId: userId,
              plan,
            },
          });

          await upsertStripeSubscription(userId, {
            plan,
            stripeCustomerId: customerId,
            stripeSubscriptionId: updated.id,
            ...subscriptionSyncPayload(updated),
          });

          await writeAuditLog({
            userId,
            actorRole: role,
            action: "billing.checkout",
            resource: "plan",
            resourceId: plan,
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
            metadata: { mode: "upgrade", subscriptionId: updated.id },
          });

          return NextResponse.json({
            ok: true,
            plan,
            mode: "upgrade",
            url: `${base}/add-business?upgrade=success`,
          });
        }
      } catch (err) {
        if (!(err instanceof Stripe.errors.StripeInvalidRequestError && err.code === "resource_missing")) {
          console.error("[billing/checkout] upgrade failed", err);
          return NextResponse.json(
            { error: "Could not update your plan. Try again or contact support." },
            { status: 502 },
          );
        }
      }
    }

    let session;
    try {
      const trialDays = getStripeTrialPeriodDays();
      let trialPeriodDays: number | undefined;
      if (trialDays > 0) {
        // First-time customers only — avoid stacking another free period after cancel/resubscribe.
        const prior = await stripe.subscriptions.list({
          customer: customerId,
          status: "all",
          limit: 1,
        });
        if (prior.data.length === 0) {
          trialPeriodDays = trialDays;
        }
      }

      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${base}/add-business?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/pricing?checkout=canceled`,
        client_reference_id: userId,
        metadata: { clerkUserId: userId, plan },
        // Collect a card during trial so billing starts automatically when the trial ends.
        payment_method_collection: "always",
        // Name/address on invoices Stripe generates for each billing period.
        billing_address_collection: "required",
        customer_update: { address: "auto", name: "auto" },
        // Friends/promo codes (e.g. MTDFRIENDS) — 100% off for N months after trial, per Stripe coupon.
        allow_promotion_codes: true,
        subscription_data: {
          metadata: { clerkUserId: userId, plan },
          ...(trialPeriodDays ? { trial_period_days: trialPeriodDays } : {}),
        },
      });
    } catch (err) {
      if (err instanceof Stripe.errors.StripeError) {
        console.error("[billing/checkout] stripe", err.message, { userId, priceId });
        return NextResponse.json(
          { error: "Could not start checkout. Check Stripe price configuration or try again." },
          { status: 502 },
        );
      }
      throw err;
    }

    if (!session.url) {
      return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
    }

    await writeAuditLog({
      userId,
      actorRole: role,
      action: "billing.checkout",
      resource: "plan",
      resourceId: plan,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      metadata: { mode: "stripe", sessionId: session.id },
    });

    return NextResponse.json({ url: session.url, mode: "stripe" });
  } catch (err) {
    return apiAuthErrorResponse(err);
  }
}
