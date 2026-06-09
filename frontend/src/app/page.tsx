import { redirect } from "next/navigation";

import { LandingView } from "@/components/landing/LandingView";
import { resolveAuthenticatedDestination } from "@/lib/auth-redirect";
import { getOptionalUserId } from "@/lib/safe-auth";

export default async function Home() {
  const userId = await getOptionalUserId();
  if (userId) {
    redirect(await resolveAuthenticatedDestination(userId));
  }

  return <LandingView />;
}
