import { AlertTriangle } from "lucide-react";

type Props = {
  endDate: string;
  className?: string;
};

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
            <span className="font-bold text-red-700">{endDate}</span>. After that date you will need to choose a new
            plan to continue using SelfSubmit.
          </p>
        </div>
      </div>
    </div>
  );
}
