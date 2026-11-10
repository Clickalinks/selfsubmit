import { prisma } from "@/lib/db";
import { isValidHmrcBusinessId } from "@/lib/hmrc-business-details";
import {
  assertHmrcLinkCompatible,
  expectedHmrcTypeOfBusiness,
} from "@/lib/hmrc-income-source";

export type LocalBusinessHmrcLink = {
  id: string;
  name: string;
  category: string;
  hmrcBusinessId: string | null;
  hmrcTypeOfBusiness: string | null;
};

const LINK_SELECT = {
  id: true,
  name: true,
  category: true,
  hmrcBusinessId: true,
  hmrcTypeOfBusiness: true,
} as const;

export async function listLocalBusinessHmrcLinks(userId: string): Promise<LocalBusinessHmrcLink[]> {
  return prisma.business.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: LINK_SELECT,
  });
}

export async function linkBusinessToHmrc(
  userId: string,
  businessId: string,
  hmrcBusinessId: string | null,
  typeOfBusiness?: string | null,
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

  const normalizedType = typeOfBusiness?.trim() || null;
  if (normalizedHmrcId) {
    assertHmrcLinkCompatible(business.category, normalizedType);
  }

  if (normalizedHmrcId) {
    await prisma.business.updateMany({
      where: { userId, hmrcBusinessId: normalizedHmrcId, NOT: { id: businessId } },
      data: { hmrcBusinessId: null, hmrcTypeOfBusiness: null },
    });
  }

  return prisma.business.update({
    where: { id: businessId },
    data: {
      hmrcBusinessId: normalizedHmrcId,
      hmrcTypeOfBusiness: normalizedHmrcId
        ? normalizedType ?? expectedHmrcTypeOfBusiness(business.category)
        : null,
    },
    select: LINK_SELECT,
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
