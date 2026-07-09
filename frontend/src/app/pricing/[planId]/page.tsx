import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";

import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { PlanFeaturesList } from "@/components/subscription/PlanFeaturesList";
import { PlanSubscribeButton } from "@/components/subscription/PlanSubscribeButton";
import { getTierByPlanId, PLAN_CORE_FEATURE_COUNT } from "@/data/pricingTiers";
import { PLAN_DISPLAY_NAMES, PLAN_IDS, type PlanId } from "@/lib/plan-config";
import { pageCanonical, defaultOpenGraph, defaultTwitter } from "@/lib/seo";

type Props = {
  params: Promise<{ planId: string }>;
};

export function generateStaticParams() {
  return PLAN_IDS.map((planId) => ({ planId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { planId } = await params;
  const tier = getTierByPlanId(planId as PlanId);
  if (!tier) {
    return { title: "Plan not found — SelfSubmit" };
  }
  const path = `/pricing/${planId}`;
  return {
    title: `${tier.name} plan — SelfSubmit`,
    description: `${tier.businessesDetail} £${tier.price}/month. All core SelfSubmit features included.`,
    alternates: pageCanonical(path),
    openGraph: defaultOpenGraph({
      title: `${tier.name} plan — SelfSubmit`,
      description: `${tier.businessesDetail} £${tier.price}/month.`,
      url: path,
    }),
    twitter: defaultTwitter({
      title: `${tier.name} plan — SelfSubmit`,
      description: `${tier.businessesDetail} £${tier.price}/month.`,
    }),
  };
}

export default async function PlanDetailPage({ params }: Props) {
  const { planId } = await params;
  if (!PLAN_IDS.includes(planId as PlanId)) notFound();

  const tier = getTierByPlanId(planId as PlanId);
  if (!tier) notFound();

  const otherPlans = PLAN_IDS.filter((id) => id !== tier.id).map((id) => getTierByPlanId(id)!);

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <Link href="/pricing" className="text-sm font-semibold text-brand-green hover:underline">
          ← All plans
        </Link>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-green">{tier.name} plan</p>
          <h1 className="mt-2 text-2xl font-bold text-brand-black sm:text-3xl">{tier.businessesLabel}</h1>
          <p className="mt-3 text-base leading-relaxed text-brand-muted">{tier.businessesDetail}</p>

          <div className="mt-6 flex items-baseline gap-2 border-t border-slate-100 pt-6">
            <span className="text-4xl font-bold tabular-nums text-brand-black">£{tier.price}</span>
            <span className="text-sm font-medium text-brand-muted">/ month</span>
          </div>

          <ul className="mt-6 space-y-2.5 text-sm text-brand-black/90">
            {tier.highlights.map((line) => (
              <li key={line} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2.5} aria-hidden />
                {line}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <PlanSubscribeButton planId={tier.id} />
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-brand-green/20 bg-brand-mint/30 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-brand-black sm:text-xl">All {PLAN_DISPLAY_NAMES[tier.id]} includes</h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-muted">
            Every SelfSubmit plan includes the same {PLAN_CORE_FEATURE_COUNT} core features. You only pay more when you need additional
            business profiles for separate trades or rental streams.
          </p>
          <PlanFeaturesList className="mt-6" columns={2} />
          <p className="mt-6 text-sm text-brand-muted">
            Need more detail? See our{" "}
            <Link href="/features" className="font-semibold text-brand-green hover:underline">
              full features page
            </Link>
            .
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-bold text-brand-black">Compare other plans</h2>
          <ul className="mt-4 space-y-3">
            {otherPlans.map((other) => (
              <li key={other.id}>
                <Link
                  href={`/pricing/${other.id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition hover:border-brand-green/30 hover:bg-brand-mint/20"
                >
                  <span>
                    <span className="font-bold text-brand-black">{other.name}</span>
                    <span className="text-brand-muted"> · {other.businessesLabel}</span>
                  </span>
                  <span className="font-bold tabular-nums text-brand-black">£{other.price}/mo</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
