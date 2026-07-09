import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { DashboardDbUnavailable } from "@/components/dashboard/DashboardDbUnavailable";
import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { toDashboardShellProfile } from "@/lib/dashboard-profile";
import { getClientProfile } from "@/lib/profile-server";
import { NOINDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
};

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
    return <DashboardDbUnavailable />;
  }

  if (!profile) {
    redirect("/sign-up");
  }

  return <DashboardFrame profile={toDashboardShellProfile(profile)}>{children}</DashboardFrame>;
}
