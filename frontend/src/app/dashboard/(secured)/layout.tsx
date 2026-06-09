import type { ReactNode } from "react";

import { requireMfaForPage } from "@/server/mfa-guards";

/** Wraps dashboard pages that require MFA (settings is exempt). */
export default async function SecuredDashboardLayout({ children }: { children: ReactNode }) {
  await requireMfaForPage("/dashboard");
  return children;
}
