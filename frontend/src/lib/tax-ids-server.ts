import { prisma } from "@/lib/db";
import { decryptField, encryptField, isEncryptionConfigured } from "@/lib/field-encryption";
import { normalizeNiNumber, normalizeUtr } from "@/lib/tax-id-validation";

export type TaxIdsStatus = {
  hasUtr: boolean;
  hasNiNumber: boolean;
  complete: boolean;
};

export async function getTaxIdsStatus(userId: string): Promise<TaxIdsStatus> {
  const row = await prisma.clientProfile.findUnique({
    where: { userId },
    select: { utrEncrypted: true, niNumberEncrypted: true },
  });
  const hasUtr = Boolean(row?.utrEncrypted);
  const hasNiNumber = Boolean(row?.niNumberEncrypted);
  return { hasUtr, hasNiNumber, complete: hasUtr && hasNiNumber };
}

export async function saveTaxIds(userId: string, utr: string, niNumber: string): Promise<void> {
  if (!isEncryptionConfigured()) {
    throw new Error("ENCRYPTION_KEY is not configured — cannot store tax identifiers.");
  }

  await prisma.clientProfile.update({
    where: { userId },
    data: {
      utrEncrypted: encryptField(normalizeUtr(utr)),
      niNumberEncrypted: encryptField(normalizeNiNumber(niNumber)),
    },
  });
}

/** Server-only — never expose to client responses. */
export async function getDecryptedTaxIds(userId: string): Promise<{ utr: string | null; niNumber: string | null }> {
  const row = await prisma.clientProfile.findUnique({
    where: { userId },
    select: { utrEncrypted: true, niNumberEncrypted: true },
  });
  if (!row) return { utr: null, niNumber: null };
  return {
    utr: row.utrEncrypted ? decryptField(row.utrEncrypted) : null,
    niNumber: row.niNumberEncrypted ? decryptField(row.niNumberEncrypted) : null,
  };
}
