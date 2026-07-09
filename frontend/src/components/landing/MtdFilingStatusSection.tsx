import Link from "next/link";

import { MTD_PLATFORM_FEATURES } from "@/lib/hmrc-filing-status";

const STATUS_STYLES = {
  live: "bg-emerald-100 text-emerald-800",
  in_development: "bg-emerald-100 text-emerald-800",
  planned: "bg-slate-100 text-slate-700",
} as const;

const STATUS_LABELS = {
  live: "Available",
  in_development: "Available",
  planned: "Planned",
} as const;

export function MtdFilingStatusSection() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-bold text-brand-black sm:text-2xl">What SelfSubmit includes</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-brand-muted sm:text-base">
        SelfSubmit is a subscription service for UK self-employed record-keeping and Making Tax Digital quarterly
        updates. Every plan includes the same core tools — you only pay more when you need additional businesses.
      </p>
      <ul className="mt-6 space-y-4">
        {MTD_PLATFORM_FEATURES.map((item) => (
          <li
            key={item.label}
            className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
          >
            <div>
              <p className="font-semibold text-brand-black">{item.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-brand-muted">{item.detail}</p>
            </div>
            <span
              className={`inline-flex w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[item.status]}`}
            >
              {STATUS_LABELS[item.status]}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-brand-muted">
        Confirm your MTD obligations on{" "}
        <a
          href="https://www.gov.uk/guidance/making-tax-digital-for-income-tax"
          className="font-semibold text-brand-green underline-offset-2 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          GOV.UK
        </a>
        . Questions?{" "}
        <Link href="/contact" className="font-semibold text-brand-green underline-offset-2 hover:underline">
          Contact us
        </Link>
        .
      </p>
    </section>
  );
}
