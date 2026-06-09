import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import { INSIGHT_ACCENT_STYLES, MTD_INSIGHTS } from "@/data/mtdInsights";

function InsightCard({ article }: { article: (typeof MTD_INSIGHTS)[number] }) {
  const Icon = article.icon;
  const accent = INSIGHT_ACCENT_STYLES[article.accent];

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-slate-300/90 hover:shadow-md sm:p-7">
      <div
        className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ${accent.iconBg} ${accent.ring}`}
      >
        <Icon className={`h-7 w-7 ${accent.iconColor}`} strokeWidth={1.75} aria-hidden />
      </div>

      <p className={`mt-5 text-xs font-bold uppercase tracking-[0.12em] ${accent.category}`}>{article.category}</p>
      <h3 className="mt-2 text-lg font-bold leading-snug text-brand-black sm:text-xl">{article.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-muted">{article.excerpt}</p>

      <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={article.href}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-green-dark"
        >
          Read guide
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
        <a
          href={article.hmrcUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-muted transition hover:text-brand-green"
        >
          Official HMRC page
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </article>
  );
}

export function MtdInsightsSection() {
  return (
    <section
      id="mtd-insights"
      className="relative w-full border-t border-slate-200/80 bg-gradient-to-b from-slate-50 to-white px-3 py-10 sm:px-8 sm:py-16 lg:px-12 lg:py-20"
      aria-labelledby="mtd-insights-heading"
    >
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-green">Stay informed</p>
          <h2 id="mtd-insights-heading" className="mt-2 text-2xl font-bold text-brand-black sm:text-3xl lg:text-4xl">
            Latest MTD insights
          </h2>
          <p className="mt-3 text-sm text-brand-muted sm:text-base">
            Practical guides and HMRC-aligned updates to help you stay on top of Making Tax Digital.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:mt-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {MTD_INSIGHTS.map((article) => (
            <InsightCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
