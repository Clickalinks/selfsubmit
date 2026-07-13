"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";

import type { PlanId } from "@/lib/plan-config";

import { usePlanCheckout } from "./usePlanCheckout";

type Props = {
  planId: PlanId;
  className?: string;
  label?: string;
};

export function PlanSubscribeButton({
  planId,
  className = "",
  label = "Start 3-month free trial",
}: Props) {
  const { isLoaded, userId, pending, error, selectPlan } = usePlanCheckout();

  if (!isLoaded) {
    return <p className="text-sm text-brand-muted">Loading…</p>;
  }

  if (!userId) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/sign-up?redirect_url=${encodeURIComponent(`/pricing/${planId}`)}`}
          className={`inline-flex items-center justify-center rounded-full bg-brand-green px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-green-dark ${className}`}
        >
          Start 3-month free trial
        </Link>
        <Link
          href={`/sign-in?redirect_url=${encodeURIComponent(`/pricing/${planId}`)}`}
          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-bold text-brand-black transition hover:bg-slate-50"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}
      <button
        type="button"
        disabled={pending !== null}
        onClick={() => void selectPlan(planId)}
        className={`inline-flex items-center justify-center gap-2 rounded-full bg-brand-green px-8 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-green-dark disabled:opacity-70 ${className}`}
      >
        {pending === planId ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting to checkout…
          </>
        ) : (
          label
        )}
      </button>
      <p className="mt-3 text-xs text-brand-muted">
        Card required · no charge for 3 months · then your plan price. Cancel anytime from Settings.
      </p>
    </div>
  );
}
