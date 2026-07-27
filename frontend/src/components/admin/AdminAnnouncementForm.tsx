"use client";

import { useEffect, useState, useTransition } from "react";

type Severity = "info" | "warning" | "maintenance";

type Settings = {
  announcementEnabled: boolean;
  announcementMessage: string | null;
  announcementSeverity: Severity;
  maintenanceMode: boolean;
  maintenanceUntil: string | null;
};

function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AdminAnnouncementForm({ initial }: { initial: Settings }) {
  const [form, setForm] = useState<Settings>({
    ...initial,
    announcementMessage: initial.announcementMessage ?? "",
    maintenanceUntil: toLocalInputValue(initial.maintenanceUntil),
  });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setForm({
      ...initial,
      announcementMessage: initial.announcementMessage ?? "",
      maintenanceUntil: toLocalInputValue(initial.maintenanceUntil),
    });
  }, [initial]);

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          announcementEnabled: form.announcementEnabled,
          announcementMessage: form.announcementMessage,
          announcementSeverity: form.announcementSeverity,
          maintenanceMode: form.maintenanceMode,
          maintenanceUntil: form.maintenanceUntil
            ? new Date(form.maintenanceUntil).toISOString()
            : null,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        announcementEnabled?: boolean;
        announcementMessage?: string | null;
        announcementSeverity?: Severity;
        maintenanceMode?: boolean;
        maintenanceUntil?: string | null;
      };
      if (!res.ok) {
        setError(data.error ?? "Could not save settings.");
        return;
      }
      setForm({
        announcementEnabled: Boolean(data.announcementEnabled),
        announcementMessage: data.announcementMessage ?? "",
        announcementSeverity: data.announcementSeverity ?? "info",
        maintenanceMode: Boolean(data.maintenanceMode),
        maintenanceUntil: toLocalInputValue(data.maintenanceUntil ?? null),
      });
      setSaved(true);
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">Site announcement &amp; maintenance</h2>
      <p className="mt-1 text-sm text-slate-600">
        Use for planned maintenance or customer notices. Changes apply immediately after save.
      </p>

      <div className="mt-5 space-y-4">
        <label className="flex items-start gap-3 text-sm text-slate-800">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-green focus:ring-brand-green"
            checked={form.announcementEnabled}
            onChange={(e) => setForm((f) => ({ ...f, announcementEnabled: e.target.checked }))}
          />
          <span>
            <span className="font-semibold">Show announcement banner</span>
            <span className="block text-slate-500">Visible on all pages above the compliance strip.</span>
          </span>
        </label>

        <div>
          <label className="block text-sm font-semibold text-slate-800" htmlFor="announcement-message">
            Message
          </label>
          <textarea
            id="announcement-message"
            rows={3}
            maxLength={2000}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/25"
            value={form.announcementMessage ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, announcementMessage: e.target.value }))}
            placeholder="SelfSubmit will be unavailable for maintenance from 8:00pm to 11:59pm on 15 December 2026…"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800" htmlFor="announcement-severity">
            Severity
          </label>
          <select
            id="announcement-severity"
            className="mt-1 w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/25"
            value={form.announcementSeverity}
            onChange={(e) =>
              setForm((f) => ({ ...f, announcementSeverity: e.target.value as Severity }))
            }
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <label className="flex items-start gap-3 text-sm text-slate-800">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-green focus:ring-brand-green"
            checked={form.maintenanceMode}
            onChange={(e) => setForm((f) => ({ ...f, maintenanceMode: e.target.checked }))}
          />
          <span>
            <span className="font-semibold">Maintenance mode</span>
            <span className="block text-slate-500">
              Blocks the customer dashboard for non-admins. Admins can still use /admin.
            </span>
          </span>
        </label>

        <div>
          <label className="block text-sm font-semibold text-slate-800" htmlFor="maintenance-until">
            Maintenance until (optional)
          </label>
          <input
            id="maintenance-until"
            type="datetime-local"
            className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/25"
            value={form.maintenanceUntil ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, maintenanceUntil: e.target.value ? e.target.value : null }))
            }
          />
        </div>
      </div>

      {error ? <p className="mt-4 text-sm font-medium text-red-700">{error}</p> : null}
      {saved ? <p className="mt-4 text-sm font-medium text-brand-green">Saved.</p> : null}

      <button
        type="button"
        onClick={save}
        disabled={pending}
        className="mt-5 rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-green-dark disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
    </section>
  );
}
