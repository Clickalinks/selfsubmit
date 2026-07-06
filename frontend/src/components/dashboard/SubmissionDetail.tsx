"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, FileText, Loader2, Printer } from "lucide-react";

type LineItem = { id: string; label: string; amount: string };

type SubmissionPayload = {
  income?: LineItem[];
  expenses?: LineItem[];
  totals?: { incomeGbp: number; expensesGbp: number; netProfitGbp: number };
  vehicleCostMethod?: string | null;
};

type ReceiptRow = {
  id: string;
  fileName: string;
  mimeType: string | null;
  title: string | null;
  amountGbp: number | null;
  uploadedAt: string;
};

type SubmissionDetailData = {
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
  hmrcMessage: string | null;
  submittedAt: string;
  payload: SubmissionPayload | null;
  receipts: ReceiptRow[];
};

function formatUkDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatMoney(n: number): string {
  return `£${n.toFixed(2)}`;
}

function isImageMime(mime: string | null) {
  return Boolean(mime?.startsWith("image/"));
}

function ReceiptThumbnail({ receipt }: { receipt: ReceiptRow }) {
  const [failed, setFailed] = useState(false);
  const src = `/api/receipts/${receipt.id}/file`;

  if (isImageMime(receipt.mimeType) && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={receipt.title ?? receipt.fileName}
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    );
  }

  if (receipt.mimeType?.includes("pdf")) {
    return <FileText className="h-8 w-8 text-red-600" aria-hidden />;
  }

  return <FileText className="h-8 w-8 text-slate-400" aria-hidden />;
}

export function SubmissionDetail({ submissionId }: { submissionId: string }) {
  const [data, setData] = useState<SubmissionDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/submissions/${submissionId}`);
      const body = (await res.json().catch(() => ({}))) as {
        submission?: SubmissionDetailData;
        error?: string;
      };
      if (!res.ok || !body.submission) {
        setError(body.error ?? "Could not load this submission.");
        setData(null);
        return;
      }
      setData(body.submission);
    } catch {
      setError("Network error loading submission.");
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <p className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading submission…
      </p>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-800">
        {error ?? "Submission not found."}
        <div className="mt-4">
          <Link href="/dashboard/submissions" className="font-semibold text-brand-green hover:underline">
            ← Back to submission history
          </Link>
        </div>
      </div>
    );
  }

  const incomeLines = data.payload?.income ?? [];
  const expenseLines = data.payload?.expenses ?? [];

  return (
    <article className="submission-print-root space-y-6">
      <div className="submission-no-print flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/submissions"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-green hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to history
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
        >
          <Printer className="h-4 w-4" />
          Save as PDF
        </button>
      </div>

      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-green">Monthly return</p>
        <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">{data.trade}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Period {formatUkDate(data.periodFrom)} – {formatUkDate(data.periodTo)} · Submitted{" "}
          {new Date(data.submittedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        {data.hmrcReference ? (
          <p className="mt-3 text-sm text-slate-700">
            <span className="font-semibold text-emerald-700">{data.hmrcStatus ?? "sent"}</span>
            {" · "}
            <span className="font-mono text-xs">{data.hmrcReference}</span>
          </p>
        ) : null}
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Total income" value={formatMoney(data.totalIncomeGbp)} />
        <SummaryCard label="Total expenses" value={formatMoney(data.totalExpensesGbp)} />
        <SummaryCard label="Net profit" value={formatMoney(data.netProfitGbp)} accent />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">Income</h2>
        <LineTable lines={incomeLines} emptyLabel="No income lines recorded." />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">Expenses</h2>
        <LineTable lines={expenseLines} emptyLabel="No expense lines recorded." />
      </section>

      {data.receipts.length > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">Receipts attached</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.receipts.map((receipt) => (
              <li key={receipt.id} className="overflow-hidden rounded-xl border border-slate-200">
                <div className="flex aspect-[4/3] items-center justify-center bg-slate-100">
                  <ReceiptThumbnail receipt={receipt} />
                </div>
                <div className="space-y-1 p-3">
                  <p className="truncate text-sm font-semibold text-slate-900">{receipt.title ?? receipt.fileName}</p>
                  <div className="flex flex-wrap gap-3 text-xs font-semibold">
                    <a
                      href={`/api/receipts/${receipt.id}/file`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-green hover:underline"
                    >
                      View
                    </a>
                    <a
                      href={`/api/receipts/${receipt.id}/file?download=1`}
                      className="text-brand-green hover:underline"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="submission-no-print text-xs text-slate-500">
        Tip: choose <strong>Save as PDF</strong>, then pick &ldquo;Save as PDF&rdquo; in your browser&apos;s print dialog.
      </p>
    </article>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border px-4 py-4 ${accent ? "border-brand-green/30 bg-brand-mint/40" : "border-slate-200 bg-white"}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold tabular-nums ${accent ? "text-brand-forest" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}

function LineTable({ lines, emptyLabel }: { lines: LineItem[]; emptyLabel: string }) {
  if (lines.length === 0) {
    return <p className="mt-3 text-sm text-slate-500">{emptyLabel}</p>;
  }

  return (
    <div className="mt-3 overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="pb-2 pr-4">Line item</th>
            <th className="pb-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.id} className="border-t border-slate-100">
              <td className="py-2 pr-4 text-slate-800">{line.label}</td>
              <td className="py-2 text-right tabular-nums font-medium text-slate-900">{line.amount || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
