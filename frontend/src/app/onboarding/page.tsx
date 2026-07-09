import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getOptionalUserId } from "@/lib/safe-auth";
import { resolveAuthenticatedDestination } from "@/lib/auth-redirect";
import { NOINDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Complete your profile — SelfSubmit",
  description: "Finish setting up your SelfSubmit client account.",
  robots: NOINDEX_ROBOTS,
};

/** Legacy route — registration is completed on /sign-up only. */
export default async function OnboardingPage() {
  const userId = await getOptionalUserId();
  if (!userId) {
    redirect("/sign-in?redirect_url=/sign-up");
  }

  redirect(await resolveAuthenticatedDestination(userId));
}
