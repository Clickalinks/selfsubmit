import type { Metadata } from "next";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ReceiptUploadPanel } from "@/components/dashboard/ReceiptUploadPanel";

export const metadata: Metadata = {
  title: "Receipts — SelfSubmit",
};

export default function ReceiptsPage() {
  return (
    <DashboardCard
      title="Receipts"
      description="Upload receipt photos or PDFs. Drag and drop, choose a file, or use your camera."
    >
      <ReceiptUploadPanel />
    </DashboardCard>
  );
}
