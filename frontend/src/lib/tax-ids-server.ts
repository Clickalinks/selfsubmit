import { prisma } from "@/lib/db";
import { decryptField, encryptField, isEncryptionConfigured } from "@/lib/field-encryption";
import { normalizeNiNumber, normalizeUtr } from "@/lib/tax-id-validation";

export type TaxIdsStatus = {
  hasUtr: boolean;
  hasNiNumber: boolean;
  complete: boolean;
  locked: boolean;
};

export class TaxIdsLockedError extends Error {
  constructor() {
    super("UTR and National Insurance number are locked.");
    this.name = "TaxIdsLockedError";
  }
}

export async function getTaxIdsStatus(userId: string): Promise<TaxIdsStatus> {
  const row = await prisma.clientProfile.findUnique({
    where: { userId },
    select: { utrEncrypted: true, niNumberEncrypted: true, taxIdsConfirmedAt: true },
  });
  const hasUtr = Boolean(row?.utrEncrypted);
  const hasNiNumber = Boolean(row?.niNumberEncrypted);
  const complete = hasUtr && hasNiNumber;

  // Existing saved IDs (before confirm-and-lock) stay locked so they cannot be swapped.
  if (complete && !row?.taxIdsConfirmedAt) {
    await prisma.clientProfile.update({
      where: { userId },
      data: { taxIdsConfirmedAt: new Date() },
    });
    return { hasUtr, hasNiNumber, complete, locked: true };
  }

  return { hasUtr, hasNiNumber, complete, locked: Boolean(row?.taxIdsConfirmedAt) };
}

export async function saveTaxIds(userId: string, utr: string, niNumber: string): Promise<void> {
  if (!isEncryptionConfigured()) {
    throw new Error("ENCRYPTION_KEY is not configured — cannot store tax identifiers.");
  }

  const existing = await prisma.clientProfile.findUnique({
    where: { userId },
    select: { utrEncrypted: true, niNumberEncrypted: true, taxIdsConfirmedAt: true },
  });
  if (!existing) {
    throw new Error("Profile not found");
  }

  const alreadyComplete = Boolean(existing.utrEncrypted && existing.niNumberEncrypted);
  if (existing.taxIdsConfirmedAt || alreadyComplete) {
    throw new TaxIdsLockedError();
  }

  await prisma.clientProfile.update({
    where: { userId },
    data: {
      utrEncrypted: encryptField(normalizeUtr(utr)),
      niNumberEncrypted: encryptField(normalizeNiNumber(niNumber)),
      taxIdsConfirmedAt: new Date(),
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
