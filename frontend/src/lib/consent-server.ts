import { prisma } from "@/lib/db";
import type { ConsentType } from "@/lib/consent-config";

export async function recordConsent(params: {
  consentType: ConsentType;
  granted: boolean;
  policyVersion: string;
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}) {
  return prisma.consentRecord.create({
    data: {
      consentType: params.consentType,
      granted: params.granted,
      policyVersion: params.policyVersion,
      userId: params.userId ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    },
  });
}
