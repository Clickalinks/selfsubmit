import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { toDashboardShellProfile } from "@/lib/dashboard-profile";
import { getClientProfile } from "@/lib/profile-server";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  let profile;
  try {
    profile = await getClientProfile(userId);
  } catch (err) {
    console.error("[dashboard/layout] profile load failed", err);
    throw new Error(
      "We could not load your account from the database. Please try again in a minute — if this continues, contact support.",
    );
  }

  if (!profile) {
    redirect("/onboarding");
  }

  return <DashboardFrame profile={toDashboardShellProfile(profile)}>{children}</DashboardFrame>;
}
