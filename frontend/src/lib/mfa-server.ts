import { clerkClient } from "@clerk/nextjs/server";

/** Returns true/false when known; null when Clerk could not be reached (avoid false MFA redirects). */
export async function userHasMfaEnabled(userId: string): Promise<boolean | null> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.twoFactorEnabled === true;
  } catch (err) {
    console.error("[mfa-server] Clerk user lookup failed", userId, err);
    return null;
  }
}

export function isMfaEnforcementEnabled(): boolean {
  const flag = process.env.MFA_REQUIRED?.trim().toLowerCase();
  if (flag === "false" || flag === "0") return false;
  return true;
}
