import type { Metadata } from "next";

import { SubmissionDetail } from "@/components/dashboard/SubmissionDetail";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

export const metadata: Metadata = {
  title: "Submission — SelfSubmit",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SubmissionDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <DashboardCard title="Submission details" description="View your filed return, receipts, and save a PDF copy.">
      <SubmissionDetail submissionId={id} />
    </DashboardCard>
  );
}
