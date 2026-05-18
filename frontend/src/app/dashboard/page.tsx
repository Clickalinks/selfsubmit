import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Calendar, Mail, MapPin, Phone, User } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { getClientProfile } from "@/lib/profile-server";

export const metadata: Metadata = {
  title: "Dashboard — SelfSubmit",
  description: "Your SelfSubmit client dashboard.",
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(d);
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const profile = await getClientProfile(userId);
  if (!profile) return null;

  const fullName = `${profile.firstName} ${profile.lastName}`;

  return (
    <div className="space-y-6">
      <DashboardCard title="Welcome back" description={`Hello ${profile.firstName} — here is your account overview.`}>
        <div className="flex flex-col gap-6 min-[900px]:flex-row min-[900px]:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-2xl font-bold text-white shadow-lg shadow-indigo-500/25">
            {profile.firstName.charAt(0)}
            {profile.lastName.charAt(0)}
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{fullName}</p>
            <p className="mt-1 text-sm text-slate-500">Member since {formatDate(profile.createdAt)}</p>
          </div>
        </div>
      </DashboardCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard title="Profile summary">
          <dl className="space-y-4">
            <DetailRow icon={User} label="Full name" value={fullName} />
            <DetailRow icon={MapPin} label="Home address" value={profile.homeAddress} />
            <DetailRow icon={Mail} label="Email" value={profile.email} />
            <DetailRow icon={Phone} label="Phone" value={profile.phone} />
            <DetailRow icon={Calendar} label="Account created" value={formatDate(profile.createdAt)} />
          </dl>
        </DashboardCard>

        <DashboardCard title="Quick overview" description="Shortcuts to your main areas.">
          <ul className="space-y-3 text-sm">
            <QuickLink href="/dashboard/business-details" label="View business details" />
            <QuickLink href="/dashboard/receipts" label="Manage receipts" />
            <QuickLink href="/dashboard/submissions" label="Submission history" />
            <QuickLink href="/dashboard/settings" label="Account settings" />
          </ul>
        </DashboardCard>
      </div>

      <DashboardCard title="Recent activity" description="Your latest actions will appear here as you use the app.">
        <p className="text-sm text-slate-500">No recent activity yet. Upload a receipt or complete a submission to get started.</p>
      </DashboardCard>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
        <dd className="mt-0.5 text-sm font-medium text-slate-800">{value}</dd>
      </div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link href={href} className="font-semibold text-indigo-600 underline-offset-2 transition hover:text-indigo-800 hover:underline">
        {label}
      </Link>
    </li>
  );
}
