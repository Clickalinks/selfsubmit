import Link from "next/link";
import { AlertTriangle, Download } from "lucide-react";

import { formatAccessDate, type SubscriptionAccess } from "@/lib/subscription-access";

type Props = {
  access: SubscriptionAccess;
  className?: string;
};

export function SubscriptionAccessBanner({ access, className = "" }: Props) {
  if (access.phase === "active" || access.phase === "none") return null;

  if (access.phase === "ending" && access.periodEnd) {
    return (
      <div
        className={`rounded-2xl border-2 border-red-400 bg-red-50 px-4 py-4 text-red-950 shadow-sm sm:px-5 sm:py-5 ${className}`}
        role="status"
      >
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden />
          <div>
            <p className="text-sm font-bold text-red-800">Subscription ending</p>
            <p className="mt-1 text-sm leading-relaxed text-red-900">
              Your plan has been cancelled. You keep full access until{" "}
              <span className="font-bold text-red-700">{formatAccessDate(access.periodEnd)}</span>. After that you have{" "}
              <strong>30 days</strong> to download your submissions and receipts, delete your account, or resubscribe.
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
              <Link href="/pricing" className="text-red-800 underline underline-offset-2">
                Resubscribe or switch plan
              </Link>
              <Link href="/dashboard/settings" className="text-red-800 underline underline-offset-2">
                Download data / delete account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (access.phase === "grace" && access.graceEndsAt) {
    return (
      <div
        className={`rounded-2xl border-2 border-amber-400 bg-amber-50 px-4 py-4 text-amber-950 shadow-sm sm:px-5 sm:py-5 ${className}`}
        role="status"
      >
        <div className="flex gap-3">
          <Download className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
          <div>
            <p className="text-sm font-bold text-amber-900">Subscription ended — grace period</p>
            <p className="mt-1 text-sm leading-relaxed text-amber-950">
              Paid features are paused. You can still download your submissions and receipts, delete your account, or
              resubscribe until{" "}
              <span className="font-bold">{formatAccessDate(access.graceEndsAt)}</span>.
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
              <Link href="/pricing" className="text-amber-950 underline underline-offset-2">
                Resubscribe to continue
              </Link>
              <Link href="/dashboard/settings" className="text-amber-950 underline underline-offset-2">
                Download data / delete account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (access.phase === "lapsed") {
    return (
      <div
        className={`rounded-2xl border-2 border-slate-300 bg-slate-50 px-4 py-4 text-slate-900 shadow-sm sm:px-5 sm:py-5 ${className}`}
        role="status"
      >
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" aria-hidden />
          <div>
            <p className="text-sm font-bold text-slate-800">No active subscription</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">
              Your grace period has ended. Resubscribe to file new records, or download your data and delete your account
              from Settings.
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
              <Link href="/pricing" className="text-brand-green underline underline-offset-2">
                Choose a plan
              </Link>
              <Link href="/dashboard/settings" className="text-slate-800 underline underline-offset-2">
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
