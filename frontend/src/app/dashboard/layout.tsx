import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { getClientProfile } from "@/lib/profile-server";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  const profile = await getClientProfile(userId);
  if (!profile) {
    redirect("/onboarding");
  }

  return <DashboardFrame profile={profile}>{children}</DashboardFrame>;
}
