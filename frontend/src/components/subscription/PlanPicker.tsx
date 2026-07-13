"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

import { TIERS } from "@/data/pricingTiers";
import type { PlanId } from "@/lib/plan-config";

export function PlanPicker() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectPlan = useCallback(
    async (plan: PlanId) => {
      setError(null);
      setPending(plan);
      try {
        const res = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          url?: string;
          mode?: "stripe" | "manual" | "upgrade";
        };
        if (!res.ok) {
          setError(data.error ?? "Could not start checkout.");
          return;
        }
        if ((data.mode === "stripe" || data.mode === "upgrade") && data.url) {
          window.location.assign(data.url);
          return;
        }
        router.push("/add-business");
        router.refresh();
      } finally {
        setPending(null);
      }
    },
    [router],
  );

  if (!isLoaded) {
    return <p className="text-center text-sm text-white/60">Loading…</p>;
  }

  if (!userId) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-white/15 bg-white/[0.06] px-6 py-8 text-center">
        <p className="text-sm text-white/80">Sign in to choose a plan and continue.</p>
        <div className="mt-5 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link
            href="/sign-up"
            className="rounded-full bg-gradient-to-b from-brand-green-bright to-brand-green-dark px-8 py-3 text-center text-sm font-bold text-white shadow-btn-green transition hover:brightness-105"
          >
            Create account
          </Link>
          <Link
            href="/sign-in"
            className="rounded-full border border-white/25 px-8 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-center text-sm font-semibold text-white">Select your plan</p>
      <p className="mx-auto mt-2 max-w-xl text-center text-xs text-white/60">
        Secure checkout via Stripe. Cancel anytime from Settings → Manage billing.
      </p>
      {error ? (
        <p className="mt-4 rounded-xl border border-red-400/40 bg-red-950/40 px-4 py-3 text-center text-sm text-red-100">
          {error}
        </p>
      ) : null}
      <div className="mt-6 grid gap-3 min-[640px]:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((tier) => (
          <button
            key={tier.id}
            type="button"
            disabled={pending !== null}
            onClick={() => void selectPlan(tier.id)}
            className={`rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition disabled:opacity-60 ${
              tier.popular
                ? "border-brand-green/50 bg-gradient-to-b from-white/[0.14] to-white/[0.06] text-white ring-1 ring-brand-green/35 hover:brightness-110"
                : "border-white/15 bg-white/[0.06] text-white hover:bg-white/[0.1]"
            }`}
          >
            <span className="block text-xs font-bold uppercase tracking-wide text-brand-green/90">{tier.name}</span>
            <span className="mt-1 block text-lg font-bold">£{tier.price}/mo</span>
            <span className="mt-1 block text-xs font-normal text-white/70">{tier.businessesLabel}</span>
            {pending === tier.id ? "Redirecting…" : "Choose plan"}
          </button>
        ))}
      </div>
    </div>
  );
}

