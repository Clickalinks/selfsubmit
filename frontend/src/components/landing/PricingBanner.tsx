import type { ReactNode } from "react";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";

import { PricingPlansGrid } from "@/components/subscription/PricingPlansGrid";
import { TIERS } from "@/data/pricingTiers";
import { PLAN_INCLUDED_FEATURES } from "@/lib/plan-config";

type PricingBannerProps = {
  /** When true, tier cards are clickable plan selectors (for /pricing). */
  interactive?: boolean;
  /** When set, replaces the default “Get started” row on the marketing homepage. */
  footer?: ReactNode;
};

function StaticPricingCards() {
  return (
    <div className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2 lg:mt-12 lg:grid-cols-4 lg:gap-5">
      {TIERS.map((tier) => (
        <div
          key={tier.id}
          className={`relative flex flex-col rounded-2xl border px-5 py-6 text-left sm:px-6 sm:py-7 ${
            tier.popular
              ? "border-brand-green/50 bg-gradient-to-b from-white/[0.12] to-white/[0.05] shadow-lg shadow-brand-green/10 ring-1 ring-brand-green/30"
              : "border-white/15 bg-white/[0.06]"
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
          <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-white/75">
            {tier.highlights.map((line) => (
              <li key={line} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2.5} aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
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
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/78 lg:text-base">
            Every plan includes income and expense tracking, receipt uploads, MTD-ready record keeping, deadline
            reminders, and secure document storage — with no payroll, invoicing, or complex bookkeeping.
          </p>
        </div>

        <ul className="mx-auto mt-6 flex max-w-4xl flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-white/70 sm:text-sm">
          {PLAN_INCLUDED_FEATURES.slice(0, 6).map((feature) => (
            <li key={feature} className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-brand-green" strokeWidth={2.5} aria-hidden />
              {feature}
            </li>
          ))}
        </ul>

        {interactive ? <PricingPlansGrid /> : <StaticPricingCards />}

        <p className="mx-auto mt-8 max-w-xl text-center text-xs leading-relaxed text-white/55 sm:text-sm">
          Illustrative tiers for the product roadmap. Final features, limits, and billing terms will be confirmed before
          checkout. Cancel anytime when subscriptions go live.
        </p>

        {!interactive ? (
          <div className="mt-8 flex justify-center px-2">
            {footer ?? (
              <Link
                href="/sign-up"
                className="inline-flex w-full max-w-sm items-center justify-center gap-1 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-brand-black no-underline shadow-md transition hover:bg-neutral-100 active:scale-[0.99] sm:w-auto sm:text-[15px]"
              >
                Get started
                <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
              </Link>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
