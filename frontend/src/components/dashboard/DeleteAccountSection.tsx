"use client";

import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DataExportButton } from "@/components/dashboard/DataExportButton";
import { AlertTriangle, Check } from "lucide-react";

const CONFIRM_PHRASE = "DELETE MY ACCOUNT";

export function DeleteAccountSection() {
  const { signOut } = useClerk();
  const router = useRouter();

  const [confirmText, setConfirmText] = useState("");
  const [downloadedConfirmed, setDownloadedConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const phraseOk = confirmText.trim() === CONFIRM_PHRASE;
  const canDelete = phraseOk && downloadedConfirmed;

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
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green text-sm font-bold text-white">
            6
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900 min-[900px]:text-lg">Leaving SelfSubmit</h2>
            <p className="text-sm text-slate-500">Download your records, then delete your account securely</p>
          </div>
        </div>
      </header>

      <div className="space-y-6 px-5 py-6 min-[900px]:px-6">
        <div>
          <p className="text-sm leading-relaxed text-slate-600">
            If you want to leave SelfSubmit completely, our{" "}
            <Link href="/terms" className="font-semibold text-brand-green underline-offset-2 hover:underline">
              Terms
            </Link>{" "}
            ask you to <strong>download all your files first</strong>, then delete your account. After deletion we
            remove your profile, submissions, receipts, and sign-in access from our systems.
          </p>
        </div>

        <div className="rounded-xl border border-brand-green/25 bg-brand-mint/50 px-4 py-5">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-green">Step 1 — Download everything</p>
          <p className="mt-2 text-sm leading-relaxed text-brand-forest">
            One ZIP with all monthly submissions as PDFs, receipt photos, your profile, and businesses. Save it
            somewhere safe on your computer before you continue.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-brand-forest">
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2.5} />
              <span>Every filed monthly return</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2.5} />
              <span>Uploaded receipt images and PDFs</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2.5} />
              <span>Profile and business details</span>
            </li>
          </ul>
          <DataExportButton
            className="mt-4"
            variant="leave"
            onDownloaded={() => setDownloadedConfirmed(true)}
          />
        </div>

        <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" strokeWidth={2} />
            <div>
              <p className="text-sm font-bold text-red-700">Step 2 — Delete account permanently</p>
              <p className="mt-1 text-sm leading-relaxed text-red-900/90">
                This cannot be undone. All data stored on SelfSubmit for your account will be permanently removed and
                you will be signed out.
              </p>
            </div>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-green focus:ring-brand-green"
            checked={downloadedConfirmed}
            onChange={(e) => setDownloadedConfirmed(e.target.checked)}
          />
          <span className="text-sm leading-relaxed text-slate-700">
            I have downloaded my submissions and files (or already have a copy) and I want to permanently delete my
            SelfSubmit account.
          </span>
        </label>

        <div>
          <label className="block text-sm font-semibold text-slate-800" htmlFor="delete-confirm">
            Type &apos;{CONFIRM_PHRASE}&apos; to confirm deletion
          </label>
          <input
            id="delete-confirm"
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:bg-slate-100 disabled:text-slate-400"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={CONFIRM_PHRASE}
            autoComplete="off"
            disabled={!downloadedConfirmed}
          />
          {!downloadedConfirmed ? (
            <p className="mt-2 text-xs text-slate-500">Complete step 1 and confirm the checkbox above to continue.</p>
          ) : null}
        </div>

        {deleteError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{deleteError}</p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 min-[480px]:flex-row min-[480px]:justify-end">
          <button
            type="button"
            onClick={() => {
              setConfirmText("");
              setDownloadedConfirmed(false);
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
            {loading ? "Deleting your account…" : "Delete my account permanently"}
          </button>
        </div>
      </div>
    </section>
  );
}
