"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, Check, Eye, Loader2, Send } from "lucide-react";

type ObligationRow = {
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  status: string;
};

type QuarterlyPreview = {
  taxYear: string;
  periodStartDate: string;
  periodEndDate: string;
  turnover: number;
  otherIncome: number;
  consolidatedExpenses: number;
  netProfit: number;
  monthlyRecordCount: number;
};

type Props = {
  hmrcConnected: boolean;
  hmrcSandboxReady: boolean;
  sandboxFilingEnabled: boolean;
  activeBusinessId: string | null;
  activeBusinessName: string | null;
  activeBusinessHmrcId: string | null;
  anyBusinessHmrcLinked: boolean;
};

function formatGbp(amount: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function HmrcSandboxStatusCard({
  hmrcConnected,
  hmrcSandboxReady,
  sandboxFilingEnabled,
  activeBusinessId,
  activeBusinessName,
  activeBusinessHmrcId,
  anyBusinessHmrcLinked,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [obligations, setObligations] = useState<ObligationRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<QuarterlyPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!hmrcSandboxReady || !activeBusinessHmrcId) {
      setObligations(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const params = new URLSearchParams({ businessId: activeBusinessHmrcId });
        const res = await fetch(`/api/hmrc/obligations?${params.toString()}`);
        const data = (await res.json().catch(() => ({}))) as {
          obligations?: ObligationRow[];
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Could not load HMRC obligations.");
          setObligations(null);
          return;
        }
        setObligations(data.obligations ?? []);
      } catch {
        if (!cancelled) setError("Could not load HMRC obligations.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeBusinessHmrcId, hmrcSandboxReady]);

  const loadPreview = async () => {
    if (!activeBusinessId) return;
    setBusy("preview");
    setPreviewError(null);
    setSubmitMessage(null);
    try {
      const params = new URLSearchParams({ businessId: activeBusinessId });
      const res = await fetch(`/api/hmrc/quarterly-preview?${params.toString()}`);
      const data = (await res.json().catch(() => ({}))) as { preview?: QuarterlyPreview; error?: string };
      if (!res.ok) {
        setPreviewError(data.error ?? "Could not load preview.");
        setPreview(null);
        return;
      }
      setPreview(data.preview ?? null);
    } catch {
      setPreviewError("Could not load preview.");
    } finally {
      setBusy(null);
    }
  };

  const submitToHmrc = async () => {
    if (!activeBusinessId) return;
    setBusy("submit");
    setPreviewError(null);
    setSubmitMessage(null);
    try {
      const deviceId = (() => {
        const key = "hmrc_device_id";
        let id = localStorage.getItem(key);
        if (!id) {
          id = crypto.randomUUID();
          localStorage.setItem(key, id);
        }
        return id;
      })();
      const screen = window.screen;
      await fetch("/api/hmrc/fraud-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          browserJsUserAgent: navigator.userAgent,
          screens: `width=${screen.width}&height=${screen.height}&scaling-factor=${window.devicePixelRatio || 1}&colour-depth=${screen.colorDepth}`,
          windowSize: `width=${window.innerWidth}&height=${window.innerHeight}`,
        }),
      });

      const res = await fetch("/api/hmrc/quarterly-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: activeBusinessId, periodEndDate: preview?.periodEndDate }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        reference?: string;
        error?: string;
      };
      if (!res.ok) {
        setPreviewError(data.error ?? "Could not submit to HMRC sandbox.");
        return;
      }
      setSubmitMessage(`Submitted to HMRC sandbox. Reference: ${data.reference ?? "saved"}.`);
    } catch {
      setPreviewError("Could not submit to HMRC sandbox.");
    } finally {
      setBusy(null);
    }
  };

  if (!hmrcConnected && !anyBusinessHmrcLinked) {
    return null;
  }

  const nextObligation = obligations?.[0] ?? null;

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">HMRC sandbox</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">Filing readiness</h2>
        </div>
        {hmrcSandboxReady ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            <Check className="h-3.5 w-3.5" />
            Ready for sandbox submit
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            <AlertCircle className="h-3.5 w-3.5" />
            Setup incomplete
          </span>
        )}
      </div>

      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        <li className="flex items-center gap-2">
          {hmrcConnected ? (
            <Check className="h-4 w-4 text-emerald-600" aria-hidden />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-600" aria-hidden />
          )}
          HMRC account {hmrcConnected ? "connected" : "not connected"}
        </li>
        <li className="flex items-center gap-2">
          {activeBusinessHmrcId ? (
            <Check className="h-4 w-4 text-emerald-600" aria-hidden />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-600" aria-hidden />
          )}
          {activeBusinessName ? (
            <>
              <span className="font-medium text-slate-800">{activeBusinessName}</span>
              {activeBusinessHmrcId ? (
                <span className="font-mono text-xs text-emerald-800">{activeBusinessHmrcId}</span>
              ) : (
                <span>not linked to HMRC</span>
              )}
            </>
          ) : (
            "No active business selected"
          )}
        </li>
      </ul>

      {hmrcSandboxReady ? (
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {loading ? (
            <p className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading open obligations for this business…
            </p>
          ) : error ? (
            <p className="text-red-700">{error}</p>
          ) : obligations && obligations.length > 0 ? (
            <p>
              <span className="font-semibold text-slate-800">{obligations.length}</span> open obligation
              {obligations.length === 1 ? "" : "s"} for this business.
              {nextObligation ? (
                <>
                  {" "}
                  Next period: {formatDate(nextObligation.periodStart)} – {formatDate(nextObligation.periodEnd)}
                  {nextObligation.dueDate ? ` (due ${formatDate(nextObligation.dueDate)})` : ""}.
                </>
              ) : null}
            </p>
          ) : (
            <p>No open obligations returned for this business in the current tax year.</p>
          )}

          {sandboxFilingEnabled ? (
            <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
              <p className="font-semibold text-slate-800">Sandbox quarterly update</p>
              <p className="text-xs text-slate-500">
                Cumulative year-to-date totals from your monthly records will be sent to HMRC sandbox (not live filing).
              </p>
              {previewError ? <p className="text-sm text-red-700">{previewError}</p> : null}
              {submitMessage ? (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                  {submitMessage}
                </p>
              ) : null}
              {preview ? (
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-500">Tax year</dt>
                    <dd className="font-medium text-slate-900">{preview.taxYear}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Period</dt>
                    <dd className="font-medium text-slate-900">
                      {formatDate(preview.periodStartDate)} – {formatDate(preview.periodEndDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Turnover (cumulative)</dt>
                    <dd className="font-medium text-slate-900">{formatGbp(preview.turnover)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Expenses (consolidated)</dt>
                    <dd className="font-medium text-slate-900">{formatGbp(preview.consolidatedExpenses)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Net profit</dt>
                    <dd className="font-medium text-emerald-800">{formatGbp(preview.netProfit)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Monthly records included</dt>
                    <dd className="font-medium text-slate-900">{preview.monthlyRecordCount}</dd>
                  </div>
                </dl>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={busy !== null || !activeBusinessId}
                  onClick={() => void loadPreview()}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  {busy === "preview" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                  Preview HMRC totals
                </button>
                <button
                  type="button"
                  disabled={busy !== null || !preview}
                  onClick={() => void submitToHmrc()}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-green/90 disabled:opacity-60"
                >
                  {busy === "submit" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit to HMRC sandbox
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              Sandbox quarterly submission will appear here once enabled on the server (
              <code className="text-[11px]">HMRC_SANDBOX_FILING_ENABLED=true</code>).
            </p>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-600">
          {hmrcConnected && anyBusinessHmrcLinked && !activeBusinessHmrcId
            ? "Switch to your linked business using the business switcher, or link this business in Settings."
            : "Connect HMRC and link a business in Settings to prepare for sandbox filing."}{" "}
          <Link href="/dashboard/settings" className="font-semibold text-brand-green hover:underline">
            Open Settings
          </Link>
        </p>
      )}
    </section>
  );
}
