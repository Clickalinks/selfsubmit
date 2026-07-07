import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

import { MtdFilingStatusSection } from "@/components/landing/MtdFilingStatusSection";
import { SitePageHero, SitePageShell } from "@/components/landing/SitePageShell";
import { ALL_PLAN_FEATURES, SITE_FEATURE_GROUPS } from "@/data/siteFeatures";

export const metadata: Metadata = {
  title: "Features — SelfSubmit",
    description:
    "Income and expense tracking, receipt uploads, MTD record-keeping, deadline reminders, and secure storage for UK self-employed people.",
};

export default function FeaturesPage() {
  return (
    <SitePageShell>
      <SitePageHero
        eyebrow="Product"
        title="Everything you need for MTD — nothing you don't"
        description="SelfSubmit focuses on monthly digital records for MTD. Live HMRC quarterly filing is in development — see status below."
      />

      <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <MtdFilingStatusSection />

        <div className="mt-14">
        {SITE_FEATURE_GROUPS.map((group) => (
          <section key={group.title} className="mb-14 last:mb-0">
            <h2 className="text-xl font-bold text-brand-black sm:text-2xl">{group.title}</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {group.features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.id}
                    className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
                  >
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-mint text-brand-green">
                      <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-brand-black">{feature.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-muted">{feature.description}</p>
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        <section className="rounded-2xl border border-brand-green/25 bg-brand-mint/40 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-brand-black sm:text-2xl">Included on every plan</h2>
          <p className="mt-2 text-sm text-brand-muted sm:text-base">
            All subscription tiers include the same core features — you only pay more when you need additional business
            profiles.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_PLAN_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-brand-black/90">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2.5} aria-hidden />
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full bg-brand-green px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-green-dark"
            >
              View pricing
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-brand-black transition hover:bg-slate-50"
            >
              Get started
            </Link>
          </div>
        </section>
        </div>
      </div>
    </SitePageShell>
  );
}
