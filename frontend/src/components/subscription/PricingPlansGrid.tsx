"use client";

import Link from "next/link";
import { Check, Loader2 } from "lucide-react";

import { TIERS } from "@/data/pricingTiers";
import type { PlanId } from "@/lib/plan-config";

import { usePlanCheckout } from "./usePlanCheckout";

export function PricingPlansGrid() {
  const { isLoaded, userId, pending, error, selectPlan } = usePlanCheckout();

  if (!isLoaded) {
    return <p className="text-center text-sm text-white/60">Loading plans…</p>;
  }

  return (
    <div className="mx-auto max-w-6xl">
      {!userId ? (
        <p className="mb-6 text-center text-sm text-white/75">
          <Link href="/sign-in" className="font-semibold text-brand-green underline-offset-2 hover:underline">
            Sign in
          </Link>{" "}
          to choose a plan, or{" "}
          <Link href="/sign-up" className="font-semibold text-brand-green underline-offset-2 hover:underline">
            create an account
          </Link>{" "}
          first.
        </p>
      ) : (
        <p className="mb-6 text-center text-sm text-white/75">
          Select a plan below. Secure checkout via Stripe — cancel anytime from Settings.
        </p>
      )}

      {error ? (
        <p className="mb-6 rounded-xl border border-red-400/40 bg-red-950/40 px-4 py-3 text-center text-sm text-red-100">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {TIERS.map((tier) => {
          const isPending = pending === tier.id;
          return (
            <button
              key={tier.id}
              type="button"
              disabled={pending !== null}
              onClick={() => void selectPlan(tier.id as PlanId)}
              className={`relative flex flex-col rounded-2xl border px-5 py-6 text-left transition disabled:opacity-70 sm:px-6 sm:py-7 ${
                tier.popular
                  ? "border-brand-green/50 bg-gradient-to-b from-white/[0.12] to-white/[0.05] shadow-lg shadow-brand-green/10 ring-1 ring-brand-green/30 hover:brightness-110"
                  : "border-white/15 bg-white/[0.06] hover:bg-white/[0.1]"
              }`}
            >
              {tier.popular ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-b from-brand-green-bright to-brand-green-dark px-3 py-1 text-xs font-bold text-white shadow-btn-green">
                  Most popular
                </div>
              ) : null}
              <p className="text-xs font-bold uppercase tracking-wide text-brand-green">{tier.name}</p>
              <p className="mt-2 text-lg font-bold text-white lg:text-xl">{tier.businessesLabel}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{tier.businessesDetail}</p>
              <div className="mt-6 flex items-baseline gap-1 border-t border-white/10 pt-6">
                <span className="text-3xl font-bold tabular-nums text-white lg:text-4xl">£{tier.price}</span>
                <span className="text-sm font-medium text-white/55">/ month</span>
              </div>
              <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-white/75">
                {tier.highlights.map((line) => (
                  <li key={line} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2.5} aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <span className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-bold text-white ring-1 ring-white/20">
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  "Select plan"
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
