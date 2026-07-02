"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Download, FileSpreadsheet, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";

import { downloadCsvTemplate } from "@/lib/csv-import";

type ReceiptRow = {
  id: string;
  fileName: string;
  mimeType: string | null;
  title: string | null;
  uploadedAt: string;
};

const ACCEPT =
  "image/jpeg,image/png,application/pdf,text/csv,.csv,application/csv";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isImageMime(mime: string | null) {
  return Boolean(mime?.startsWith("image/"));
}

export function ReceiptUploadPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadReceipts = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/receipts");
      const data = (await res.json()) as { receipts?: ReceiptRow[]; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not load receipts.");
        return;
      }
      setReceipts(data.receipts ?? []);
    } catch {
      setError("Could not load receipts.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void loadReceipts();
  }, [loadReceipts]);

  const uploadFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/receipts", { method: "POST", body: formData });
      const data = (await res.json()) as { receipt?: ReceiptRow; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      if (data.receipt) {
        setReceipts((prev) => [data.receipt!, ...prev]);
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const onFilesSelected = (files: FileList | null) => {
    if (!files?.length) return;
    void uploadFile(files[0]);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    onFilesSelected(e.dataTransfer.files);
  };

  const deleteReceipt = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/receipts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Could not delete receipt.");
        return;
      }
      setReceipts((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Could not delete receipt.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          onFilesSelected(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          onFilesSelected(e.target.files);
          e.target.value = "";
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragOver ? "border-brand-green-bright bg-brand-mint/50" : "border-slate-200 bg-slate-50"
        }`}
      >
        <Upload className="mx-auto h-8 w-8 text-brand-green" strokeWidth={1.75} />
        <p className="mt-3 text-sm font-semibold text-slate-800">Drop a receipt here</p>
        <p className="mt-1 text-xs text-slate-500">PDF, JPG, PNG, or CSV — up to 4 MB</p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-green/25 transition hover:bg-brand-green-dark disabled:cursor-wait disabled:opacity-70"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {uploading ? "Uploading…" : "Upload receipt"}
          </button>
          <button
            type="button"
            disabled={uploading}
            onClick={() => cameraInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 disabled:opacity-70"
          >
            <Camera className="h-4 w-4" />
            Take photo
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <FileSpreadsheet className="h-4 w-4 text-brand-green" aria-hidden />
          CSV income &amp; expense files
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
          Store CSV exports here for your records, or import amounts directly on the{" "}
          <a href="/submit" className="font-semibold text-brand-green hover:underline">
            Submit to HMRC
          </a>{" "}
          page using Import from CSV.
        </p>
        <button
          type="button"
          onClick={downloadCsvTemplate}
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white"
        >
          <Download className="h-3.5 w-3.5" />
          Download CSV template
        </button>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      <div>
        <h3 className="text-sm font-bold text-slate-900">Your receipts</h3>
        {loadingList ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </p>
        ) : receipts.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No receipts uploaded yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {receipts.map((r) => (
              <li
                key={r.id}
                className="flex gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm min-[520px]:items-center"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                  {isImageMime(r.mimeType) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/receipts/${r.id}/file`}
                      alt={r.title ?? r.fileName}
                      className="h-full w-full object-cover"
                    />
                  ) : r.mimeType?.includes("csv") ? (
                    <FileSpreadsheet className="h-6 w-6 text-brand-green" aria-hidden />
                  ) : (
                    <span className="text-xs font-bold text-slate-500">PDF</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{r.title ?? r.fileName}</p>
                  <p className="text-xs text-slate-500">{formatDate(r.uploadedAt)}</p>
                  <a
                    href={`/api/receipts/${r.id}/file`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs font-semibold text-brand-green hover:underline"
                  >
                    View file
                  </a>
                </div>
                <button
                  type="button"
                  disabled={deletingId === r.id}
                  onClick={() => void deleteReceipt(r.id)}
                  className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  aria-label="Delete receipt"
                >
                  {deletingId === r.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
