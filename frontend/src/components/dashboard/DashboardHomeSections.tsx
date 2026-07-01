import Link from "next/link";
import {
  ArrowRight,
  Check,
  PoundSterling,
  Receipt,
  Send,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

type Props = {
  hasPlan: boolean;
  hasBusiness: boolean;
  hasTaxIds: boolean;
};

const btnBase =
  "inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green sm:min-h-[3.25rem]";

function primarySubmitHref({ hasPlan, hasBusiness, hasTaxIds }: Props): string {
  if (!hasTaxIds) return "/dashboard#tax-details";
  if (!hasPlan) return "/pricing";
  if (!hasBusiness) return "/add-business";
  return "/submit";
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
        Submit to HMRC
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
};

const TONE_STYLES = {
  calm: "border-emerald-200 bg-emerald-50 text-emerald-950",
  info: "border-sky-200 bg-sky-50 text-sky-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  urgent: "border-red-200 bg-red-50 text-red-950",
} as const;

export function WhatDoINeedTodayCard({ message, tone, hasPlan, hasBusiness, hasTaxIds }: TodayCardProps) {
  const ctaHref = !hasTaxIds
    ? "/dashboard#tax-details"
    : !hasPlan
      ? "/pricing"
      : !hasBusiness
        ? "/add-business"
        : "/submit";
  const ctaLabel = !hasTaxIds
    ? "Add tax details"
    : !hasPlan
      ? "Choose subscription"
      : !hasBusiness
        ? "Choose profession"
        : "Continue your return";

  return (
    <section
      className={`rounded-2xl border-2 p-6 sm:p-8 ${TONE_STYLES[tone]}`}
      aria-labelledby="today-heading"
    >
      <p className="text-xs font-bold uppercase tracking-[0.15em] opacity-80">Today</p>
      <h2 id="today-heading" className="mt-2 text-xl font-bold sm:text-2xl">
        What do I need to do today?
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed sm:text-lg">{message}</p>
      {(tone !== "calm" || !hasTaxIds || !hasPlan || !hasBusiness) && (
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

export function DashboardGetStartedSteps({
  hasPlan,
  hasBusiness,
  hasTaxIds,
}: {
  hasPlan: boolean;
  hasBusiness: boolean;
  hasTaxIds: boolean;
}) {
  const steps = [
    {
      id: "tax-ids",
      label: "Add your UTR and National Insurance number",
      done: hasTaxIds,
      href: "/dashboard#tax-details",
      active: !hasTaxIds,
    },
    {
      id: "plan",
      label: "Choose a subscription plan",
      done: hasPlan,
      href: "/pricing",
      active: hasTaxIds && !hasPlan,
    },
    {
      id: "profession",
      label: "Choose your profession",
      done: hasBusiness,
      href: "/add-business",
      active: hasTaxIds && hasPlan && !hasBusiness,
    },
    {
      id: "records",
      label: "Add income and expenses",
      done: false,
      href: "/submit",
      active: hasTaxIds && hasPlan && hasBusiness,
    },
  ] as const;

  const allComplete = hasTaxIds && hasPlan && hasBusiness;
  if (allComplete) return null;

  return (
    <section
      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
      aria-labelledby="setup-checklist-heading"
    >
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-green">To-do list</p>
      <h3 id="setup-checklist-heading" className="mt-1 text-lg font-bold text-slate-900">
        Get started with SelfSubmit
      </h3>
      <p className="mt-1 text-sm text-slate-500">Work through these steps in order to unlock your MTD dashboard.</p>

      <ol className="mt-5 space-y-3">
        {steps.map((step, index) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition ${
                step.active
                  ? "border-brand-green/40 bg-brand-mint/40 ring-1 ring-brand-green/20"
                  : step.done
                    ? "border-emerald-200 bg-emerald-50/80"
                    : "border-slate-100 bg-slate-50/80 opacity-70"
              }`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  step.done
                    ? "bg-emerald-600 text-white"
                    : step.active
                      ? "bg-brand-green text-white"
                      : "bg-slate-200 text-slate-500"
                }`}
                aria-hidden
              >
                {step.done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block text-sm font-semibold ${
                    step.active ? "text-brand-forest" : step.done ? "text-emerald-900" : "text-slate-600"
                  }`}
                >
                  {step.label}
                </span>
                {step.active ? (
                  <span className="mt-0.5 block text-xs font-medium text-brand-green">Start here →</span>
                ) : step.done ? (
                  <span className="mt-0.5 block text-xs text-emerald-700">Complete</span>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
