import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { DeleteAccountSection } from "@/components/dashboard/DeleteAccountSection";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { LoginSecuritySection } from "@/components/dashboard/LoginSecuritySection";
import { MfaRequiredNotice } from "@/components/dashboard/MfaRequiredNotice";
import { MfaSettingsSection } from "@/components/dashboard/MfaSettingsSection";
import { ManageBillingSection } from "@/components/dashboard/ManageBillingSection";
export const metadata: Metadata = {
  title: "Settings — SelfSubmit",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Suspense fallback={null}>
        <MfaRequiredNotice />
      </Suspense>

      <DashboardCard title="Account settings" description="Manage your profile and preferences.">
        <ul className="space-y-4 text-sm">
          <li>
            <Link
              href="/dashboard/settings/profile"
              className="font-semibold text-brand-green underline-offset-4 hover:underline"
            >
              Edit profile
            </Link>
            <p className="mt-0.5 text-slate-500">Name, contact details, and business information</p>
          </li>
          <li>
            <p className="font-semibold text-slate-800">Password & security</p>
            <p className="mt-0.5 text-slate-500">
              Change your password via your avatar (top right) → Security. Enable MFA in the section below.
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

      <ManageBillingSection />

      <MfaSettingsSection />

      <LoginSecuritySection />

      <DeleteAccountSection />
    </div>
  );
}
