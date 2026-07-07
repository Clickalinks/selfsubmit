import { prisma } from "@/lib/db";
import { isValidHmrcBusinessId } from "@/lib/hmrc-business-details";

export type LocalBusinessHmrcLink = {
  id: string;
  name: string;
  category: string;
  hmrcBusinessId: string | null;
};

export async function listLocalBusinessHmrcLinks(userId: string): Promise<LocalBusinessHmrcLink[]> {
  return prisma.business.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, category: true, hmrcBusinessId: true },
  });
}

export async function linkBusinessToHmrc(
  userId: string,
  businessId: string,
  hmrcBusinessId: string | null,
): Promise<LocalBusinessHmrcLink> {
  const business = await prisma.business.findFirst({
    where: { id: businessId, userId },
    select: { id: true, name: true, category: true, hmrcBusinessId: true },
  });
  if (!business) {
    throw new Error("Business not found");
  }

  const normalizedHmrcId = hmrcBusinessId?.trim() || null;
  if (normalizedHmrcId && !isValidHmrcBusinessId(normalizedHmrcId)) {
    throw new Error("Invalid HMRC business ID format.");
  }

  if (normalizedHmrcId) {
    await prisma.business.updateMany({
      where: { userId, hmrcBusinessId: normalizedHmrcId, NOT: { id: businessId } },
      data: { hmrcBusinessId: null },
    });
  }

  return prisma.business.update({
    where: { id: businessId },
    data: { hmrcBusinessId: normalizedHmrcId },
    select: { id: true, name: true, category: true, hmrcBusinessId: true },
  });
}

export async function getHmrcBusinessIdForBusiness(
  userId: string,
  businessId: string,
): Promise<string | null> {
  const row = await prisma.business.findFirst({
    where: { id: businessId, userId },
    select: { hmrcBusinessId: true },
  });
  return row?.hmrcBusinessId ?? null;
}
