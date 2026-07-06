import type { Metadata } from "next";

import { DataExportButton } from "@/components/dashboard/DataExportButton";
import { SubmissionsHistory } from "@/components/dashboard/SubmissionsHistory";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

export const metadata: Metadata = {
  title: "Submissions — SelfSubmit",
};

type Props = {
  searchParams: Promise<{ submitted?: string }>;
};

export default async function SubmissionsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const highlightId = typeof sp.submitted === "string" ? sp.submitted : null;

  return (
    <DashboardCard
      title="Submission history"
      description="Your filed monthly returns, HMRC references, and period summaries."
    >
      <div className="submission-no-print mb-6 rounded-xl border border-brand-mint bg-brand-mint/40 px-4 py-4">
        <p className="text-sm text-brand-forest">
          Download a ZIP of your profile, all submissions, and receipt files — or open any return below to view details
          and save a PDF.
        </p>
        <DataExportButton className="mt-3" />
      </div>
      <SubmissionsHistory highlightId={highlightId} />
    </DashboardCard>
  );
}
