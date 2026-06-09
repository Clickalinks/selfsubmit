"use client";

import { useRef, useState } from "react";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";

import { downloadCsvTemplate, parseIncomeExpenseCsv, type ParsedCsvLine } from "@/lib/csv-import";

type Props = {
  onImport: (lines: ParsedCsvLine[]) => void;
  className?: string;
};

export function CsvImportPanel({ onImport, className = "" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    setError(null);
    setSummary(null);
    setLoading(true);
    try {
      const text = await file.text();
      const result = parseIncomeExpenseCsv(text);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onImport(result.lines);
      const incomeCount = result.lines.filter((l) => l.type === "income").length;
      const expenseCount = result.lines.filter((l) => l.type === "expense").length;
      setSummary(
        `Imported ${incomeCount} income and ${expenseCount} expense line${expenseCount + incomeCount === 1 ? "" : "s"}${
          result.skipped ? ` (${result.skipped} row${result.skipped === 1 ? "" : "s"} skipped)` : ""
        }. Review amounts below, then save each line.`,
      );
    } catch {
      setError("Could not read the CSV file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <FileSpreadsheet className="h-4 w-4 text-brand-green" aria-hidden />
            Import from CSV
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
            Upload a spreadsheet with columns{" "}
            <code className="rounded bg-white px-1 py-0.5 text-[11px]">type, description, amount</code>. We match
            descriptions to your income and expense lines where possible.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadCsvTemplate}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Download className="h-3.5 w-3.5" />
          Download template
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-green-dark disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
          Choose CSV file
        </button>
      </div>

      {summary ? (
        <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {summary}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      ) : null}
    </div>
  );
}
