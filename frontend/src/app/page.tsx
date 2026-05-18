import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { LandingView } from "@/components/landing/LandingView";
import { resolveAuthenticatedDestination } from "@/lib/auth-redirect";

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect(await resolveAuthenticatedDestination(userId));
  }

  return <LandingView />;
}
