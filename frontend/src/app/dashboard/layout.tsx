import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { DashboardDbUnavailable } from "@/components/dashboard/DashboardDbUnavailable";
import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { isOnAdminAllowlist } from "@/lib/admin-auth";
import { toDashboardShellProfile } from "@/lib/dashboard-profile";
import { prisma } from "@/lib/db";
import { getClientProfile } from "@/lib/profile-server";
import { canAccessAdminPanel } from "@/lib/rbac";
import { canCreateBusiness } from "@/lib/subscription-server";
import { getSiteSettings } from "@/lib/site-settings";
import { NOINDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  try {
    const settings = await getSiteSettings();
    if (settings.maintenanceMode) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      const isAdmin = user && canAccessAdminPanel(user.role) && isOnAdminAllowlist(userId);
      if (!isAdmin) {
        redirect("/maintenance");
      }
    }
  } catch (err) {
    console.error("[dashboard/layout] maintenance check failed", err);
  }

  let profile;
  let allowCreateBusiness = false;
  try {
    profile = await getClientProfile(userId);
    allowCreateBusiness = await canCreateBusiness(userId);
  } catch (err) {
    console.error("[dashboard/layout] profile load failed", err);
    return <DashboardDbUnavailable />;
  }

  if (!profile) {
    redirect("/sign-up?redirect_url=/dashboard");
  }

  return (
    <DashboardFrame profile={toDashboardShellProfile(profile)} canCreateBusiness={allowCreateBusiness}>
      {children}
    </DashboardFrame>
  );
}
