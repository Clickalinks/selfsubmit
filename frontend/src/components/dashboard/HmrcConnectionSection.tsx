"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, ExternalLink, Link2, Loader2, Unlink } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { HMRC_LIVE_FILING_ENABLED } from "@/lib/hmrc-filing-status";

type HmrcStatus = {
  connected: boolean;
  configured: boolean;
  oauthConfigured: boolean;
  scopes: string | null;
  tokenExpiresAt: string | null;
  connectedAt: string | null;
};

type HmrcObligationRow = {
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  status: string;
  type: string;
  businessId?: string;
};

const DEVICE_ID_KEY = "hmrc_device_id";

function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

function formatHmrcTimezone(): string {
  const offsetMin = -new Date().getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  const hours = String(Math.floor(abs / 60)).padStart(2, "0");
  const mins = String(abs % 60).padStart(2, "0");
  return `UTC${sign}${hours}:${mins}`;
}

function collectFraudContext() {
  const screen = window.screen;
  return {
    deviceId: getOrCreateDeviceId(),
    browserJsUserAgent: navigator.userAgent,
    screens: `width=${screen.width}&height=${screen.height}&scaling-factor=${window.devicePixelRatio || 1}&colour-depth=${screen.colorDepth}`,
    windowSize: `width=${window.innerWidth}&height=${window.innerHeight}`,
    timezone: formatHmrcTimezone(),
  };
}

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

function formatHmrcObligationsError(message: string): string {
  if (/not authorised/i.test(message)) {
    return `${message} For sandbox testing, the NI number saved on your dashboard must exactly match the HMRC test user you connected with. Open Dashboard → Update UTR or NI number, then try Fetch obligations again.`;
  }
  return message;
}

export function HmrcConnectionSection() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<HmrcStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [obligations, setObligations] = useState<HmrcObligationRow[] | null>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hmrc/status");
      const data = (await res.json().catch(() => ({}))) as HmrcStatus & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not load HMRC connection status.");
        setStatus(null);
        return;
      }
      setStatus(data);
    } catch {
      setError("Could not load HMRC connection status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    const hmrc = searchParams.get("hmrc");
    if (!hmrc) return;

    if (hmrc === "connected") {
      setMessage("HMRC account connected successfully.");
      void loadStatus();
    } else if (hmrc === "error") {
      const reason = searchParams.get("reason");
      setError(
        reason === "config"
          ? "HMRC connection is not configured on this server."
          : reason === "state"
            ? "Sign-in session expired or invalid. Try connecting again."
            : reason
              ? `HMRC connection failed: ${decodeURIComponent(reason)}`
              : "HMRC connection failed.",
      );
    }
  }, [loadStatus, searchParams]);

  const connect = async () => {
    setBusy("connect");
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/hmrc/fraud-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(collectFraudContext()),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not prepare HMRC connection.");
        return;
      }
      window.location.assign("/api/hmrc/connect");
    } catch {
      setError("Could not start HMRC connection.");
    } finally {
      setBusy(null);
    }
  };

  const disconnect = async () => {
    setBusy("disconnect");
    setError(null);
    setMessage(null);
    setObligations(null);
    try {
      const res = await fetch("/api/hmrc/disconnect", { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not disconnect HMRC.");
        return;
      }
      setMessage("HMRC account disconnected.");
      await loadStatus();
    } catch {
      setError("Could not disconnect HMRC.");
    } finally {
      setBusy(null);
    }
  };

  const fetchObligations = async () => {
    setBusy("obligations");
    setError(null);
    try {
      const res = await fetch("/api/hmrc/obligations");
      const data = (await res.json().catch(() => ({}))) as {
        obligations?: HmrcObligationRow[];
        error?: string;
      };
      if (!res.ok) {
        setError(formatHmrcObligationsError(data.error ?? "Could not fetch obligations from HMRC."));
        return;
      }
      setObligations(data.obligations ?? []);
      if ((data.obligations ?? []).length === 0) {
        setMessage("No open income-and-expenditure obligations returned for the current tax year.");
      }
    } catch {
      setError("Could not fetch obligations from HMRC.");
    } finally {
      setBusy(null);
    }
  };

  const sandboxMode = !HMRC_LIVE_FILING_ENABLED;
  const canConnect = status?.oauthConfigured && status?.configured;

  return (
    <DashboardCard
      title="HMRC account"
      description={
        sandboxMode
          ? "Connect your HMRC sandbox test user to verify OAuth and view obligations. Live filing is not enabled yet."
          : "Connect your HMRC account for Making Tax Digital."
      }
    >
      {loading ? (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading connection status…
        </p>
      ) : null}

      {message ? (
        <p className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      {!loading && status ? (
        <div className="space-y-4 text-sm text-slate-600">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                status.connected ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
              }`}
            >
              {status.connected ? <Check className="h-3 w-3" /> : null}
              {status.connected ? "Connected" : "Not connected"}
            </span>
            {sandboxMode ? (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                Sandbox
              </span>
            ) : null}
          </div>

          {status.connected && status.connectedAt ? (
            <p>
              Connected since <span className="font-medium text-slate-800">{formatDate(status.connectedAt)}</span>
              {status.scopes ? (
                <>
                  {" "}
                  with scopes <span className="font-mono text-xs text-slate-700">{status.scopes}</span>
                </>
              ) : null}
              .
            </p>
          ) : (
            <p>
              Authorise SelfSubmit to access your self-assessment data via HMRC. You will sign in on GOV.UK (sandbox
              test user for now).
            </p>
          )}

          {!canConnect && !status.connected ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
              HMRC OAuth or encryption is not configured on this environment. Add{" "}
              <code className="text-xs">HMRC_*</code> and <code className="text-xs">ENCRYPTION_KEY</code> env vars.
            </p>
          ) : null}

          <p>
            Obligations require your{" "}
            <Link href="/dashboard/settings#tax-details" className="font-semibold text-brand-green hover:underline">
              National Insurance number
            </Link>{" "}
            on the dashboard.
          </p>

          <div className="flex flex-wrap gap-3">
            {!status.connected ? (
              <button
                type="button"
                disabled={!canConnect || busy !== null}
                onClick={() => void connect()}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-ink px-5 py-3 text-sm font-bold text-white hover:bg-brand-ink/90 disabled:opacity-60"
              >
                {busy === "connect" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                Connect HMRC
                <ExternalLink className="h-3.5 w-3.5 opacity-80" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => void fetchObligations()}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-5 py-3 text-sm font-bold text-white hover:bg-brand-green/90 disabled:opacity-60"
                >
                  {busy === "obligations" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  Fetch obligations
                </button>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => void disconnect()}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  {busy === "disconnect" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink className="h-4 w-4" />}
                  Disconnect
                </button>
              </>
            )}
          </div>

          {obligations && obligations.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3">Due</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {obligations.map((row) => (
                    <tr key={`${row.periodStart}-${row.periodEnd}-${row.businessId ?? ""}`}>
                      <td className="px-4 py-3 text-slate-800">
                        {formatDate(row.periodStart)} – {formatDate(row.periodEnd)}
                      </td>
                      <td className="px-4 py-3">{formatDate(row.dueDate)}</td>
                      <td className="px-4 py-3">{row.status}</td>
                      <td className="px-4 py-3 capitalize">{row.type.replace(/-/g, " ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}
    </DashboardCard>
  );
}
