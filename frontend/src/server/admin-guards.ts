import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { isOnAdminAllowlist, requireAdminMfa } from "@/lib/admin-auth";
import { ApiAuthError, requireApiUser } from "@/lib/api-auth";
import { canAccessAdminPanel } from "@/lib/rbac";
import { MFA_SETUP_PATH } from "@/server/mfa-guards";
import type { UserRole } from "@prisma/client";

export async function requireAdminPage(returnTo = "/admin"): Promise<{ userId: string; role: UserRole }> {
  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(returnTo)}`);
  }

  let role: UserRole;
  try {
    const session = await requireApiUser();
    role = session.role;
  } catch {
    redirect("/dashboard");
  }

  if (!canAccessAdminPanel(role) || !isOnAdminAllowlist(userId)) {
    redirect("/dashboard");
  }

  try {
    await requireAdminMfa(userId);
  } catch (err) {
    if (err instanceof ApiAuthError) {
      const params = new URLSearchParams({ mfa: "required", return_url: returnTo });
      redirect(`${MFA_SETUP_PATH}?${params.toString()}`);
    }
    redirect("/dashboard");
  }

  return { userId, role };
}
