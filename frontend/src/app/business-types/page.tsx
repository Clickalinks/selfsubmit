import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SitePageHero, SitePageShell } from "@/components/landing/SitePageShell";
import { SELF_EMPLOYED_PROFESSION_COUNT } from "@/data/selfEmployedProfessions";
import { SUPPORTED_BUSINESS_GROUPS } from "@/data/supportedBusinessGroups";
import { GOVUK_MTD_COMPATIBLE_SOFTWARE_FINDER } from "@/lib/govuk-mtd-links";

export const metadata: Metadata = {
  title: "Supported business types — SelfSubmit",
  description:
    "Browse every UK self-employed trade and business type with a tailored monthly return form on SelfSubmit — from taxi drivers and trades to freelancers and landlords.",
};

export default function BusinessTypesPage() {
  return (
    <SitePageShell>
      <SitePageHero
        eyebrow="Product"
        title={`${SELF_EMPLOYED_PROFESSION_COUNT} business types — ready-made forms`}
        description="Select your trade when you add a business. SelfSubmit loads income and expense categories for that profession."
      />

      <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="space-y-12">
          {SUPPORTED_BUSINESS_GROUPS.map((group) => {
            const GroupIcon = group.icon;
            return (
              <section key={group.id} aria-labelledby={`group-${group.id}`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-mint ring-1 ring-brand-green/15">
                    <GroupIcon className="h-5 w-5 text-brand-green" strokeWidth={1.75} aria-hidden />
                  </div>
                  <h2 id={`group-${group.id}`} className="text-xl font-bold text-brand-black sm:text-2xl">
                    {group.title}
                  </h2>
                </div>
                <ul className="mt-5 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {group.professions.map((profession) => {
                    const Icon = profession.icon;
                    return (
                      <li key={profession.name}>
                        <div className="flex h-full items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white px-3 py-3 shadow-sm">
                          <Icon className="h-4 w-4 shrink-0 text-brand-green" strokeWidth={1.75} aria-hidden />
                          <span className="text-sm font-medium leading-snug text-slate-800">{profession.name}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        <div className="mt-14 rounded-2xl border border-brand-green/20 bg-brand-mint/40 px-6 py-8 text-center sm:px-10">
          <h2 className="text-lg font-bold text-brand-black sm:text-xl">Don&apos;t see your trade?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-brand-muted sm:text-base">
            Use <strong>Freelancer (General)</strong> or <strong>Small Sole Trader</strong> — or contact us and we can
            add your line items.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-6 py-3 text-sm font-bold text-white shadow-btn-green transition hover:bg-brand-green-dark"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </SitePageShell>
  );
}
