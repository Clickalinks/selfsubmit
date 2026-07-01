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

export async function getPrimaryBusiness(userId: string): Promise<{ id: string; name: string; category: string } | null> {
  const row = await prisma.business.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, category: true },
  });
  return row;
}

export async function updatePrimaryBusiness(
  userId: string,
  input: { name: string; category: string },
): Promise<{ id: string }> {
  const existing = await prisma.business.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!existing) {
    throw new Error("Business not found");
  }

  const business = await prisma.business.update({
    where: { id: existing.id },
    data: {
      name: input.name.trim(),
      category: input.category.trim(),
    },
    select: { id: true },
  });

  await prisma.clientProfile.updateMany({
    where: { userId },
    data: { primaryProfession: input.category.trim() },
  });

  return business;
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
