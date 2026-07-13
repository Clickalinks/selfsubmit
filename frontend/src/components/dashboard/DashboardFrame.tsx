"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { DashboardShellProfile } from "@/lib/dashboard-profile";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/businesses": "My businesses",
  "/dashboard/business-details": "Business Details",
  "/dashboard/receipts": "Receipts",
  "/dashboard/submissions": "Submissions",
  "/dashboard/hmrc-connect": "HMRC connect",
  "/dashboard/settings": "Settings",
  "/pricing": "Pricing",
  "/dashboard/settings/profile": "Edit profile",
};

type Props = {
  profile: DashboardShellProfile;
  canCreateBusiness?: boolean;
  children: ReactNode;
};

export function DashboardFrame({ profile, canCreateBusiness = false, children }: Props) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "Dashboard";

  return (
    <DashboardShell profile={profile} title={title} canCreateBusiness={canCreateBusiness}>
      {children}
    </DashboardShell>
  );
}
