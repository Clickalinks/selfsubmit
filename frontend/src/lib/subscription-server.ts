import { prisma } from "@/lib/db";
import { userHasActiveSubscription } from "@/lib/billing-server";
import { maxBusinessesForPlan, normalizePlanId, type PlanId } from "@/lib/plan-config";

export async function getUserPlan(userId: string): Promise<PlanId | null> {
  const active = await userHasActiveSubscription(userId);
  if (!active) return null;

  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  return normalizePlanId(row?.plan);
}

export async function getBusinessCount(userId: string): Promise<number> {
  return prisma.business.count({ where: { userId } });
}

export async function canCreateBusiness(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId);
  if (!plan) {
    return false;
  }
  const count = await getBusinessCount(userId);
  const max = maxBusinessesForPlan(plan);
  return count < max;
}

export async function setUserPlan(userId: string, plan: PlanId): Promise<void> {
  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId, plan },
    update: { plan },
  });
}

export async function createBusinessRecord(
  userId: string,
  input: { name: string; category: string },
): Promise<{ id: string }> {
  const business = await prisma.business.create({
    data: {
      userId,
      name: input.name.trim(),
      category: input.category.trim(),
    },
    select: { id: true },
  });
  return business;
}
