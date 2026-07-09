import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AccountCredentialsSection } from "@/components/dashboard/AccountCredentialsSection";
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
            <Link
              href="/dashboard/hmrc-connect"
              className="font-semibold text-brand-green underline-offset-4 hover:underline"
            >
              HMRC connect
            </Link>
            <p className="mt-0.5 text-slate-500">
              UTR and NI number, HMRC account connection, and business linking
            </p>
          </li>
          <li>
            <p className="font-semibold text-slate-800">Password &amp; security</p>
            <p className="mt-0.5 text-slate-500">
              Email verification, password reset, two-step verification (authenticator or email OTP), and login history
              are configured in the sections below.
            </p>
          </li>
          <li>
            <p className="font-semibold text-slate-800">Email &amp; SMS reminders</p>
            <p className="mt-0.5 text-slate-500">
              Quarterly deadline reminders are sent automatically when your mobile number is saved on your profile.
            </p>
          </li>
        </ul>
      </DashboardCard>

      <ManageBillingSection />

      <AccountCredentialsSection />

      <MfaSettingsSection />

      <LoginSecuritySection />

      <DeleteAccountSection />
    </div>
  );
}
