import Link from "next/link";
import {
  ArrowRight,
  PoundSterling,
  Receipt,
  Send,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const btnBase =
  "inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green sm:min-h-[3.25rem]";

type Props = {
  hasPlan: boolean;
  hasBusiness: boolean;
  hasTaxIds: boolean;
  hmrcSandboxReady?: boolean;
  submitHref?: string;
};

function primarySubmitHref({
  hasPlan,
  hasBusiness,
  hasTaxIds,
  hmrcSandboxReady = false,
  submitHref,
}: Props): string {
  if (hmrcSandboxReady && submitHref) return submitHref;
  if (!hasPlan) return "/pricing";
  if (!hasBusiness || !hasTaxIds || !hmrcSandboxReady) return "/dashboard#setup-wizard";
  return submitHref ?? "/submit";
}

export function DashboardPrimaryActions(props: Props) {
  const submitHref = primarySubmitHref(props);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Link
        href={submitHref}
        className={`${btnBase} bg-brand-green text-white shadow-md shadow-brand-green/25 hover:bg-brand-green-dark`}
      >
        <PoundSterling className="h-4 w-4" aria-hidden />
        Add income
      </Link>
      <Link
        href={submitHref}
        className={`${btnBase} bg-white text-brand-forest ring-1 ring-brand-green/25 hover:bg-brand-mint/60`}
      >
        <TrendingDown className="h-4 w-4" aria-hidden />
        Add expense
      </Link>
      <Link
        href="/dashboard/receipts"
        className={`${btnBase} bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50`}
      >
        <Receipt className="h-4 w-4" aria-hidden />
        Upload document
      </Link>
      <Link
        href={submitHref}
        className={`${btnBase} bg-brand-ink text-white hover:bg-brand-ink/90`}
      >
        <Send className="h-4 w-4" aria-hidden />
        Monthly records
      </Link>
    </div>
  );
}

type TodayCardProps = {
  message: string;
  tone: "calm" | "info" | "warning" | "urgent";
  hasPlan: boolean;
  hasBusiness: boolean;
  hasTaxIds: boolean;
  hmrcSandboxReady?: boolean;
  submitHref?: string;
};

const TONE_STYLES = {
  calm: "border-emerald-200 bg-emerald-50 text-emerald-950",
  info: "border-sky-200 bg-sky-50 text-sky-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  urgent: "border-red-200 bg-red-50 text-red-950",
} as const;

function todayCta({
  hasPlan,
  hasBusiness,
  hasTaxIds,
  hmrcSandboxReady = false,
  submitHref,
}: TodayCardProps): { href: string; label: string } {
  if (hmrcSandboxReady) {
    return { href: submitHref ?? "/submit", label: "Open monthly form" };
  }
  if (!hasPlan) return { href: "/pricing", label: "Choose subscription" };
  if (!hasBusiness) return { href: "/dashboard#setup-wizard", label: "Select business" };
  if (!hasTaxIds) return { href: "/dashboard#setup-wizard", label: "Add tax details" };
  return { href: "/dashboard#setup-wizard", label: "Connect HMRC" };
}

export function WhatDoINeedTodayCard({
  message,
  tone,
  hasPlan,
  hasBusiness,
  hasTaxIds,
  hmrcSandboxReady,
  submitHref,
}: TodayCardProps) {
  const { href: ctaHref, label: ctaLabel } = todayCta({
    message,
    tone,
    hasPlan,
    hasBusiness,
    hasTaxIds,
    hmrcSandboxReady,
    submitHref,
  });

  const setupComplete = Boolean(hmrcSandboxReady);

  return (
    <section
      className={`rounded-2xl border-2 p-6 sm:p-8 ${TONE_STYLES[tone]}`}
      aria-labelledby="today-heading"
    >
      <p className="text-xs font-bold uppercase tracking-[0.15em] opacity-80">Today</p>
      <h2 id="today-heading" className="mt-2 text-xl font-bold sm:text-2xl">
        Recommended next step
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed sm:text-lg">{message}</p>
      {(tone !== "calm" || !setupComplete) && (
        <Link
          href={ctaHref}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-green px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-green-dark"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </section>
  );
}

type StatProps = {
  label: string;
  value: string;
  icon: typeof TrendingUp;
  accent?: string;
};

export function DashboardStat({ label, value, icon: Icon, accent = "text-brand-green" }: StatProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 text-xl font-bold tabular-nums text-slate-900 sm:text-2xl">{value}</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-mint/80 ${accent}`}>
          <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
        </div>
      </div>
    </div>
  );
}

export function MtdStatusBadge({ status, label }: { status: string; label: string }) {
  const styles: Record<string, string> = {
    not_started: "bg-slate-100 text-slate-700",
    on_track: "bg-emerald-100 text-emerald-800",
    action_needed: "bg-amber-100 text-amber-900",
    overdue: "bg-red-100 text-red-800",
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${styles[status] ?? styles.not_started}`}>
      {label}
    </span>
  );
}
