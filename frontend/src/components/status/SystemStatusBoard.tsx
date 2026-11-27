"use client";

import { useCallback, useEffect, useState } from "react";

import type { ServiceStatus, SystemHealthSnapshot } from "@/lib/system-status";

const POLL_MS = 30_000;
const STALE_AFTER_MS = 90_000;

const STATUS_STYLES: Record<ServiceStatus, { label: string; dot: string; text: string }> = {
  operational: { label: "Operational", dot: "bg-emerald-500", text: "text-emerald-700" },
  degraded: { label: "Degraded", dot: "bg-amber-500", text: "text-amber-700" },
  maintenance: { label: "Maintenance", dot: "bg-slate-400", text: "text-slate-600" },
  outage: { label: "Outage", dot: "bg-red-500", text: "text-red-700" },
};

function formatUkCheckedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Just now";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "short",
  }).format(date);
}

function formatRelative(iso: string, nowMs: number): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "just now";
  const seconds = Math.max(0, Math.round((nowMs - then) / 1000));
  if (seconds < 8) return "just now";
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours === 1) return "1 hour ago";
  return `${hours} hours ago`;
}

function StatusBadge({ status }: { status: ServiceStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-2 text-sm font-semibold ${style.text}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} aria-hidden />
      {style.label}
    </span>
  );
}

export function SystemStatusBoard({ initial }: { initial: SystemHealthSnapshot }) {
  const [snapshot, setSnapshot] = useState(initial);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [checking, setChecking] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const refresh = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/status/health", { cache: "no-store" });
      const data = (await res.json()) as SystemHealthSnapshot;
      if (!data?.checkedAt || !Array.isArray(data.services)) {
        throw new Error("Invalid status payload");
      }
      setSnapshot(data);
      setRefreshFailed(false);
    } catch {
      setRefreshFailed(true);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const tick = () => {
      if (document.visibilityState === "hidden") return;
      void refresh();
    };
    const id = window.setInterval(tick, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const hasIssues = snapshot.services.some((s) => s.status !== "operational");
  const ageMs = nowMs - new Date(snapshot.checkedAt).getTime();
  const live = !refreshFailed && Number.isFinite(ageMs) && ageMs < STALE_AFTER_MS;

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {hasIssues ? "Some SelfSubmit services are not fully operational." : "All SelfSubmit services are operational."}
      </p>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
        <ul className="divide-y divide-slate-200/80">
          {snapshot.services.map((service) => (
            <li
              key={service.id}
              className="flex flex-col gap-2 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div>
                <p className="font-semibold text-brand-black">{service.name}</p>
                <p className="mt-0.5 text-sm text-brand-muted">{service.description}</p>
              </div>
              <StatusBadge status={service.status} />
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="text-sm leading-relaxed text-brand-muted">
          <p className="flex flex-wrap items-center gap-2">
            {live ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-800">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Live
              </span>
            ) : null}
            <span>
              Last check {formatRelative(snapshot.checkedAt, nowMs)}
              {" · "}
              <time dateTime={snapshot.checkedAt} className="font-medium text-brand-black">
                {formatUkCheckedAt(snapshot.checkedAt)}
              </time>
            </span>
          </p>
          {refreshFailed ? (
            <p className="mt-1 text-amber-800">
              The latest refresh did not complete. The time above is from the last successful check.
            </p>
          ) : (
            <p className="mt-1">
              This page checks the application and database when you open it, then about every 30 seconds while it stays
              open. We do not ping HMRC, Stripe, or SMS providers on every visit.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={checking}
          className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-brand-black transition hover:bg-slate-50 disabled:opacity-60"
        >
          {checking ? "Checking…" : "Check now"}
        </button>
      </div>
    </>
  );
}
