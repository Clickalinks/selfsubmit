import type { UserRole } from "@prisma/client";

export const ROLES = ["user", "support", "admin", "super_admin"] as const;
export type AppRole = (typeof ROLES)[number];

const ROLE_RANK: Record<AppRole, number> = {
  user: 0,
  support: 1,
  admin: 2,
  super_admin: 3,
};

export function isAppRole(value: string): value is AppRole {
  return (ROLES as readonly string[]).includes(value);
}

export function roleAtLeast(role: UserRole | AppRole, minimum: AppRole): boolean {
  return ROLE_RANK[role as AppRole] >= ROLE_RANK[minimum];
}

export function canAccessAdminPanel(role: UserRole | AppRole): boolean {
  return roleAtLeast(role, "admin");
}

export function canAccessSupportTools(role: UserRole | AppRole): boolean {
  return roleAtLeast(role, "support");
}

/** Clerk publicMetadata.role can bootstrap app role on first login. */
export function roleFromClerkMetadata(metadata: unknown): AppRole {
  if (!metadata || typeof metadata !== "object") return "user";
  const role = (metadata as { role?: unknown }).role;
  return typeof role === "string" && isAppRole(role) ? role : "user";
}
