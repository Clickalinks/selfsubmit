"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Lock } from "lucide-react";

import { COMPANY } from "@/lib/company-details";
import {
  formatNiNumberForDisplay,
  normalizeUtr,
  validateNiNumber,
  validateUtr,
} from "@/lib/tax-id-validation";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20";

type TaxIdsStatus = {
  hasUtr: boolean;
  hasNiNumber: boolean;
  complete: boolean;
  locked?: boolean;
};

export function TaxIdsSection() {
  const router = useRouter();
  const [status, setStatus] = useState<TaxIdsStatus | null>(null);
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [utr, setUtr] = useState("");
  const [niNumber, setNiNumber] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ utr?: string; niNumber?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const goToConfirm = () => {
    setFormError(null);
    const utrError = validateUtr(utr);
    const niError = validateNiNumber(niNumber);
    if (utrError || niError) {
      setFieldErrors({ utr: utrError ?? undefined, niNumber: niError ?? undefined });
      return;
    }
    setFieldErrors({});
    setConfirmed(false);
    setStep("confirm");
  };

  const save = async () => {
    if (!confirmed) {
      setFormError("Please tick the box to confirm these details are correct.");
      return;
    }
    setFormError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/profile/tax-ids", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utr, niNumber, confirm: true }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        fieldErrors?: { utr?: string; niNumber?: string };
        complete?: boolean;
        locked?: boolean;
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
        locked: Boolean(data.locked),
      });
      setUtr("");
      setNiNumber("");
      setConfirmed(false);
      setStep("enter");
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

  if (status?.complete) {
    return (
      <section id="tax-details" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900">HMRC tax details locked</h3>
            <p className="mt-1 text-sm text-slate-600">
              Your UTR and National Insurance number are stored securely and cannot be changed here. This stops them
              being swapped for another person&apos;s details. If you made a genuine mistake, email{" "}
              <a className="font-semibold text-brand-green underline" href={`mailto:${COMPANY.supportEmail}`}>
                {COMPANY.supportEmail}
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (step === "confirm") {
    return (
      <section id="tax-details" className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-lg font-bold text-slate-900">Confirm your UTR and NI number</h3>
        <p className="mt-2 text-sm text-slate-600">
          Check these carefully. After you confirm, they are locked to this account.
        </p>
        <dl className="mt-6 space-y-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm">
          <div>
            <dt className="font-semibold text-slate-500">UTR</dt>
            <dd className="mt-0.5 font-mono text-base font-bold tracking-wide text-slate-900">{normalizeUtr(utr)}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-500">National Insurance number</dt>
            <dd className="mt-0.5 font-mono text-base font-bold tracking-wide text-slate-900">
              {formatNiNumberForDisplay(niNumber)}
            </dd>
          </div>
        </dl>
        <label className="mt-5 flex items-start gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-green focus:ring-brand-green"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          <span>I confirm these are my UTR and National Insurance number, entered correctly.</span>
        </label>
        {formError ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{formError}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || !confirmed}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-6 py-3 text-sm font-bold text-white shadow-md shadow-brand-green/30 hover:bg-brand-green-dark disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {saving ? "Locking…" : "Confirm and lock"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              setStep("enter");
              setConfirmed(false);
              setFormError(null);
            }}
            className="inline-flex rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Edit details
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="tax-details" className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
      <h3 className="text-lg font-bold text-slate-900">UTR and NI number</h3>
      <p className="mt-2 text-sm text-slate-600">
        Enter your Unique Taxpayer Reference (UTR) and National Insurance number. You will confirm them on the next
        step. After that they are locked. They are encrypted and only used for your MTD submissions.
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
        onClick={goToConfirm}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-green px-6 py-3 text-sm font-bold text-white shadow-md shadow-brand-green/30 hover:bg-brand-green-dark"
      >
        Continue to confirm
      </button>
    </section>
  );
}
