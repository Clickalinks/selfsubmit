import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
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

/** User must have chosen a subscription plan (stored in DB). */
export async function requireUserPlan(userId: string): Promise<void> {
  const plan = await getUserPlan(userId);
  if (!plan) {
    redirect("/pricing");
  }
}

/** Monthly return form requires at least one business profile. */
export async function requireAtLeastOneBusiness(userId: string): Promise<void> {
  const n = await getBusinessCount(userId);
  if (n < 1) {
    redirect("/add-business");
  }
}

/** Plan row exists + at least one business — used before rendering the MTD form. */
export async function assertSubmitFormAccess(userId: string): Promise<void> {
  await requireUserPlan(userId);
  await requireAtLeastOneBusiness(userId);
}

export async function userHasPlanRow(userId: string): Promise<boolean> {
  const row = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  return Boolean(row);
}
