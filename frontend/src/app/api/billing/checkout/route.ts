import { NextResponse } from "next/server";
import Stripe from "stripe";

import { apiAuthErrorResponse, clientMetaFromRequest, requireApiUser } from "@/lib/api-auth";
import { checkoutBodySchema, parseJsonBody } from "@/lib/api-schemas";
import { writeAuditLog } from "@/lib/audit-log";
import { API_RATE_LIMITS, checkApiRateLimit, rateLimitKey } from "@/lib/api-rate-limit";
import { ensureStripeCustomer } from "@/lib/billing-server";
import type { PlanId } from "@/lib/plan-config";
import { prisma } from "@/lib/db";
import { appBaseUrl, getStripe, getStripePriceId, isStripeConfigured } from "@/lib/stripe-server";
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

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${base}/add-business?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/pricing?checkout=canceled`,
        client_reference_id: userId,
        metadata: { clerkUserId: userId, plan },
        subscription_data: {
          metadata: { clerkUserId: userId, plan },
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
