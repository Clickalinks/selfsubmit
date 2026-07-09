import { getClientProfile } from "@/lib/profile-server";

/** Accept only same-origin relative paths for post-auth redirects. */
export function safeAppRedirectPath(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const path = value.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  return path;
}

/** Where to send a signed-in user based on whether they finished SelfSubmit registration. */
export async function resolveAuthenticatedDestination(userId: string): Promise<"/dashboard" | "/sign-up"> {
  try {
    const profile = await getClientProfile(userId);
    return profile ? "/dashboard" : "/sign-up";
  } catch (err) {
    console.error("[auth-redirect] profile lookup failed", userId, err);
    return "/dashboard";
  }
}
