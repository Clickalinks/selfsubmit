import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { MfaRequiredNotice } from "@/components/dashboard/MfaRequiredNotice";
import { MfaSettingsSection } from "@/components/dashboard/MfaSettingsSection";
import { getClientProfile } from "@/lib/profile-server";
import { getOptionalUserId } from "@/lib/safe-auth";
import { safeAppRedirectPath } from "@/lib/auth-redirect";
import { NOINDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Set up two-step verification — SelfSubmit",
  description: "Enable two-step verification to secure your SelfSubmit account.",
  robots: NOINDEX_ROBOTS,
};

type Props = {
  searchParams: Promise<{ return_url?: string; mfa?: string }>;
};

/**
 * MFA setup outside the dashboard shell so Clerk can send new users here
 * before their SelfSubmit profile row exists.
 */
export default async function SetupMfaPage({ searchParams }: Props) {
  const userId = await getOptionalUserId();
  if (!userId) {
    redirect("/sign-in?redirect_url=/setup-mfa");
  }

  const params = await searchParams;
  const profile = await getClientProfile(userId);
  const returnUrl =
    safeAppRedirectPath(params.return_url) ?? (profile ? "/dashboard" : "/sign-up");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 pb-16">
      <div className="border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:px-10">
          <Link href="/" className="text-sm font-semibold text-brand-green underline-offset-4 hover:underline">
            ← Home
          </Link>
          <span className="text-sm font-medium text-slate-500">Account security</span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Two-step verification</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
          Protect your account before opening the dashboard. After this is set up, continue to finish registration.
        </p>

        <div className="mt-8 space-y-6">
          <Suspense fallback={null}>
            <MfaRequiredNotice />
          </Suspense>
          <MfaSettingsSection />
          <Link
            href={returnUrl}
            className="inline-flex rounded-xl bg-brand-green px-5 py-3 text-sm font-bold text-white hover:bg-brand-green-dark"
          >
            Continue
          </Link>
        </div>
      </div>
    </div>
  );
}
