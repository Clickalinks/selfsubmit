import { headers } from "next/headers";
import type { ReactNode } from "react";

import { requireMfaForPage } from "@/server/mfa-guards";

/** Wraps dashboard pages that require MFA (settings is exempt). */
export default async function SecuredDashboardLayout({ children }: { children: ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "/dashboard";
  await requireMfaForPage(pathname);
  return children;
}
