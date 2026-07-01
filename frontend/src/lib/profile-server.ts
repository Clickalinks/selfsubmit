import { prisma } from "@/lib/db";
import type { ProfileInput } from "@/lib/profile-validation";

export type ClientProfileRecord = {
  userId: string;
  firstName: string;
  lastName: string;
  homeAddress: string;
  email: string;
  phone: string;
  businessAddress: string;
  businessName: string | null;
  businessSameAsHome: boolean;
  primaryProfession: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function resolveBusinessAddress(input: ProfileInput): string {
  if (input.businessSameAsHome) return input.homeAddress.trim();
  return input.businessAddress.trim();
}

export async function getClientProfile(userId: string): Promise<ClientProfileRecord | null> {
  const row = await prisma.clientProfile.findUnique({ where: { userId } });
  return row;
}

export async function createClientProfile(userId: string, input: ProfileInput): Promise<ClientProfileRecord> {
  const businessAddress = resolveBusinessAddress(input);
  const profession = input.primaryProfession?.trim() || null;

  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  const profile = await prisma.clientProfile.create({
    data: {
      userId,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      homeAddress: input.homeAddress.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      businessAddress,
      businessName: input.businessName?.trim() || null,
      businessSameAsHome: input.businessSameAsHome,
      primaryProfession: profession,
    },
  });

  return profile;
}

export async function updateClientProfile(
  userId: string,
  input: Partial<ProfileInput>,
): Promise<ClientProfileRecord> {
  const existing = await prisma.clientProfile.findUnique({ where: { userId } });
  if (!existing) {
    throw new Error("Profile not found");
  }

  const merged: ProfileInput = {
    firstName: input.firstName ?? existing.firstName,
    lastName: input.lastName ?? existing.lastName,
    homeAddress: input.homeAddress ?? existing.homeAddress,
    email: input.email ?? existing.email,
    phone: input.phone ?? existing.phone,
    businessAddress: input.businessAddress ?? existing.businessAddress,
    businessName: input.businessName !== undefined ? input.businessName : existing.businessName,
    businessSameAsHome: input.businessSameAsHome ?? existing.businessSameAsHome,
    primaryProfession: input.primaryProfession ?? existing.primaryProfession ?? "",
  };

  return prisma.clientProfile.update({
    where: { userId },
    data: {
      firstName: merged.firstName.trim(),
      lastName: merged.lastName.trim(),
      homeAddress: merged.homeAddress.trim(),
      email: merged.email.trim(),
      phone: merged.phone.trim(),
      businessAddress: resolveBusinessAddress(merged),
      businessName: merged.businessName?.trim() || null,
      businessSameAsHome: merged.businessSameAsHome,
      primaryProfession: merged.primaryProfession.trim() || null,
    },
  });
}
