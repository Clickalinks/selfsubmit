"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { DashboardShellProfile } from "@/lib/dashboard-profile";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/business-details": "Business Details",
  "/dashboard/receipts": "Receipts",
  "/dashboard/submissions": "Submissions",
  "/dashboard/settings": "Settings",
  "/dashboard/settings/profile": "Edit profile",
};

type Props = {
  profile: DashboardShellProfile;
  children: ReactNode;
};

export function DashboardFrame({ profile, children }: Props) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "Dashboard";

  return (
    <DashboardShell profile={profile} title={title}>
      {children}
    </DashboardShell>
  );
}
