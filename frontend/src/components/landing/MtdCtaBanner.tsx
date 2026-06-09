import Link from "next/link";
import { Check, ExternalLink } from "lucide-react";

const HMRC_POINTS = [
  {
    text: "Keep digital records of income and expenses as you go.",
    href: "https://www.gov.uk/guidance/making-tax-digital-for-income-tax/keep-digital-records",
  },
  {
    text: "Send quarterly updates to HMRC during the tax year (MTD for Income Tax).",
    href: "https://www.gov.uk/guidance/making-tax-digital-for-income-tax/send-updates-to-hmrc",
  },
  {
    text: "Complete your final declaration and pay tax by Self Assessment deadlines.",
    href: "https://www.gov.uk/self-assessment-tax-returns/deadlines",
  },
] as const;

export function MtdCtaBanner() {
  return (
    <section
      className="relative w-full bg-[#1a1d1f]"
      aria-label="Get started"
    >
      <div className="relative w-full overflow-hidden sm:min-h-[360px]">
        {/* Solid dark panel — no light hero image behind white text */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-ink via-[#0f1214] to-brand-forest" />

        <div className="relative grid gap-8 px-4 py-10 sm:gap-10 sm:px-12 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-14 lg:py-20">
          <div className="text-center lg:text-left">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-green/20 ring-1 ring-brand-green/40 lg:mx-0">
              <Check className="h-8 w-8 text-brand-green" strokeWidth={2.5} />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl">Get MTD ready today</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base lg:mx-0">
              HMRC requires eligible self-employed people and landlords to keep digital records and report through
              compatible software. SelfSubmit helps you organise income and expenses — always confirm your obligations on{" "}
              <a
                href="https://www.gov.uk/guidance/making-tax-digital-for-income-tax"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-green underline underline-offset-2 hover:text-brand-green-bright"
              >
                GOV.UK
              </a>
              .
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start">
              <Link
                href="/sign-up"
                className="inline-flex w-full max-w-xs items-center justify-center rounded-xl bg-brand-green px-8 py-3.5 text-sm font-bold text-white shadow-btn-green transition hover:bg-brand-green-dark sm:w-auto sm:text-base"
              >
                Get started for free
              </Link>
              <Link
                href="/mtd"
                className="inline-flex w-full max-w-xs items-center justify-center rounded-xl border-2 border-white/80 bg-transparent px-8 py-3.5 text-sm font-bold text-white transition hover:bg-white/15 sm:w-auto sm:text-base"
              >
                Browse MTD guides
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-green">From HMRC guidance</p>
            <ul className="mt-4 space-y-4">
              {HMRC_POINTS.map((point) => (
                <li key={point.href} className="flex gap-3 text-left">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" aria-hidden />
                  <a
                    href={point.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-1.5 text-sm leading-relaxed text-slate-100 underline-offset-2 hover:text-white hover:underline"
                  >
                    {point.text}
                    <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-relaxed text-slate-400">
              Income thresholds and start dates are set by HMRC — see{" "}
              <a
                href="https://www.gov.uk/guidance/making-tax-digital-for-income-tax/if-you-need-to-follow-the-rules"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-green hover:underline"
              >
                who must follow the rules
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
