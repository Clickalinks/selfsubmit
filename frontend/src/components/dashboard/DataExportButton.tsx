"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

type DataExportButtonProps = {
  className?: string;
  /** Shown on the leave-account flow in Settings. */
  variant?: "default" | "leave";
  onDownloaded?: () => void;
};

export function DataExportButton({ className = "", variant = "default", onDownloaded }: DataExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const buttonLabel =
    variant === "leave" ? "Download all my submissions & files (ZIP)" : "Download my records (ZIP)";

  async function downloadData() {
    setExportError(null);
    setExportDone(false);
    setExporting(true);
    try {
      const res = await fetch("/api/account/export");
      const contentType = res.headers.get("content-type") ?? "";

      if (!res.ok) {
        if (contentType.includes("application/json")) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setExportError(data.error ?? "Could not download your data. Please try again.");
        } else {
          setExportError("Could not download your data. Please try again.");
        }
        return;
      }

      const blob = await res.blob();
      if (!blob.size) {
        setExportError("Export was empty. Please try again.");
        return;
      }

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10);
      anchor.href = url;
      anchor.download = `selfsubmit-my-records-${stamp}.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setExportDone(true);
      onDownloaded?.();
    } catch {
      setExportError("Could not download your data. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        disabled={exporting}
        onClick={() => void downloadData()}
        className="inline-flex items-center gap-2 rounded-xl border border-brand-green/20 bg-white px-4 py-2.5 text-sm font-semibold text-brand-green-dark shadow-sm transition hover:bg-brand-mint disabled:opacity-60"
      >
        {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {exporting ? "Preparing download…" : buttonLabel}
      </button>
      {exportDone ? (
        <p className="mt-2 text-xs font-medium text-emerald-700">
          {variant === "leave"
            ? "Download complete — keep the ZIP safe, then confirm deletion below."
            : "Download started — check your downloads folder."}
        </p>
      ) : null}
      {exportError ? <p className="mt-2 text-xs font-medium text-red-600">{exportError}</p> : null}
    </div>
  );
}
