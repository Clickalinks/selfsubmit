import type { ReactNode } from "react";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";

import { PricingPlansGrid } from "@/components/subscription/PricingPlansGrid";
import { PlanFeaturesList } from "@/components/subscription/PlanFeaturesList";
import { PLAN_CORE_FEATURE_COUNT, TIERS } from "@/data/pricingTiers";

type PricingBannerProps = {
  /** When true, tier cards link to plan detail pages (for /pricing). */
  interactive?: boolean;
  /** When set, replaces the default “Get started” row on the marketing homepage. */
  footer?: ReactNode;
};

function StaticPricingCards() {
  return (
    <div className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2 lg:mt-12 lg:grid-cols-4 lg:gap-5">
      {TIERS.map((tier) => (
        <Link
          key={tier.id}
          href={`/pricing/${tier.id}`}
          className={`relative flex flex-col rounded-2xl border px-5 py-6 text-left transition hover:-translate-y-0.5 sm:px-6 sm:py-7 ${
            tier.popular
              ? "border-brand-green/50 bg-gradient-to-b from-white/[0.12] to-white/[0.05] shadow-lg shadow-brand-green/10 ring-1 ring-brand-green/30"
              : "border-white/15 bg-white/[0.06] hover:bg-white/[0.1]"
          }`}
        >
          {tier.popular ? (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-b from-brand-green-bright to-brand-green-dark px-3 py-1 text-xs font-bold text-white shadow-btn-green">
              Most popular
            </div>
          ) : null}
          <p className="text-xs font-bold uppercase tracking-wide text-brand-green">{tier.name}</p>
          <p className="mt-2 text-lg font-bold text-white lg:text-xl">{tier.businessesLabel}</p>
          <p className="mt-2 text-sm leading-relaxed text-white/65">{tier.businessesDetail}</p>
          <div className="mt-6 flex items-baseline gap-1 border-t border-white/10 pt-6">
            <span className="text-3xl font-bold tabular-nums text-white lg:text-4xl">£{tier.price}</span>
            <span className="text-sm font-medium text-white/55">/ month</span>
          </div>
          <p className="mt-2 text-xs font-semibold text-brand-green">Then £{tier.price}/mo after 3 months free</p>
          <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-white/75">
            {tier.highlights.map((line) => (
              <li key={line} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2.5} aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <span className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-b from-brand-green-bright to-brand-green-dark px-4 py-2.5 text-sm font-bold text-white shadow-btn-green">
            Start free trial
          </span>
        </Link>
      ))}
    </div>
  );
}

export function PricingBanner({ interactive = false, footer }: PricingBannerProps) {
  return (
    <section id="pricing" className="scroll-mt-24 bg-transparent px-4 pb-12 sm:px-6 sm:pb-16 lg:px-10 lg:pb-20">
      <div className="mx-auto max-w-content rounded-2xl bg-gradient-to-b from-brand-black to-neutral-950 px-4 py-10 shadow-xl ring-1 ring-black/5 sm:rounded-[2rem] sm:px-6 sm:py-12 lg:rounded-[2.25rem] lg:px-10 lg:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-green sm:text-sm">Subscriptions</p>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
            Simple plans for self-employed MTD
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white selection:bg-brand-green selection:text-white lg:text-base">
            Every plan includes the same {PLAN_CORE_FEATURE_COUNT} core features — income and expense tracking, receipt
            uploads, MTD-ready record keeping, deadline reminders, and secure storage. You only pay more for additional
            businesses.
          </p>
          <div className="mt-7 flex flex-col items-center gap-3">
            <Link
              href="/sign-up"
              className="inline-flex w-full max-w-md items-center justify-center gap-2 rounded-full bg-gradient-to-b from-brand-green-bright to-brand-green-dark px-8 py-3.5 text-center text-sm font-bold text-white shadow-btn-green transition hover:brightness-105 active:scale-[0.99] sm:w-auto sm:px-10 sm:text-[15px]"
            >
              Start your 3-month free trial
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </Link>
            <p className="max-w-sm text-center text-xs leading-relaxed text-white/55">
              Card required at checkout · no charge for 3 months · cancel anytime
            </p>
          </div>
        </div>

        {interactive ? <PricingPlansGrid /> : <StaticPricingCards />}

        <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
          <h3 className="text-center text-sm font-bold text-white sm:text-base">
            All {PLAN_CORE_FEATURE_COUNT} features on every plan
          </h3>
          <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-white/65 sm:text-sm">
            Open any plan above for a full breakdown. The only difference between tiers is how many businesses you can
            manage.
          </p>
          <PlanFeaturesList className="mt-5" variant="light" columns={2} />
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-xs leading-relaxed text-white/55 sm:text-sm">
          New subscribers: 3 months free, then your plan price. Secure checkout via Stripe. Cancel anytime from Settings
          → Manage billing.
        </p>

        {!interactive ? (
          <div className="mt-8 flex justify-center px-2">
            {footer ?? (
              <Link
                href="/sign-up"
                className="inline-flex w-full max-w-sm items-center justify-center gap-1 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-brand-black no-underline shadow-md transition hover:bg-neutral-100 active:scale-[0.99] sm:w-auto sm:text-[15px]"
              >
                Get started — 3 months free
                <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
              </Link>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
