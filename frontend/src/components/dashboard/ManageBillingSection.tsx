"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, CreditCard, ExternalLink, Loader2 } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";

type Props = {
  showUpgradeCta?: boolean;
  subscriptionEnding?: boolean;
};

export function ManageBillingSection({ showUpgradeCta = true, subscriptionEnding = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPortal = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not open billing portal.");
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Could not open billing portal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardCard
      title="Subscription & billing"
      description="Manage your plan, payment method, and invoices."
    >
      {subscriptionEnding ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          Your current plan is set to end. To keep access or add more businesses under the same account (same UTR and
          NI), choose a new plan below — this renews or upgrades your subscription without creating a second account.
        </p>
      ) : (
        <p className="text-sm text-slate-600">
          Update your card or invoices in the Stripe billing portal. To add more businesses on the same UTR and NI,
          upgrade your plan from the{" "}
          <Link href="/pricing" className="font-semibold text-brand-green hover:underline">
            pricing page
          </Link>
          .
        </p>
      )}

      {error ? (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {showUpgradeCta ? (
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-green px-5 py-3 text-sm font-bold text-white hover:bg-brand-green-dark"
          >
            {subscriptionEnding ? "Renew or switch plan" : "Upgrade or switch plan"}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        ) : null}
        <button
          type="button"
          disabled={loading}
          onClick={() => void openPortal()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
          Manage billing
          <ExternalLink className="h-3.5 w-3.5 opacity-80" />
        </button>
      </div>
    </DashboardCard>
  );
}
