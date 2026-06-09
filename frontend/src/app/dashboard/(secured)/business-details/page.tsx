import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { getClientProfile } from "@/lib/profile-server";

export const metadata: Metadata = {
  title: "Business details — SelfSubmit",
};

export default async function BusinessDetailsPage() {
  const { userId } = await auth();
  if (!userId) return null;
  const profile = await getClientProfile(userId);
  if (!profile) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <DashboardCard title="Business information">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Business name</dt>
            <dd className="mt-1 font-medium text-slate-900">{profile.businessName || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Business address</dt>
            <dd className="mt-1 whitespace-pre-wrap font-medium text-slate-900">{profile.businessAddress}</dd>
          </div>
          {profile.businessSameAsHome ? (
            <p className="rounded-xl bg-brand-mint px-4 py-3 text-sm text-brand-forest">
              Business address matches your home address (selected at registration).
            </p>
          ) : null}
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</dt>
            <dd className="mt-1">
              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                Active
              </span>
            </dd>
          </div>
        </dl>
        <Link
          href="/dashboard/settings/profile"
          className="mt-6 inline-flex rounded-xl bg-brand-green px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-brand-green-dark"
        >
          Edit business information
        </Link>
      </DashboardCard>
    </div>
  );
}
