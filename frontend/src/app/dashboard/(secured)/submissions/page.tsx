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
      description="Open any return below to view details and save a PDF. For a full account backup, go to Settings → Delete account."
    >
      <SubmissionsHistory highlightId={highlightId} />
    </DashboardCard>
  );
}
