"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Shield } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";

type LoginAttemptRow = {
  id: string;
  success: boolean;
  suspicious: boolean;
  ipAddress: string | null;
  failureReason: string | null;
  createdAt: string;
};

type SecurityNotificationRow = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function LoginSecuritySection() {
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<LoginAttemptRow[]>([]);
  const [notifications, setNotifications] = useState<SecurityNotificationRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login-protection/security");
      const data = (await res.json()) as {
        attempts?: LoginAttemptRow[];
        notifications?: SecurityNotificationRow[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Could not load security data.");
      setAttempts(data.attempts ?? []);
      setNotifications(data.notifications ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load security data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markAllRead = async () => {
    await fetch("/api/auth/login-protection/security", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    void load();
  };

  const unread = notifications.filter((n) => !n.read);

  return (
    <DashboardCard
      title="Login protection"
      description="Failed attempt logging, lockouts, and alerts for suspicious sign-ins."
    >
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading activity…
        </div>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      {!loading && !error ? (
        <div className="space-y-6">
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Security alerts
                {unread.length > 0 ? (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                    {unread.length} new
                  </span>
                ) : null}
              </h3>
              {unread.length > 0 ? (
                <button
                  type="button"
                  onClick={() => void markAllRead()}
                  className="text-xs font-semibold text-brand-green hover:text-brand-green-dark"
                >
                  Mark all read
                </button>
              ) : null}
            </div>

            {notifications.length === 0 ? (
              <p className="text-sm text-slate-500">No security alerts yet.</p>
            ) : (
              <ul className="space-y-2">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`rounded-xl border px-4 py-3 text-sm ${
                      n.read ? "border-slate-100 bg-slate-50" : "border-amber-200 bg-amber-50/80"
                    }`}
                  >
                    <p className="font-semibold text-slate-900">{n.title}</p>
                    <p className="mt-1 text-slate-600">{n.message}</p>
                    <p className="mt-2 text-xs text-slate-400">{formatWhen(n.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
              <Shield className="h-4 w-4 text-brand-green" />
              Recent sign-in activity
            </h3>
            {attempts.length === 0 ? (
              <p className="text-sm text-slate-500">No sign-in attempts logged yet.</p>
            ) : (
              <ul className="space-y-2">
                {attempts.map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm"
                  >
                    <div className="flex items-start gap-2">
                      {a.success ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium text-slate-900">
                          {a.success ? "Successful sign-in" : "Failed sign-in"}
                          {a.suspicious ? (
                            <span className="ml-2 text-xs font-semibold text-amber-700">Suspicious</span>
                          ) : null}
                        </p>
                        {!a.success && a.failureReason ? (
                          <p className="text-xs text-slate-500">{a.failureReason}</p>
                        ) : null}
                        {a.ipAddress ? (
                          <p className="text-xs text-slate-400">IP: {a.ipAddress}</p>
                        ) : null}
                      </div>
                    </div>
                    <time className="text-xs text-slate-400">{formatWhen(a.createdAt)}</time>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Clerk also provides attack protection (bot detection and brute-force lockout). Enable those in the Clerk
            Dashboard under User &amp; authentication → Attack protection. Add a webhook for{" "}
            <code className="rounded bg-slate-100 px-1">session.created</code> pointing to{" "}
            <code className="rounded bg-slate-100 px-1">/api/webhooks/clerk</code>.
          </p>
        </div>
      ) : null}
    </DashboardCard>
  );
}
