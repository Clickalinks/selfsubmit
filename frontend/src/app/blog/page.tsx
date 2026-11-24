import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  ExternalLink,
  FileSpreadsheet,
  Landmark,
  Receipt,
} from "lucide-react";

import { SitePageShell } from "@/components/landing/SitePageShell";
import { INSIGHT_ACCENT_STYLES, MTD_INSIGHTS } from "@/data/mtdInsights";
import { getInfoBlockBySlug, MTD_INFO_BLOCKS } from "@/data/mtdInfoBlocks";
import {
  GOVUK_MTD_COMPATIBLE_SOFTWARE_FINDER,
  GOVUK_MTD_ITSA_ELIGIBILITY,
  GOVUK_MTD_ITSA_HOW_TO_USE,
  GOVUK_MTD_ITSA_STEP_BY_STEP,
  GOVUK_SELF_ASSESSMENT_DEADLINES,
} from "@/lib/govuk-mtd-links";
import { MTD_SOFTWARE_GUIDE_SLUG } from "@/lib/hmrc-software-choices";
import { defaultOpenGraph, defaultTwitter, pageCanonical } from "@/lib/seo";

const GOVUK_MTD_PENALTIES = "https://www.gov.uk/guidance/penalties-for-making-tax-digital-for-income-tax";
const GOVUK_ESTIMATE_SA_BILL = "https://www.gov.uk/estimate-self-assessment-tax-bill";
const GOVUK_REGISTER_SA = "https://www.gov.uk/register-for-self-assessment";

export const metadata: Metadata = {
  title: "Guides & blog — MTD for Income Tax",
  description:
    "Practical Making Tax Digital guides for UK sole traders and landlords: who MTD applies to, digital records, quarterly updates, deadlines, and how to use SelfSubmit.",
  alternates: pageCanonical("/blog"),
  openGraph: defaultOpenGraph({
    title: "Guides & blog — MTD for Income Tax | SelfSubmit",
    description:
      "Practical MTD guides: digital records, quarterly updates, deadlines, and how to use SelfSubmit. Confirm rules on GOV.UK.",
    url: "/blog",
  }),
  twitter: defaultTwitter({
    title: "Guides & blog — MTD for Income Tax | SelfSubmit",
    description:
      "Practical MTD guides: digital records, quarterly updates, deadlines, and how to use SelfSubmit.",
  }),
};

type GuideGroup = {
  title: string;
  description: string;
  slugs: string[];
};

const GUIDE_GROUPS: GuideGroup[] = [
  {
    title: "Who MTD is for",
    description: "What Making Tax Digital for Income Tax is, who it can apply to, and how people usually sign up.",
    slugs: ["mtd-for-income-tax", "self-employed-mtd", "landlord-mtd", "mtd-exemptions", "mtd-sign-up"],
  },
  {
    title: "Keep digital records",
    description: "What to record during the year, receipts, expenses, and how income types usually fit together.",
    slugs: ["record-keeping", "digital-records", "allowable-expenses", "income-sources", "business-types"],
  },
  {
    title: "Updates, deadlines and tax",
    description: "Quarterly updates, reporting dates, how tax is calculated, and the year-end return.",
    slugs: ["quarterly-updates", "mtd-deadlines", "tax-calculations", "final-declaration", "penalties-and-fines"],
  },
  {
    title: "Software, HMRC and help",
    description: "Recognised software, HMRC accounts, agents, VAT (a separate regime), and where to get support.",
    slugs: [MTD_SOFTWARE_GUIDE_SLUG, "hmrc-online-services", "agent-services", "mtd-for-vat", "help-and-support"],
  },
];

const START_HERE = [
  {
    step: "1",
    title: "Check if MTD applies",
    body: "HMRC decides who must use Making Tax Digital for Income Tax. Use the official checker — do not rely on a software site to tell you that you are in scope.",
    href: GOVUK_MTD_ITSA_ELIGIBILITY,
    external: true,
    cta: "GOV.UK checker",
  },
  {
    step: "2",
    title: "Keep records as you go",
    body: "Log income and expenses in compatible software through the year. Waiting until January is the old Self Assessment habit — MTD is built around digital records.",
    href: "/how-to-use",
    external: false,
    cta: "How to use SelfSubmit",
  },
  {
    step: "3",
    title: "Send quarterly updates",
    body: "Each quarter, send HMRC a running total of your business income and expenses. That is a progress report, not a tax bill.",
    href: "/mtd/quarterly-updates",
    external: false,
    cta: "Quarterly updates guide",
  },
  {
    step: "4",
    title: "Finish the year with HMRC",
    body: "After the tax year you still complete a tax return / final declaration. SelfSubmit does not submit that yet — use your HMRC Personal Tax Account or compatible software that does.",
    href: "/mtd/final-declaration",
    external: false,
    cta: "Final declaration guide",
  },
] as const;

const YEAR_TIMELINE = [
  {
    date: "6 April 2026",
    title: "MTD started for many over £50,000",
    body: "Sole traders and landlords over the first income threshold began keeping digital records. Later waves are planned for £30,000 (April 2027) and £20,000 (April 2028).",
    status: "passed",
  },
  {
    date: "7 August 2026",
    title: "First quarterly update",
    body: "Deadline for the first 2026/27 update (usually covering 6 April to 5 July, or calendar quarters if you elected them).",
    status: "passed",
  },
  {
    date: "7 November 2026",
    title: "Second quarterly update",
    body: "This deadline has just passed. If yours is still outstanding, send it now. Updates are usually cumulative — this one typically includes income and expenses from 6 April to 5 October.",
    status: "recent",
  },
  {
    date: "7 February 2027",
    title: "Third quarterly update",
    body: "Next standard deadline. Keep recording through 5 January 2027 so the figures are ready. Confirm your own dates in HMRC or your software.",
    status: "next",
  },
  {
    date: "7 May 2027",
    title: "Fourth quarterly update",
    body: "Closes the 2026/27 quarterly cycle for most people. The tax return for this year is a separate job, usually due 31 January 2028.",
    status: "upcoming",
  },
] as const;

function statusStyles(status: (typeof YEAR_TIMELINE)[number]["status"]) {
  if (status === "next") return "border-brand-green bg-brand-mint/80 ring-1 ring-brand-green/20";
  if (status === "recent") return "border-amber-200 bg-amber-50";
  return "border-slate-200/80 bg-white";
}

export default function BlogPage() {
  const groupedSlugs = new Set(GUIDE_GROUPS.flatMap((group) => group.slugs));
  const leftoverGuides = MTD_INFO_BLOCKS.filter((block) => !groupedSlugs.has(block.slug));

  return (
    <SitePageShell>
      <section className="relative overflow-hidden border-b border-brand-green/20 bg-gradient-to-b from-[#0d5c36] via-[#0f6b3f] to-[#0a4d2e] px-5 py-12 text-white sm:px-8 sm:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200/95">Guides &amp; blog</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            What to do for Making Tax Digital this year
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
            Practical guides for UK sole traders and landlords: digital records, quarterly updates, deadlines, and how
            SelfSubmit fits in. Confirm eligibility and dates on GOV.UK — this is not tax advice.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/how-to-use"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-brand-black shadow-sm transition hover:bg-brand-mint"
            >
              How to use SelfSubmit
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href={GOVUK_MTD_ITSA_ELIGIBILITY}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/20"
            >
              Check if MTD applies
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-16 px-5 py-12 sm:px-8 sm:py-16">
        <section aria-labelledby="this-year-heading">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-green">Tax year 2026/27</p>
            <h2 id="this-year-heading" className="mt-2 text-2xl font-bold text-brand-black">
              Where you are right now
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">
              Standard quarterly deadlines fall on 7 August, 7 November, 7 February and 7 May. Some people use calendar
              quarters instead. Always check the dates HMRC has given you. Official overview:{" "}
              <a
                href={GOVUK_MTD_ITSA_STEP_BY_STEP}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-green hover:underline"
              >
                HMRC step-by-step
              </a>
              .
            </p>
          </div>

          <ol className="mt-8 space-y-3">
            {YEAR_TIMELINE.map((item) => (
              <li key={item.date} className={`rounded-2xl border p-4 sm:p-5 ${statusStyles(item.status)}`}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-green">{item.date}</p>
                  {item.status === "next" ? (
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-green">Next for most people</p>
                  ) : null}
                  {item.status === "recent" ? (
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Just passed</p>
                  ) : null}
                </div>
                <h3 className="mt-1 text-base font-bold text-brand-black">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-brand-muted">{item.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-4 text-sm leading-relaxed text-brand-muted">
            <p>
              <strong className="text-brand-black">Late updates in the first year:</strong> if you needed MTD from 6
              April 2026, HMRC says there are no penalty points for late quarterly updates in 2026/27. You still need
              to send them, and missing the tax return deadline is different. Read{" "}
              <a
                href={GOVUK_MTD_PENALTIES}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-green hover:underline"
              >
                penalties for MTD for Income Tax
              </a>{" "}
              on GOV.UK.
            </p>
          </div>
        </section>

        <section aria-labelledby="start-here-heading">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-green">Start here</p>
            <h2 id="start-here-heading" className="mt-2 text-2xl font-bold text-brand-black">
              Four steps that actually matter
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">
              Most people do not need twenty articles first. Work through this order, then open the detailed guide that
              matches your situation.
            </p>
          </div>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2">
            {START_HERE.map((item) => (
              <li key={item.step} className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-green">Step {item.step}</p>
                <h3 className="mt-1 text-lg font-bold text-brand-black">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-muted">{item.body}</p>
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-green hover:underline"
                  >
                    {item.cta}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-green hover:underline"
                  >
                    {item.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby="plain-english-heading"
          className="grid gap-6 rounded-3xl border border-brand-green/20 bg-brand-mint/50 p-6 sm:grid-cols-2 sm:p-8"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-green">Plain English</p>
            <h2 id="plain-english-heading" className="mt-2 text-2xl font-bold text-brand-black">
              A quarterly update is not a tax bill
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-muted">
              This is the part that confuses almost everyone new to MTD. Keep the three jobs separate so you do not
              under-record, or wait for a bill that never arrives in the software.
            </p>
          </div>
          <ul className="space-y-4 text-sm leading-relaxed text-brand-muted">
            <li className="flex gap-3">
              <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" aria-hidden />
              <span>
                <strong className="text-brand-black">Quarterly update:</strong> send HMRC a digital summary of income
                and expenses so far. SelfSubmit can submit this when HMRC is connected. Figures are usually cumulative
                through the year.
              </span>
            </li>
            <li className="flex gap-3">
              <Landmark className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" aria-hidden />
              <span>
                <strong className="text-brand-black">Tax return / final declaration:</strong> year-end confirmation of
                the full picture. Not submitted in SelfSubmit yet — use your HMRC Personal Tax Account or other
                compatible software.
              </span>
            </li>
            <li className="flex gap-3">
              <Receipt className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" aria-hidden />
              <span>
                <strong className="text-brand-black">Tax due:</strong> HMRC calculates what you owe. Payments still
                follow HMRC dates (often 31 January and 31 July). SelfSubmit does not display HMRC’s official balance.
              </span>
            </li>
          </ul>
        </section>

        <section aria-labelledby="featured-heading">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-green">Featured</p>
            <h2 id="featured-heading" className="mt-2 text-2xl font-bold text-brand-black">
              Three guides most people open first
            </h2>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MTD_INSIGHTS.map((article) => {
              const Icon = article.icon;
              const accent = INSIGHT_ACCENT_STYLES[article.accent];
              return (
                <article
                  key={article.id}
                  className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
                >
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${accent.iconBg} ${accent.ring}`}
                  >
                    <Icon className={`h-6 w-6 ${accent.iconColor}`} strokeWidth={1.75} aria-hidden />
                  </div>
                  <p className={`mt-4 text-xs font-bold uppercase tracking-[0.12em] ${accent.category}`}>
                    {article.category}
                  </p>
                  <h3 className="mt-2 text-lg font-bold leading-snug text-brand-black">
                    <Link href={article.href} className="hover:text-brand-green">
                      {article.title}
                    </Link>
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-muted">{article.excerpt}</p>
                  <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4">
                    <Link
                      href={article.href}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-green hover:underline"
                    >
                      Read guide
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                    <a
                      href={article.hmrcUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-muted hover:text-brand-green"
                    >
                      Official HMRC page
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="library-heading">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-green">Guide library</p>
            <h2 id="library-heading" className="mt-2 text-2xl font-bold text-brand-black">
              All MTD information on SelfSubmit
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">
              Short explainers covering the same topics as the homepage MTD information section. Use them as a
              directory, then confirm the official position on GOV.UK.
            </p>
          </div>
          <div className="mt-10 space-y-10">
            {GUIDE_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="text-lg font-bold text-brand-black">{group.title}</h3>
                <p className="mt-1 text-sm text-brand-muted">{group.description}</p>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {group.slugs.map((slug) => {
                    const block = getInfoBlockBySlug(slug);
                    if (!block) return null;
                    return (
                      <li key={slug}>
                        <Link
                          href={block.href}
                          className="flex h-full items-start justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 transition hover:border-brand-green/30 hover:bg-brand-mint/40"
                        >
                          <span>
                            <span className="block text-sm font-semibold text-brand-black">{block.title}</span>
                            <span className="mt-1 block text-xs leading-relaxed text-brand-muted line-clamp-2">
                              {block.summary}
                            </span>
                          </span>
                          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" aria-hidden />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            {leftoverGuides.length > 0 ? (
              <div>
                <h3 className="text-lg font-bold text-brand-black">More guides</h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {leftoverGuides.map((block) => (
                    <li key={block.slug}>
                      <Link
                        href={block.href}
                        className="flex h-full items-start justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 transition hover:border-brand-green/30 hover:bg-brand-mint/40"
                      >
                        <span>
                          <span className="block text-sm font-semibold text-brand-black">{block.title}</span>
                          <span className="mt-1 block text-xs leading-relaxed text-brand-muted line-clamp-2">
                            {block.summary}
                          </span>
                        </span>
                        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>

        <section aria-labelledby="tools-heading">
          <h2 id="tools-heading" className="text-2xl font-bold text-brand-black">
            Tools on SelfSubmit
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-muted">
            Use these when you are ready to keep records or want a rough estimate. They do not replace HMRC or an
            accountant.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Link
              href="/how-to-use"
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-brand-green/30"
            >
              <BookOpen className="h-5 w-5 text-brand-green" aria-hidden />
              <h3 className="mt-3 text-base font-bold text-brand-black">How to use SelfSubmit</h3>
              <p className="mt-2 text-sm text-brand-muted">Account, monthly records, receipts, then connect HMRC.</p>
            </Link>
            <Link
              href="/tax-calculator"
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-brand-green/30"
            >
              <FileSpreadsheet className="h-5 w-5 text-brand-green" aria-hidden />
              <h3 className="mt-3 text-base font-bold text-brand-black">Tax calculator</h3>
              <p className="mt-2 text-sm text-brand-muted">
                A planning estimate only. Compare with GOV.UK if you need a second view.
              </p>
            </Link>
            <Link
              href="/how-tax-due-works"
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-brand-green/30"
            >
              <CheckCircle2 className="h-5 w-5 text-brand-green" aria-hidden />
              <h3 className="mt-3 text-base font-bold text-brand-black">How tax due works</h3>
              <p className="mt-2 text-sm text-brand-muted">
                Where HMRC shows what you owe, and what SelfSubmit does and does not display.
              </p>
            </Link>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-brand-muted">
            Official pages:{" "}
            <a
              href={GOVUK_ESTIMATE_SA_BILL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-green hover:underline"
            >
              estimate your Self Assessment bill
            </a>
            ,{" "}
            <a
              href={GOVUK_MTD_COMPATIBLE_SOFTWARE_FINDER}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-green hover:underline"
            >
              find software for MTD
            </a>
            ,{" "}
            <a
              href={GOVUK_MTD_ITSA_HOW_TO_USE}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-green hover:underline"
            >
              using MTD for Income Tax
            </a>
            ,{" "}
            <a
              href={GOVUK_SELF_ASSESSMENT_DEADLINES}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-green hover:underline"
            >
              Self Assessment deadlines
            </a>
            ,{" "}
            <a
              href={GOVUK_REGISTER_SA}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-green hover:underline"
            >
              register for Self Assessment
            </a>
            .
          </p>
        </section>

        <aside className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-relaxed text-amber-950">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
          <p>
            SelfSubmit is Recognised by HMRC as Making Tax Digital software. These pages are general information, not
            personal tax advice, and they are not a GOV.UK publication. Confirm your obligations on GOV.UK or with a
            qualified adviser. SelfSubmit does not currently submit the final declaration.
          </p>
        </aside>
      </div>
    </SitePageShell>
  );
}
