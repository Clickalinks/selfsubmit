import type { Metadata } from "next";

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
      description="Open any return to view details and save a PDF. To download everything and leave SelfSubmit, go to Settings → Leaving SelfSubmit."
    >
      <SubmissionsHistory highlightId={highlightId} />
    </DashboardCard>
  );
}
