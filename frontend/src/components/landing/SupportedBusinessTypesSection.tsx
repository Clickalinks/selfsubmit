import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SELF_EMPLOYED_PROFESSION_COUNT } from "@/data/selfEmployedProfessions";
import { SUPPORTED_BUSINESS_GROUPS } from "@/data/supportedBusinessGroups";

export function SupportedBusinessTypesSection() {
  return (
    <section
      id="business-types"
      className="relative w-full scroll-mt-28 border-b border-brand-green/10 bg-gradient-to-b from-brand-mint/50 via-white to-white px-3 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16"
      aria-labelledby="business-types-heading"
    >
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-green">Built for UK self-employed</p>
          <h1 id="business-types-heading" className="mt-2 text-2xl font-bold text-brand-black sm:text-3xl lg:text-4xl">
            {SELF_EMPLOYED_PROFESSION_COUNT} business types — ready-made forms
          </h1>
          <p className="mt-3 text-sm text-brand-muted sm:text-base">
            Choose your trade at sign-up and we load the right income and expense lines for your work — no generic
            spreadsheet.
          </p>
        </div>

        <div className="mt-10 space-y-10 sm:mt-12">
          {SUPPORTED_BUSINESS_GROUPS.map((group) => {
            const GroupIcon = group.icon;
            return (
              <div key={group.id}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-mint ring-1 ring-brand-green/15">
                    <GroupIcon className="h-5 w-5 text-brand-green" strokeWidth={1.75} aria-hidden />
                  </div>
                  <h2 className="text-lg font-bold text-brand-black sm:text-xl">{group.title}</h2>
                </div>
                <ul className="mt-4 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {group.professions.map((profession) => {
                    const Icon = profession.icon;
                    return (
                      <li key={profession.name}>
                        <div className="flex h-full items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 shadow-sm">
                          <Icon className="h-4 w-4 shrink-0 text-brand-green" strokeWidth={1.75} aria-hidden />
                          <span className="text-sm font-medium leading-snug text-slate-800">{profession.name}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center sm:mt-12">
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-green px-8 py-3 text-sm font-bold text-white shadow-btn-green transition hover:bg-brand-green-dark sm:text-base"
          >
            Get started — pick your trade
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
