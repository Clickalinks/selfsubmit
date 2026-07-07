"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

import { validateNiNumber, validateUtr } from "@/lib/tax-id-validation";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20";

type TaxIdsStatus = {
  hasUtr: boolean;
  hasNiNumber: boolean;
  complete: boolean;
};

export function TaxIdsSection() {
  const router = useRouter();
  const [status, setStatus] = useState<TaxIdsStatus | null>(null);
  const [utr, setUtr] = useState("");
  const [niNumber, setNiNumber] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ utr?: string; niNumber?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile/tax-ids");
      if (res.ok) {
        setStatus((await res.json()) as TaxIdsStatus);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const save = async () => {
    setFormError(null);
    const utrError = validateUtr(utr);
    const niError = validateNiNumber(niNumber);
    if (utrError || niError) {
      setFieldErrors({ utr: utrError ?? undefined, niNumber: niError ?? undefined });
      return;
    }
    setFieldErrors({});
    setSaving(true);
    try {
      const res = await fetch("/api/profile/tax-ids", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utr, niNumber }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        fieldErrors?: { utr?: string; niNumber?: string };
        complete?: boolean;
      };
      if (!res.ok) {
        setFormError(data.error ?? "Could not save tax details.");
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        return;
      }
      setStatus({
        hasUtr: true,
        hasNiNumber: true,
        complete: Boolean(data.complete),
      });
      setUtr("");
      setNiNumber("");
      setEditing(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading tax details…</p>
      </section>
    );
  }

  if (status?.complete && !editing) {
    return (
      <section id="tax-details" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900">HMRC tax details saved</h3>
            <p className="mt-1 text-sm text-slate-600">
              Your UTR and National Insurance number are stored securely. For HMRC sandbox testing, these must match
              the test user you connect with.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setFormError(null);
                  setFieldErrors({});
                }}
                className="inline-flex rounded-xl border border-emerald-300 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-100/50"
              >
                Update UTR or NI number
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const isUpdate = status?.complete && editing;

  return (
    <section id="tax-details" className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
      <h3 className="text-lg font-bold text-slate-900">
        {isUpdate ? "Update your UTR and NI number" : "UTR and NI number"}
      </h3>
      <p className="mt-2 text-sm text-slate-600">
        {isUpdate
          ? "Re-enter both values to replace what is stored. For sandbox HMRC testing, use the UTR and NI from the same test user you connect on HMRC connect."
          : "Your Unique Taxpayer Reference (UTR) and National Insurance number are required for HMRC. They are encrypted and only used for your MTD submissions."}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-800" htmlFor="dashboard-utr">
            UTR (10 digits)
          </label>
          <input
            id="dashboard-utr"
            className={inputClass}
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            placeholder="e.g. 1234567890"
            inputMode="numeric"
            autoComplete="off"
          />
          {fieldErrors.utr ? <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.utr}</p> : null}
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-800" htmlFor="dashboard-ni">
            National Insurance number
          </label>
          <input
            id="dashboard-ni"
            className={inputClass}
            value={niNumber}
            onChange={(e) => setNiNumber(e.target.value)}
            placeholder="e.g. QQ123456C"
            autoComplete="off"
          />
          {fieldErrors.niNumber ? (
            <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.niNumber}</p>
          ) : null}
        </div>
      </div>

      {formError ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{formError}</p>
      ) : null}

      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-green px-6 py-3 text-sm font-bold text-white shadow-md shadow-brand-green/30 hover:bg-brand-green-dark disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {saving ? "Saving…" : isUpdate ? "Save changes" : "Save and continue"}
      </button>
      {isUpdate ? (
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setUtr("");
            setNiNumber("");
            setFormError(null);
            setFieldErrors({});
          }}
          className="ml-3 mt-6 inline-flex rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      ) : null}
    </section>
  );
}
