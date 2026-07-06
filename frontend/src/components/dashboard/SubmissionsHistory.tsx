"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

type SubmissionRow = {
  id: string;
  trade: string;
  periodFrom: string;
  periodTo: string;
  status: string;
  totalIncomeGbp: number;
  totalExpensesGbp: number;
  netProfitGbp: number;
  hmrcReference: string | null;
  hmrcStatus: string | null;
  submittedAt: string;
};

function formatUkDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatMoney(n: number): string {
  return `£${n.toFixed(2)}`;
}

type SubmissionsHistoryProps = {
  highlightId?: string | null;
};

export function SubmissionsHistory({ highlightId }: SubmissionsHistoryProps) {
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/submissions");
      const data = (await res.json().catch(() => ({}))) as {
        submissions?: SubmissionRow[];
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Could not load submissions");
        setRows([]);
        return;
      }
      setRows(data.submissions ?? []);
    } catch {
      setError("Network error loading submissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <p className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading submissions…
      </p>
    );
  }

  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-800">{error}</p>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-slate-500">
        <p className="text-sm">No submissions yet.</p>
        <Link href="/submit" className="mt-3 inline-block text-sm font-semibold text-brand-green hover:underline">
          Create your first monthly return →
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Submitted</th>
            <th className="px-4 py-3">Business type</th>
            <th className="px-4 py-3">Period</th>
            <th className="px-4 py-3">Net profit</th>
            <th className="px-4 py-3">HMRC</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={`border-t border-slate-100 ${highlightId === row.id ? "bg-brand-mint/50" : "bg-white"}`}
            >
              <td className="px-4 py-3 text-slate-700">
                {new Date(row.submittedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="px-4 py-3 font-medium text-slate-900">{row.trade}</td>
              <td className="px-4 py-3 text-slate-600">
                {formatUkDate(row.periodFrom)} – {formatUkDate(row.periodTo)}
              </td>
              <td className="px-4 py-3 tabular-nums font-semibold text-slate-900">{formatMoney(row.netProfitGbp)}</td>
              <td className="px-4 py-3">
                {row.hmrcReference ? (
                  <span className="inline-flex flex-col gap-0.5">
                    <span className="text-xs font-semibold uppercase text-emerald-700">{row.hmrcStatus ?? "sent"}</span>
                    <span className="font-mono text-xs text-slate-600">{row.hmrcReference}</span>
                  </span>
                ) : (
                  <span className="text-slate-500">{row.status}</span>
                )}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/dashboard/submissions/${row.id}`}
                  className="text-sm font-semibold text-brand-green hover:underline"
                >
                  View / PDF
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
