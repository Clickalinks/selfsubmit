import Link from "next/link";
import { AlertTriangle } from "lucide-react";

type Props = {
  endDate: string;
  className?: string;
};

/** @deprecated Prefer SubscriptionAccessBanner — kept for simple end-date callouts. */
export function SubscriptionEndingBanner({ endDate, className = "" }: Props) {
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
            <span className="font-bold text-red-700">{endDate}</span>. After that you have 30 days to download your
            submissions and receipts, delete your account, or resubscribe.
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
