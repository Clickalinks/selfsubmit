import { getClientProfile } from "@/lib/profile-server";

/** Where to send a signed-in user based on whether they finished SelfSubmit onboarding. */
export async function resolveAuthenticatedDestination(userId: string): Promise<"/dashboard" | "/onboarding"> {
  const profile = await getClientProfile(userId);
  return profile ? "/dashboard" : "/onboarding";
}
