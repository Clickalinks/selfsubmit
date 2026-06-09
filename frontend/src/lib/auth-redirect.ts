import { getClientProfile } from "@/lib/profile-server";

/** Where to send a signed-in user based on whether they finished SelfSubmit onboarding. */
export async function resolveAuthenticatedDestination(userId: string): Promise<"/dashboard" | "/onboarding"> {
  try {
    const profile = await getClientProfile(userId);
    return profile ? "/dashboard" : "/onboarding";
  } catch (err) {
    console.error("[auth-redirect] profile lookup failed", userId, err);
    return "/dashboard";
  }
}
