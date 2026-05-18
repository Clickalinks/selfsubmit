"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, Check, Download, Loader2 } from "lucide-react";

const CONFIRM_PHRASE = "DELETE MY ACCOUNT";

const CHECKLIST = [
  "Download your data or submission history (recommended)",
  "Confirm that you want to delete your account",
  `Type '${CONFIRM_PHRASE}' in the box below`,
] as const;

export function DeleteAccountSection() {
  const { signOut } = useClerk();
  const router = useRouter();

  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const canDelete = confirmText.trim() === CONFIRM_PHRASE;

  async function downloadData() {
    setExportError(null);
    setExporting(true);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setExportError(data.error ?? "Could not download your data. Please try again.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10);
      anchor.href = url;
      anchor.download = `selfsubmit-export-${stamp}.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
      setExportDone(true);
    } catch {
      setExportError("Could not download your data. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (!canDelete) return;
    setDeleteError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/profile", { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setDeleteError(data.error ?? "Could not delete your account. Please try again.");
        return;
      }
      await signOut();
      router.push("/");
    } catch {
      setDeleteError("Could not delete your account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
      <header className="border-b border-slate-100 px-5 py-4 min-[900px]:px-6">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
            6
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900 min-[900px]:text-lg">Account Deletion</h2>
            <p className="text-sm text-slate-500">Safe account deletion flow</p>
          </div>
        </div>
      </header>

      <div className="space-y-6 px-5 py-6 min-[900px]:px-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Delete Account</h3>
          <p className="mt-1 text-sm text-slate-600">
            This action cannot be undone. Please review the information below.
          </p>
        </div>

        <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" strokeWidth={2} />
            <div>
              <p className="text-sm font-bold text-red-700">Permanent Deletion</p>
              <p className="mt-1 text-sm leading-relaxed text-red-900/90">
                All your data, receipts, submissions, and business information will be permanently deleted.
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800">To delete your account, please:</p>
          <ul className="mt-3 space-y-2.5">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.5} />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-4">
            <p className="text-sm text-indigo-950">
              Before you leave, download a copy of your profile, receipt photos, and submission history. The ZIP file
              includes everything we store for your account.
            </p>
            <button
              type="button"
              disabled={exporting}
              onClick={() => void downloadData()}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 disabled:opacity-60"
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {exporting ? "Preparing download…" : "Download my data"}
            </button>
            {exportDone ? (
              <p className="mt-2 text-xs font-medium text-emerald-700">Download started — check your downloads folder.</p>
            ) : null}
            {exportError ? <p className="mt-2 text-xs font-medium text-red-600">{exportError}</p> : null}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800" htmlFor="delete-confirm">
            Type &apos;{CONFIRM_PHRASE}&apos; to confirm
          </label>
          <input
            id="delete-confirm"
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={CONFIRM_PHRASE}
            autoComplete="off"
          />
        </div>

        {deleteError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{deleteError}</p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 min-[480px]:flex-row min-[480px]:justify-end">
          <button
            type="button"
            onClick={() => {
              setConfirmText("");
              setDeleteError(null);
            }}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canDelete || loading}
            onClick={() => void handleDelete()}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-red-600/25 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Deleting…" : "Delete account"}
          </button>
        </div>
      </div>
    </section>
  );
}
