import Link from "next/link";
import { Wrench } from "lucide-react";

import { getSiteSettings } from "@/lib/site-settings";
import { NOINDEX_ROBOTS } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance — SelfSubmit",
  robots: NOINDEX_ROBOTS,
};

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const settings = await getSiteSettings();
  const until =
    settings.maintenanceUntil && !Number.isNaN(settings.maintenanceUntil.getTime())
      ? settings.maintenanceUntil.toLocaleString("en-GB", {
          dateStyle: "full",
          timeStyle: "short",
          timeZone: "Europe/London",
        })
      : null;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <Wrench className="h-10 w-10 text-brand-green" aria-hidden />
      <h1 className="mt-4 text-2xl font-bold text-slate-900">SelfSubmit is temporarily unavailable</h1>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-600">
        {settings.announcementMessage?.trim() ||
          "We are performing scheduled maintenance. Your data is safe. Please try again later."}
      </p>
      {until ? (
        <p className="mt-2 text-sm font-medium text-slate-800">Expected back: {until} (UK time)</p>
      ) : null}
      <Link
        href="/"
        className="mt-8 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
      >
        Back to home
      </Link>
    </div>
  );
}
