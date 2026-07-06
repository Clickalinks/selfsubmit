import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import { SitePageHero, SitePageShell } from "@/components/landing/SitePageShell";
import { INSIGHT_ACCENT_STYLES, MTD_INSIGHTS } from "@/data/mtdInsights";

export const metadata: Metadata = {
  title: "Blog & guides — SelfSubmit",
  description:
    "MTD guides, deadline reminders, and practical articles for UK self-employed people and landlords using SelfSubmit.",
};

export default function BlogPage() {
  return (
    <SitePageShell>
      <SitePageHero
        eyebrow="Blog"
        title="Guides & updates"
        description="Practical MTD articles aligned with HMRC guidance. More posts on record-keeping, expenses, and product updates will be added here."
      />

      <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MTD_INSIGHTS.map((article) => {
            const Icon = article.icon;
            const accent = INSIGHT_ACCENT_STYLES[article.accent];
            return (
              <article
                key={article.id}
                className="group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:p-7"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${accent.iconBg} ${accent.ring}`}
                >
                  <Icon className={`h-6 w-6 ${accent.iconColor}`} strokeWidth={1.75} aria-hidden />
                </div>
                <p className={`mt-5 text-xs font-bold uppercase tracking-[0.12em] ${accent.category}`}>
                  {article.category}
                </p>
                <h2 className="mt-2 text-lg font-bold leading-snug text-brand-black">{article.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-muted">{article.excerpt}</p>
                <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href={article.href}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green underline-offset-2 hover:underline"
                  >
                    Read guide
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href={article.hmrcUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-muted transition hover:text-brand-green"
                  >
                    HMRC source
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center sm:px-10">
          <h2 className="text-lg font-bold text-brand-black">More articles coming soon</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-brand-muted sm:text-base">
            We are preparing posts on expenses, CIS, landlord income, and product release notes. Browse our{" "}
            <Link href="/mtd" className="font-semibold text-brand-green underline underline-offset-2">
              MTD categories
            </Link>{" "}
            in the meantime.
          </p>
        </aside>
      </div>
    </SitePageShell>
  );
}
