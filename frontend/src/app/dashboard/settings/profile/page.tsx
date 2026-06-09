import type { Metadata } from "next";
import Link from "next/link";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EditProfileForm } from "@/components/dashboard/EditProfileForm";

export const metadata: Metadata = {
  title: "Edit profile — SelfSubmit",
};

export default function EditProfilePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/dashboard/settings" className="text-sm font-semibold text-brand-green hover:underline">
        ← Back to settings
      </Link>
      <DashboardCard title="Edit profile" description="Update your personal and business details.">
        <EditProfileForm />
      </DashboardCard>
    </div>
  );
}
