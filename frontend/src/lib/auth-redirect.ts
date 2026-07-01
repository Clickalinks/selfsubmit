import { getClientProfile } from "@/lib/profile-server";

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
