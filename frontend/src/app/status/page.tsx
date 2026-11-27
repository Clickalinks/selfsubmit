import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";

import { SitePageHero, SitePageShell } from "@/components/landing/SitePageShell";
import { SystemStatusBoard } from "@/components/status/SystemStatusBoard";
import { COMPANY } from "@/lib/company-details";
import { getSystemHealthSnapshot } from "@/lib/system-status";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "System status — SelfSubmit",
  description: "Live operational status for SelfSubmit services including sign-in, records, billing, and HMRC updates.",
};

export default async function StatusPage() {
  noStore();
  const snapshot = await getSystemHealthSnapshot();
  const hasIssues = snapshot.services.some((s) => s.status !== "operational");

  return (
    <SitePageShell>
      <SitePageHero
        eyebrow="Status"
        title="System status"
        description={
          snapshot.maintenanceMode
            ? "Scheduled maintenance is in progress. Signed-in areas may be limited."
            : hasIssues
              ? "Some services may be limited. We will post updates here during incidents."
              : "All core services are running normally."
        }
      />

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <SystemStatusBoard initial={snapshot} />

        <div className="mt-8 rounded-2xl border border-slate-200/80 bg-slate-50 px-5 py-6 sm:px-8">
          <h2 className="text-base font-bold text-brand-black">Report an issue</h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-muted">
            If something is not working as expected, email{" "}
            <a
              href={`mailto:${COMPANY.supportEmail}`}
              className="font-semibold text-brand-green underline underline-offset-2"
            >
              {COMPANY.supportEmail}
            </a>{" "}
            with the page you were using and any error message you saw.
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/contact" className="text-brand-green underline-offset-2 hover:underline">
              Contact page →
            </Link>
            <Link href="/security" className="text-brand-green underline-offset-2 hover:underline">
              Security →
            </Link>
          </div>
        </div>
      </div>
    </SitePageShell>
  );
}
