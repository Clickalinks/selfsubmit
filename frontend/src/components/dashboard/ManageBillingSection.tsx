"use client";

import { useState } from "react";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";

export function ManageBillingSection() {
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
      description="Manage your plan, payment method, and invoices through Stripe."
    >
      <p className="text-sm text-slate-600">
        To change plan or update card details, open the secure billing portal. New subscriptions are chosen on the{" "}
        <a href="/pricing" className="font-semibold text-brand-green hover:underline">
          pricing page
        </a>
        .
      </p>
      {error ? (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}
      <button
        type="button"
        disabled={loading}
        onClick={() => void openPortal()}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-ink px-5 py-3 text-sm font-bold text-white hover:bg-brand-ink/90 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
        Manage billing
        <ExternalLink className="h-3.5 w-3.5 opacity-80" />
      </button>
    </DashboardCard>
  );
}
