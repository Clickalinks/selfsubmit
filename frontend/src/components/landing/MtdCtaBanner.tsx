import Link from "next/link";
import { Check } from "lucide-react";

/** Current GOV.UK MTD ITSA hub (older /guidance/making-tax-digital-for-income-tax paths return 404). */
const GOV_UK_MTD_OVERVIEW =
  "https://www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-businesses-step-by-step";

const MTD_POINTS = [
  "Maintain digital records of business income and expenses throughout the year.",
  "Submit quarterly updates to HMRC when Making Tax Digital for Income Tax applies.",
  "Complete your final declaration via HMRC or MTD-compatible year-end software by Self Assessment deadlines.",
] as const;

export function MtdCtaBanner() {
  return (
    <section className="relative w-full bg-[#1a1d1f]" aria-label="Get started">
      <div className="relative w-full overflow-hidden sm:min-h-[360px]">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-ink via-[#0f1214] to-brand-forest" />

        <div className="relative grid gap-8 px-4 py-10 sm:gap-10 sm:px-12 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-14 lg:py-20">
          <div className="text-center lg:text-left">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-green/20 ring-1 ring-brand-green/40 lg:mx-0">
              <Check className="h-8 w-8 text-brand-green" strokeWidth={2.5} />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl">Prepare for Making Tax Digital</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base lg:mx-0">
              Eligible sole traders and landlords must keep digital records and report through compatible software.
              SelfSubmit provides structured monthly income and expense recording to support that process.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start">
              <Link
                href="/sign-up"
                className="inline-flex w-full max-w-xs items-center justify-center rounded-xl bg-brand-green px-8 py-3.5 text-sm font-bold text-white shadow-btn-green transition hover:bg-brand-green-dark sm:w-auto sm:text-base"
              >
                Get started for free
              </Link>
              <Link
                href="/blog"
                className="inline-flex w-full max-w-xs items-center justify-center rounded-xl border-2 border-white/80 bg-transparent px-8 py-3.5 text-sm font-bold text-white transition hover:bg-white/15 sm:w-auto sm:text-base"
              >
                View MTD guides
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-green">What MTD involves</p>
            <ul className="mt-4 space-y-4">
              {MTD_POINTS.map((text) => (
                <li key={text} className="flex gap-3 text-left">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" aria-hidden />
                  <span className="text-sm leading-relaxed text-slate-100">{text}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-relaxed text-slate-400">
              Thresholds and start dates are set by HMRC. For official eligibility details, see{" "}
              <a
                href={GOV_UK_MTD_OVERVIEW}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-green hover:underline"
              >
                GOV.UK Making Tax Digital for Income Tax
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
