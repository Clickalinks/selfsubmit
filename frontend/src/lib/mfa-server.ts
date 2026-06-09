import { clerkClient } from "@clerk/nextjs/server";

/** Returns true when the Clerk user has at least one second factor enabled. */
export async function userHasMfaEnabled(userId: string): Promise<boolean> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.twoFactorEnabled === true;
  } catch {
    return false;
  }
}

export function isMfaEnforcementEnabled(): boolean {
  const flag = process.env.MFA_REQUIRED?.trim().toLowerCase();
  if (flag === "false" || flag === "0") return false;
  return true;
}
