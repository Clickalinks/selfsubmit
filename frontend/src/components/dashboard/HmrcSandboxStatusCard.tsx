"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, Check, Loader2 } from "lucide-react";

type ObligationRow = {
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  status: string;
};

type Props = {
  hmrcConnected: boolean;
  hmrcSandboxReady: boolean;
  activeBusinessName: string | null;
  activeBusinessHmrcId: string | null;
  anyBusinessHmrcLinked: boolean;
};

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
  activeBusinessName,
  activeBusinessHmrcId,
  anyBusinessHmrcLinked,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [obligations, setObligations] = useState<ObligationRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          <p className="mt-2 text-xs text-slate-500">
            Sandbox quarterly submission to HMRC will be enabled in the next milestone.
          </p>
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
