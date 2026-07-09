import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { ensureStripeCustomer } from "@/lib/billing-server";
import { prisma } from "@/lib/db";
import { appBaseUrl, getStripe, isStripeConfigured } from "@/lib/stripe-server";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe billing is not configured." }, { status: 503 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) {
    return NextResponse.json({ error: "No billing account found. Choose a plan first." }, { status: 404 });
  }

  const stripe = getStripe();
  let customerId: string;
  try {
    customerId = await ensureStripeCustomer(
      stripe,
      userId,
      user.stripeCustomerId,
      user.profile?.email,
    );
  } catch (err) {
    console.error("[billing/portal] ensure customer", err);
    return NextResponse.json({ error: "Could not open billing portal." }, { status: 502 });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appBaseUrl()}/dashboard/settings`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      console.error("[billing/portal] stripe", err.message, { userId, customerId });
    }
    return NextResponse.json({ error: "Could not open billing portal." }, { status: 502 });
  }
}
