import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { getSubscriptionState } from "@/lib/billing-server";
import { prisma } from "@/lib/db";
import { getSubscriptionAccess } from "@/lib/subscription-access";
import { getBusinessCount, getUserPlan } from "@/lib/subscription-server";

/**
 * @returns Clerk user id or redirects to sign-in with return path.
 */
export async function requireClerkUserId(returnTo: string): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(returnTo)}`);
  }
  return userId;
}

/** User must have an active paid plan (including cancel-at-period-end while still in the paid window). */
export async function requireUserPlan(userId: string): Promise<void> {
  const plan = await getUserPlan(userId);
  if (!plan) {
    redirect("/pricing");
  }
}

/** Blocks paid features during grace / lapsed / no-plan states. */
export async function requirePaidAccess(userId: string, returnTo: string): Promise<void> {
  const state = await getSubscriptionState(userId);
  const access = getSubscriptionAccess(state);
  if (access.canUsePaidFeatures) return;
  redirect(`/pricing?reason=subscription&from=${encodeURIComponent(returnTo)}`);
}

/** Monthly return form requires paid access + at least one business profile. */
export async function requireAtLeastOneBusiness(userId: string): Promise<void> {
  const n = await getBusinessCount(userId);
  if (n < 1) {
    redirect("/add-business");
  }
}

/** Plan row exists + at least one business — used before rendering the MTD form. */
export async function assertSubmitFormAccess(userId: string): Promise<void> {
  await requirePaidAccess(userId, "/submit");
  await requireAtLeastOneBusiness(userId);
}

/** API helper — returns a 402 response when paid features are locked. */
export async function paidFeaturesBlockedResponse(userId: string): Promise<NextResponse | null> {
  const state = await getSubscriptionState(userId);
  const access = getSubscriptionAccess(state);
  if (access.canUsePaidFeatures) return null;

  const message =
    access.phase === "grace"
      ? "Your subscription has ended. Resubscribe to save new records or upload receipts. You can still download your data from Settings."
      : access.phase === "lapsed"
        ? "Your subscription and grace period have ended. Choose a plan to continue, or download your data from Settings."
        : "Choose a plan to use this feature.";

  return NextResponse.json({ error: message, phase: access.phase }, { status: 402 });
}

export async function userHasPlanRow(userId: string): Promise<boolean> {
  const row = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  return Boolean(row);
}
