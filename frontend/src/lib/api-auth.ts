import type { UserRole } from "@prisma/client";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/db";
import { getRequestIp } from "@/lib/request-ip";
import {
  canAccessAdminPanel,
  roleAtLeast,
  roleFromClerkMetadata,
  type AppRole,
} from "@/lib/rbac";

export class ApiAuthError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function requireApiUser(): Promise<{ userId: string; role: UserRole }> {
  const { userId } = await auth();
  if (!userId) {
    throw new ApiAuthError(401, "Unauthorized");
  }

  let user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    let role: AppRole = "user";
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      role = roleFromClerkMetadata(clerkUser.publicMetadata);
    } catch {
      // default user role
    }
    await prisma.user.create({ data: { id: userId, role } });
    user = { role };
  }

  return { userId, role: user.role };
}

export async function requireApiRole(minimum: AppRole): Promise<{ userId: string; role: UserRole }> {
  const session = await requireApiUser();
  if (!roleAtLeast(session.role, minimum)) {
    throw new ApiAuthError(403, "Forbidden");
  }
  return session;
}

export async function requireAdminApi(): Promise<{ userId: string; role: UserRole }> {
  const session = await requireApiRole("admin");
  if (!canAccessAdminPanel(session.role)) {
    throw new ApiAuthError(403, "Forbidden");
  }
  return session;
}

export function assertResourceOwner(resourceUserId: string, sessionUserId: string, role: UserRole): void {
  if (resourceUserId === sessionUserId) return;
  if (roleAtLeast(role, "support")) return;
  throw new ApiAuthError(403, "Forbidden");
}

export function apiAuthErrorResponse(err: unknown): NextResponse {
  if (err instanceof ApiAuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error("[api-auth]", err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export function clientMetaFromRequest(req: NextRequest): { ipAddress: string | null; userAgent: string | null } {
  return {
    ipAddress: getRequestIp(req),
    userAgent: req.headers.get("user-agent"),
  };
}
