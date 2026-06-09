import { redirect } from "next/navigation";

import { isMfaEnforcementEnabled, userHasMfaEnabled } from "@/lib/mfa-server";
import { requireClerkUserId } from "@/server/subscription-guards";

export const MFA_SETUP_PATH = "/dashboard/settings";

/** Redirect to MFA setup unless enforcement is disabled or MFA is already enabled. */
export async function requireMfaEnabled(userId: string, returnTo: string): Promise<void> {
  if (!isMfaEnforcementEnabled()) return;

  const enabled = await userHasMfaEnabled(userId);
  if (enabled === null) return;
  if (enabled) return;

  const params = new URLSearchParams({ mfa: "required", return_url: returnTo });
  redirect(`${MFA_SETUP_PATH}?${params.toString()}`);
}

/** Convenience helper for server pages — resolves user id then enforces MFA. */
export async function requireMfaForPage(returnTo: string): Promise<string> {
  const userId = await requireClerkUserId(returnTo);
  await requireMfaEnabled(userId, returnTo);
  return userId;
}
