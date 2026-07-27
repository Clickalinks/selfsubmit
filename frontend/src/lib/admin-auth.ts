import { clerkClient } from "@clerk/nextjs/server";

import { ApiAuthError, requireAdminApi } from "@/lib/api-auth";
import { userHasMfaEnabled } from "@/lib/mfa-server";
import type { UserRole } from "@prisma/client";

/**
 * Optional hard allowlist. When set, user must be admin+ AND listed.
 * Example: ADMIN_USER_IDS=user_abc,user_def
 */
export function adminAllowlist(): Set<string> | null {
  const raw = process.env.ADMIN_USER_IDS?.trim();
  if (!raw) return null;
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.length ? new Set(ids) : null;
}

export function isOnAdminAllowlist(userId: string): boolean {
  const list = adminAllowlist();
  if (!list) return true;
  return list.has(userId);
}

/** Admin panel always requires MFA (even if MFA_REQUIRED=false for customers). */
export async function requireAdminMfa(userId: string): Promise<void> {
  const enabled = await userHasMfaEnabled(userId);
  if (enabled === false) {
    throw new ApiAuthError(403, "Admin access requires multi-factor authentication.");
  }
}

export async function requireSecureAdminApi(): Promise<{ userId: string; role: UserRole }> {
  const session = await requireAdminApi();
  if (!isOnAdminAllowlist(session.userId)) {
    throw new ApiAuthError(403, "Forbidden");
  }
  await requireAdminMfa(session.userId);
  return session;
}

/** Sync Clerk publicMetadata.role so future sessions stay consistent. */
export async function syncClerkAdminRole(userId: string, role: UserRole): Promise<void> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    await client.users.updateUser(userId, {
      publicMetadata: {
        ...(user.publicMetadata as Record<string, unknown>),
        role,
      },
    });
  } catch (err) {
    console.error("[admin-auth] failed to sync Clerk role", userId, err);
  }
}
