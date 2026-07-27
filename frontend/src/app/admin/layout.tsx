import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { NOINDEX_ROBOTS } from "@/lib/seo";
import { requireAdminPage } from "@/server/admin-guards";

export const metadata: Metadata = {
  title: "Admin — SelfSubmit",
  robots: NOINDEX_ROBOTS,
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { role } = await requireAdminPage("/admin");
  return <AdminShell role={role}>{children}</AdminShell>;
}
