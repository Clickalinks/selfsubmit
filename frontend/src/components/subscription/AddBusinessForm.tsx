"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ALL_PROFESSIONS } from "@/data/expenseCategories";

type PrimaryBusiness = {
  id: string;
  name: string;
  category: string;
};

type StatusPayload = {
  plan: string | null;
  businessCount: number;
  maxBusinesses: number;
  canCreateBusiness: boolean;
  primaryBusiness: PrimaryBusiness | null;
};

const UPGRADE_HINT = "Upgrade your plan to add more businesses.";

export function AddBusinessForm() {
  const router = useRouter();
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(ALL_PROFESSIONS[0] ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    setLoadError(null);
    const res = await fetch("/api/subscription/status", { method: "GET" });
    if (!res.ok) {
      setLoadError("Could not load subscription status.");
      return;
    }
    const data = (await res.json()) as StatusPayload;
    setStatus(data);
    if (data.primaryBusiness) {
      setName(data.primaryBusiness.name);
      setCategory(data.primaryBusiness.category || ALL_PROFESSIONS[0] || "");
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const setupExisting =
    Boolean(status && !status.canCreateBusiness && status.businessCount === 1 && status.primaryBusiness);
  const blockedAtLimit = Boolean(status && !status.canCreateBusiness && status.businessCount > 1);
  const disabled = submitting || blockedAtLimit || (!status?.canCreateBusiness && !setupExisting);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (disabled || !status) return;
    setSubmitting(true);
    try {
      const endpoint = setupExisting ? "/api/business/setup" : "/api/business/create";
      const method = setupExisting ? "PATCH" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setFormError(data.error ?? "Could not save your business.");
        return;
      }
      router.push("/submit");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return <p className="text-sm text-red-700">{loadError}</p>;
  }

  if (!status) {
    return <p className="text-sm text-brand-muted">Loading…</p>;
  }

  if (blockedAtLimit) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-6 text-sm text-emerald-950">
        <p className="font-semibold">Your businesses are set up on this plan.</p>
        <p className="mt-2 text-emerald-900">
          You have {status.businessCount} of {status.maxBusinesses} businesses. Open your return form to add income and
          expenses.
        </p>
        <Link
          href="/submit"
          className="mt-4 inline-flex rounded-xl bg-brand-green px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-green-dark"
        >
          Open my form
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <p className="text-sm text-brand-muted">
        You have <strong className="text-brand-black">{status.businessCount}</strong> of{" "}
        <strong className="text-brand-black">{status.maxBusinesses}</strong> businesses allowed on your plan (maximum 4
        on any plan).
      </p>

      {setupExisting ? (
        <p className="mt-4 rounded-xl border border-brand-green/20 bg-brand-mint/40 px-4 py-3 text-sm text-brand-forest">
          Confirm your business name and profession below, then continue to your income and expense form.
        </p>
      ) : null}

      {!setupExisting && status.businessCount > 0 && !status.canCreateBusiness ? (
        <div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-semibold">{UPGRADE_HINT}</p>
          <Link href="/pricing" className="mt-2 inline-block font-semibold text-brand-green underline underline-offset-2">
            View plans
          </Link>
        </div>
      ) : null}

      <form className="mt-8 space-y-5" onSubmit={(e) => void onSubmit(e)}>
        <div>
          <label htmlFor="biz-name" className="block text-sm font-semibold text-brand-black">
            Business name
          </label>
          <input
            id="biz-name"
            name="name"
            required
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/15 px-4 py-3 text-sm text-brand-black outline-none ring-brand-green/30 focus:ring-2"
            placeholder="e.g. City Cabs Ltd"
          />
        </div>
        <div>
          <label htmlFor="biz-category" className="block text-sm font-semibold text-brand-black">
            Profession
          </label>
          <p className="mt-1 text-xs text-brand-muted">
            This cannot be changed later on the Solo plan. Other professions will not be available on your return form.
          </p>
          <select
            id="biz-category"
            name="category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-brand-black outline-none ring-brand-green/30 focus:ring-2"
          >
            {ALL_PROFESSIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {formError ? <p className="text-sm text-red-700">{formError}</p> : null}

        <button
          type="submit"
          disabled={disabled}
          className="w-full rounded-2xl bg-gradient-to-b from-brand-green-bright to-brand-green-dark px-6 py-3.5 text-sm font-bold text-white shadow-btn-green transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Save and open my form"}
        </button>
      </form>
    </div>
  );
}
