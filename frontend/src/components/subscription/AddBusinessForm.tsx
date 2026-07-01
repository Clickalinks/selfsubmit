"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ALL_PROFESSIONS } from "@/data/expenseCategories";

type StatusPayload = {
  plan: string | null;
  businessCount: number;
  maxBusinesses: number | null;
  canCreateBusiness: boolean;
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
  }, []);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const atLimit = status && !status.canCreateBusiness;
  const disabled = submitting || !status?.canCreateBusiness;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (disabled) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/business/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setFormError(data.error ?? "Could not create business.");
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

  return (
    <div className="mx-auto max-w-lg">
      <p className="text-sm text-brand-muted">
        You have <strong className="text-brand-black">{status.businessCount}</strong>
        {status.maxBusinesses === null
          ? " businesses (unlimited on your plan)."
          : ` of ${status.maxBusinesses} businesses allowed on your plan.`}
      </p>

      {atLimit ? (
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
