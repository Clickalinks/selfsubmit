import type { UserRole } from "@prisma/client";

import { prisma } from "@/lib/db";

export type AuditAction =
  | "auth.login"
  | "auth.logout"
  | "auth.password_change"
  | "profile.create"
  | "profile.update"
  | "profile.delete"
  | "subscription.change"
  | "billing.checkout"
  | "billing.portal"
  | "submission.create"
  | "receipt.upload"
  | "receipt.delete"
  | "account.export"
  | "admin.action"
  | "security.mfa_required";

type WriteAuditInput = {
  userId?: string | null;
  actorRole?: UserRole | null;
  action: AuditAction | string;
  resource?: string;
  resourceId?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
};

/** Append-only audit log — never update or delete rows in application code. */
export async function writeAuditLog(input: WriteAuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        actorRole: input.actorRole ?? null,
        action: input.action,
        resource: input.resource ?? null,
        resourceId: input.resourceId ?? null,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });
  } catch (err) {
    console.error("[audit-log]", input.action, err);
  }
}
