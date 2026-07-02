import { cookies } from "next/headers";

import { prisma } from "@/lib/db";
import { maxBusinessesForPlan } from "@/lib/plan-config";
import { getUserPlan } from "@/lib/subscription-server";

export const ACTIVE_BUSINESS_COOKIE = "ss_active_business";

export const ACTIVE_BUSINESS_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

export async function persistActiveBusinessCookie(businessId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_BUSINESS_COOKIE, businessId, ACTIVE_BUSINESS_COOKIE_OPTIONS);
}

export type BusinessSummary = {
  id: string;
  name: string;
  category: string;
};

export async function listBusinessesForUser(userId: string): Promise<BusinessSummary[]> {
  return prisma.business.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, category: true },
  });
}

/** Resolve which business the user is working on (cookie, URL param, or first created). */
export async function resolveActiveBusiness(
  userId: string,
  preferredId?: string | null,
): Promise<BusinessSummary | null> {
  const businesses = await listBusinessesForUser(userId);
  if (businesses.length === 0) return null;

  const cookieStore = await cookies();
  const candidate = preferredId?.trim() || cookieStore.get(ACTIVE_BUSINESS_COOKIE)?.value?.trim();
  if (candidate) {
    const match = businesses.find((b) => b.id === candidate);
    if (match) return match;
  }

  return businesses[0];
}

export async function getActiveBusinessContext(userId: string, preferredId?: string | null) {
  const [businesses, plan, activeBusiness] = await Promise.all([
    listBusinessesForUser(userId),
    getUserPlan(userId),
    resolveActiveBusiness(userId, preferredId),
  ]);

  return {
    businesses,
    activeBusiness,
    activeBusinessId: activeBusiness?.id ?? null,
    maxBusinesses: plan ? maxBusinessesForPlan(plan) : 0,
    canSwitchBusiness: businesses.length > 1,
  };
}

export async function assertBusinessOwned(userId: string, businessId: string): Promise<BusinessSummary> {
  const business = await prisma.business.findFirst({
    where: { id: businessId, userId },
    select: { id: true, name: true, category: true },
  });
  if (!business) {
    throw new Error("Business not found");
  }
  return business;
}
