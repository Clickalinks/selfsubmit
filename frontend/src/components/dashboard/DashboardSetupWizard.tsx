"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ArrowRight, Check, ExternalLink, Link2, Loader2 } from "lucide-react";

import { BusinessSwitcher } from "@/components/dashboard/BusinessSwitcher";
import { ProfessionSelect } from "@/components/forms/ProfessionSelect";
import { ALL_PROFESSIONS } from "@/data/expenseCategories";
import { getActiveSetupStep } from "@/lib/setup-progress";
import { validateNiNumber, validateUtr } from "@/lib/tax-id-validation";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20";

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

type PrimaryBusiness = {
  id: string;
  name: string;
  category: string;
};

type StatusPayload = {
  plan: string | null;
  businessCount: number;
  maxBusinesses: number;
  canCreateBusiness: boolean;
  primaryBusiness: PrimaryBusiness | null;
  businesses?: PrimaryBusiness[];
};

export type DashboardSetupWizardProps = {
  hasPlan: boolean;
  hasBusiness: boolean;
  hasTaxIds: boolean;
  hmrcConnected: boolean;
  activeBusinessHmrcId: string | null;
  activeBusinessId: string | null;
  activeBusinessName: string | null;
  hmrcOAuthConfigured: boolean;
  encryptionConfigured: boolean;
  submitHref: string;
};

function stepStatus(stepId: number, activeStep: number, done: boolean): "done" | "active" | "pending" {
  if (done) return "done";
  if (stepId === activeStep) return "active";
  return "pending";
}

function DashboardSetupWizardInner({
  hasPlan,
  hasBusiness,
  hasTaxIds,
  hmrcConnected,
  activeBusinessHmrcId,
  activeBusinessId,
  activeBusinessName,
  hmrcOAuthConfigured,
  encryptionConfigured,
  submitHref,
}: DashboardSetupWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeStep = getActiveSetupStep({
    hasPlan,
    hasBusiness,
    hasTaxIds,
    hmrcConnected,
    activeBusinessHmrcId,
  });

  const [banner, setBanner] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);

  const [bizStatus, setBizStatus] = useState<StatusPayload | null>(null);
  const [bizName, setBizName] = useState("");
  const [bizCategory, setBizCategory] = useState(ALL_PROFESSIONS[0] ?? "");
  const [bizSubmitting, setBizSubmitting] = useState(false);
  const [bizError, setBizError] = useState<string | null>(null);

  const [utr, setUtr] = useState("");
  const [niNumber, setNiNumber] = useState("");
  const [taxFieldErrors, setTaxFieldErrors] = useState<{ utr?: string; niNumber?: string }>({});
  const [taxError, setTaxError] = useState<string | null>(null);
  const [taxSaving, setTaxSaving] = useState(false);

  const [hmrcBusy, setHmrcBusy] = useState(false);
  const [linkBusy, setLinkBusy] = useState(false);

  const refreshBusinessStatus = useCallback(async () => {
    const [statusRes, businessRes] = await Promise.all([
      fetch("/api/subscription/status", { method: "GET" }),
      fetch("/api/business", { method: "GET" }),
    ]);
    if (!statusRes.ok) return;
    const data = (await statusRes.json()) as StatusPayload;
    const businessData = businessRes.ok
      ? ((await businessRes.json()) as { businesses?: PrimaryBusiness[] })
      : null;
    data.businesses = businessData?.businesses ?? data.businesses;
    setBizStatus(data);
    if (data.primaryBusiness) {
      setBizName(data.primaryBusiness.name);
      setBizCategory(data.primaryBusiness.category || ALL_PROFESSIONS[0] || "");
    }
  }, []);

  useEffect(() => {
    void refreshBusinessStatus();
  }, [refreshBusinessStatus]);

  useEffect(() => {
    const setup = searchParams.get("setup");
    if (!setup) return;

    if (setup === "linked") {
      setBanner({ tone: "success", text: "HMRC connected and your business was linked automatically." });
      router.replace("/dashboard", { scroll: false });
      router.refresh();
    } else if (setup === "connected") {
      setBanner({ tone: "success", text: "HMRC connected. Linking your business…" });
      router.replace("/dashboard", { scroll: false });
      router.refresh();
    } else if (setup === "link-multiple") {
      setBanner({
        tone: "info",
        text: "HMRC returned more than one self-employment business. Use Settings → HMRC business link to choose the right one.",
      });
      router.replace("/dashboard", { scroll: false });
    } else if (setup === "hmrc-error") {
      const reason = searchParams.get("reason");
      setBanner({
        tone: "error",
        text:
          reason === "config"
            ? "HMRC connection is not configured on this server."
            : reason === "state"
              ? "Sign-in session expired. Try connecting again."
              : reason
                ? `HMRC connection failed: ${decodeURIComponent(reason)}`
                : "HMRC connection failed.",
      });
      router.replace("/dashboard", { scroll: false });
    }
  }, [router, searchParams]);

  useEffect(() => {
    if (activeStep === 6 && hmrcConnected && !activeBusinessHmrcId && activeBusinessId && !linkBusy) {
      void tryAutoLink();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, hmrcConnected, activeBusinessHmrcId, activeBusinessId]);

  const setupExisting =
    Boolean(bizStatus && !bizStatus.canCreateBusiness && bizStatus.businessCount === 1 && bizStatus.primaryBusiness);

  async function saveBusiness(e: React.FormEvent) {
    e.preventDefault();
    setBizError(null);
    if (!bizStatus) return;
    setBizSubmitting(true);
    try {
      const endpoint = setupExisting ? "/api/business/setup" : "/api/business/create";
      const method = setupExisting ? "PATCH" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: bizName, category: bizCategory }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; business?: { id: string } };
      if (!res.ok) {
        setBizError(data.error ?? "Could not save your business.");
        return;
      }
      const newBusinessId = data.business?.id;
      if (!setupExisting && newBusinessId) {
        await fetch("/api/business/active", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessId: newBusinessId }),
        });
      }
      router.refresh();
      await refreshBusinessStatus();
    } finally {
      setBizSubmitting(false);
    }
  }

  async function saveTaxIds() {
    setTaxError(null);
    const utrError = validateUtr(utr);
    const niError = validateNiNumber(niNumber);
    if (utrError || niError) {
      setTaxFieldErrors({ utr: utrError ?? undefined, niNumber: niError ?? undefined });
      return;
    }
    setTaxFieldErrors({});
    setTaxSaving(true);
    try {
      const res = await fetch("/api/profile/tax-ids", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utr, niNumber }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        fieldErrors?: { utr?: string; niNumber?: string };
      };
      if (!res.ok) {
        setTaxError(data.error ?? "Could not save tax details.");
        if (data.fieldErrors) setTaxFieldErrors(data.fieldErrors);
        return;
      }
      setUtr("");
      setNiNumber("");
      router.refresh();
    } finally {
      setTaxSaving(false);
    }
  }

  async function connectHmrc() {
    if (!activeBusinessId) return;
    setHmrcBusy(true);
    setBanner(null);
    try {
      const res = await fetch("/api/hmrc/fraud-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(collectFraudContext()),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setBanner({ tone: "error", text: data.error ?? "Could not prepare HMRC connection." });
        return;
      }
      window.location.assign(`/api/hmrc/connect?businessId=${encodeURIComponent(activeBusinessId)}`);
    } catch {
      setBanner({ tone: "error", text: "Could not start HMRC connection." });
    } finally {
      setHmrcBusy(false);
    }
  }

  async function tryAutoLink() {
    if (!activeBusinessId) return;
    setLinkBusy(true);
    setBanner(null);
    try {
      const res = await fetch("/api/hmrc/auto-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: activeBusinessId }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; hmrcBusinessId?: string };
      if (res.ok) {
        setBanner({ tone: "success", text: "Your business is linked to HMRC." });
        router.refresh();
        return;
      }
      setBanner({ tone: "info", text: data.error ?? "Could not link automatically." });
    } catch {
      setBanner({ tone: "error", text: "Could not link your business to HMRC." });
    } finally {
      setLinkBusy(false);
    }
  }

  const canConnectHmrc = hmrcOAuthConfigured && encryptionConfigured;

  const steps = [
    { id: 1, label: "Sign up", done: true },
    { id: 2, label: "Choose a plan", done: hasPlan },
    { id: 3, label: "Select a business", done: hasBusiness },
    { id: 4, label: "Add UTR and NI number", done: hasTaxIds },
    { id: 5, label: "Connect to HMRC", done: hmrcConnected },
    { id: 6, label: "Link to HMRC", done: Boolean(activeBusinessHmrcId) },
    { id: 7, label: "Start filling income and expenses", done: false },
  ] as const;

  return (
    <section
      id="setup-wizard"
      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
      aria-labelledby="setup-wizard-heading"
    >
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-green">Get started</p>
      <h3 id="setup-wizard-heading" className="mt-1 text-lg font-bold text-slate-900">
        Set up SelfSubmit in a few steps
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Complete everything here on one screen — then jump straight into your income and expense form.
      </p>

      {banner ? (
        <p
          className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
            banner.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : banner.tone === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-sky-200 bg-sky-50 text-sky-900"
          }`}
        >
          {banner.text}
        </p>
      ) : null}

      <ol className="mt-5 space-y-3">
        {steps.map((step) => {
          const status = stepStatus(step.id, activeStep, step.done);
          const isExpanded = status === "active" || (step.id === 7 && activeStep === 7);

          return (
            <li
              key={step.id}
              className={`rounded-xl border px-4 py-3 transition ${
                status === "active"
                  ? "border-brand-green/40 bg-brand-mint/40 ring-1 ring-brand-green/20"
                  : status === "done"
                    ? "border-emerald-200 bg-emerald-50/80"
                    : "border-slate-100 bg-slate-50/80 opacity-80"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    status === "done"
                      ? "bg-emerald-600 text-white"
                      : status === "active"
                        ? "bg-brand-green text-white"
                        : "bg-slate-200 text-slate-500"
                  }`}
                  aria-hidden
                >
                  {status === "done" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : step.id}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-semibold ${
                      status === "active" ? "text-brand-forest" : status === "done" ? "text-emerald-900" : "text-slate-600"
                    }`}
                  >
                    {step.label}
                  </p>
                  {status === "done" && step.id !== 7 ? (
                    <p className="mt-0.5 text-xs text-emerald-700">Complete</p>
                  ) : null}
                </div>
              </div>

              {isExpanded && step.id === 2 ? (
                <div className="mt-4 border-t border-brand-green/10 pt-4">
                  <p className="text-sm text-slate-600">
                    Pick the plan that fits how many businesses you run. You can change it later.
                  </p>
                  <Link
                    href="/pricing"
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-green px-5 py-3 text-sm font-bold text-white hover:bg-brand-green-dark"
                  >
                    View plans
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : null}

              {isExpanded && step.id === 3 ? (
                <div className="mt-4 border-t border-brand-green/10 pt-4">
                  {hasBusiness && activeBusinessName ? (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-600">
                        Working on{" "}
                        <span className="font-semibold text-slate-900">{activeBusinessName}</span>. Switch if you have
                        more than one.
                      </p>
                      <BusinessSwitcher basePath="/dashboard" />
                    </div>
                  ) : (
                    <form className="space-y-4" onSubmit={(e) => void saveBusiness(e)}>
                      <div>
                        <label htmlFor="setup-biz-name" className="block text-sm font-semibold text-slate-800">
                          Business name
                        </label>
                        <input
                          id="setup-biz-name"
                          required
                          maxLength={120}
                          value={bizName}
                          onChange={(e) => setBizName(e.target.value)}
                          className={inputClass}
                          placeholder="e.g. City Cabs Ltd"
                        />
                      </div>
                      <ProfessionSelect
                        id="setup-biz-category"
                        label="Profession"
                        value={bizCategory}
                        onChange={setBizCategory}
                        required
                        helperText="Each business keeps its own profession and expense categories."
                      />
                      {bizError ? <p className="text-sm text-red-700">{bizError}</p> : null}
                      <button
                        type="submit"
                        disabled={bizSubmitting}
                        className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-5 py-3 text-sm font-bold text-white hover:bg-brand-green-dark disabled:opacity-60"
                      >
                        {bizSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {bizSubmitting ? "Saving…" : "Save business"}
                      </button>
                    </form>
                  )}
                </div>
              ) : null}

              {isExpanded && step.id === 4 ? (
                <div className="mt-4 border-t border-brand-green/10 pt-4">
                  <p className="text-sm text-slate-600">
                    Your UTR and National Insurance number are encrypted. For sandbox testing, use the same values as
                    your HMRC test user.
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800" htmlFor="setup-utr">
                        UTR (10 digits)
                      </label>
                      <input
                        id="setup-utr"
                        className={inputClass}
                        value={utr}
                        onChange={(e) => setUtr(e.target.value)}
                        placeholder="e.g. 1234567890"
                        inputMode="numeric"
                        autoComplete="off"
                      />
                      {taxFieldErrors.utr ? (
                        <p className="mt-1 text-xs font-medium text-red-600">{taxFieldErrors.utr}</p>
                      ) : null}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800" htmlFor="setup-ni">
                        National Insurance number
                      </label>
                      <input
                        id="setup-ni"
                        className={inputClass}
                        value={niNumber}
                        onChange={(e) => setNiNumber(e.target.value)}
                        placeholder="e.g. QQ123456C"
                        autoComplete="off"
                      />
                      {taxFieldErrors.niNumber ? (
                        <p className="mt-1 text-xs font-medium text-red-600">{taxFieldErrors.niNumber}</p>
                      ) : null}
                    </div>
                  </div>
                  {taxError ? (
                    <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                      {taxError}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void saveTaxIds()}
                    disabled={taxSaving}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-green px-5 py-3 text-sm font-bold text-white hover:bg-brand-green-dark disabled:opacity-60"
                  >
                    {taxSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {taxSaving ? "Saving…" : "Save tax details"}
                  </button>
                </div>
              ) : null}

              {isExpanded && step.id === 5 ? (
                <div className="mt-4 border-t border-brand-green/10 pt-4">
                  <p className="text-sm text-slate-600">
                    Sign in with your HMRC sandbox test user on GOV.UK. We will link it to{" "}
                    <span className="font-semibold">{activeBusinessName ?? "your business"}</span> automatically when
                    possible.
                  </p>
                  {!canConnectHmrc ? (
                    <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      HMRC OAuth is not configured in this environment.
                    </p>
                  ) : null}
                  <button
                    type="button"
                    disabled={!canConnectHmrc || hmrcBusy || !activeBusinessId}
                    onClick={() => void connectHmrc()}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-ink px-5 py-3 text-sm font-bold text-white hover:bg-brand-ink/90 disabled:opacity-60"
                  >
                    {hmrcBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                    Connect to HMRC
                    <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                  </button>
                </div>
              ) : null}

              {isExpanded && step.id === 6 ? (
                <div className="mt-4 border-t border-brand-green/10 pt-4">
                  {activeBusinessHmrcId ? (
                    <p className="text-sm text-emerald-800">
                      Linked to HMRC business <span className="font-mono text-xs">{activeBusinessHmrcId}</span>.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-slate-600">
                        If HMRC returns exactly one self-employment business, we link it to your business automatically
                        — no dropdowns.
                      </p>
                      <button
                        type="button"
                        disabled={linkBusy}
                        onClick={() => void tryAutoLink()}
                        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-green px-5 py-3 text-sm font-bold text-white hover:bg-brand-green-dark disabled:opacity-60"
                      >
                        {linkBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {linkBusy ? "Linking…" : "Link now"}
                      </button>
                      <p className="mt-2 text-xs text-slate-500">
                        Multiple businesses on HMRC?{" "}
                        <Link href="/dashboard/settings" className="font-semibold text-brand-green hover:underline">
                          Link manually in Settings
                        </Link>
                        .
                      </p>
                    </>
                  )}
                </div>
              ) : null}

              {isExpanded && step.id === 7 ? (
                <div className="mt-4 border-t border-brand-green/10 pt-4">
                  <p className="text-sm text-slate-600">
                    You are ready. Open your income and expense form and start recording this quarter.
                  </p>
                  <Link
                    href={submitHref}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-green px-5 py-3 text-sm font-bold text-white shadow-md shadow-brand-green/25 hover:bg-brand-green-dark"
                  >
                    Start filling
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function DashboardSetupWizard(props: DashboardSetupWizardProps) {
  return (
    <Suspense
      fallback={
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Loading setup…</p>
        </section>
      }
    >
      <DashboardSetupWizardInner {...props} />
    </Suspense>
  );
}
