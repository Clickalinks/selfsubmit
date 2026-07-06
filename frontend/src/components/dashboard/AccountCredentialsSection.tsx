"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Check, KeyRound, Loader2, Mail } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";

export function AccountCredentialsSection() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <DashboardCard title="Email & password" description="Loading account security…">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      </DashboardCard>
    );
  }

  const email = user?.primaryEmailAddress?.emailAddress ?? "—";
  const emailVerified = user?.primaryEmailAddress?.verification?.status === "verified";
  const hasPassword = user?.passwordEnabled === true;

  return (
    <DashboardCard
      title="Email & password"
      description="Credentials are managed securely by our authentication provider (Clerk) using industry-standard password hashing."
    >
      <ul className="space-y-4 text-sm">
        <li className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" aria-hidden />
          <div>
            <p className="font-semibold text-slate-900">Email verification</p>
            <p className="mt-0.5 text-slate-600">{email}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
              {emailVerified ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  Verified
                </>
              ) : (
                <span className="text-amber-700">Not verified — check your inbox for a verification link</span>
              )}
            </p>
          </div>
        </li>

        <li className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3">
          <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" aria-hidden />
          <div>
            <p className="font-semibold text-slate-900">Password</p>
            <p className="mt-0.5 text-slate-600">
              {hasPassword
                ? "Passwords are hashed with strong one-way algorithms — we never store plain text passwords."
                : "You may sign in with a linked provider instead of a password."}
            </p>
            <p className="mt-2 text-slate-600">
              Change your password from your avatar (top right) → <strong>Security</strong>, or use{" "}
              <Link href="/sign-in" className="font-semibold text-brand-green underline-offset-2 hover:underline">
                password reset on sign-in
              </Link>
              .
            </p>
          </div>
        </li>
      </ul>
    </DashboardCard>
  );
}
