import type { Metadata } from "next";
import Link from "next/link";

import { DeleteAccountSection } from "@/components/dashboard/DeleteAccountSection";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

export const metadata: Metadata = {
  title: "Settings — SelfSubmit",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <DashboardCard title="Account settings" description="Manage your profile and preferences.">
        <ul className="space-y-4 text-sm">
          <li>
            <Link
              href="/dashboard/settings/profile"
              className="font-semibold text-indigo-600 underline-offset-4 hover:underline"
            >
              Edit profile
            </Link>
            <p className="mt-0.5 text-slate-500">Name, contact details, and business information</p>
          </li>
          <li>
            <p className="font-semibold text-slate-800">Change password</p>
            <p className="mt-0.5 text-slate-500">
              Click your avatar (top right) → Security, or use{" "}
              <Link href="/dashboard" className="font-semibold text-indigo-600 hover:underline">
                Clerk account settings
              </Link>
              .
            </p>
          </li>
          <li>
            <p className="font-semibold text-slate-400">Notification preferences</p>
            <p className="mt-0.5 text-slate-500">Coming soon</p>
          </li>
          <li>
            <p className="font-semibold text-slate-400">Privacy settings</p>
            <p className="mt-0.5 text-slate-500">Coming soon</p>
          </li>
        </ul>
      </DashboardCard>

      <DeleteAccountSection />
    </div>
  );
}
