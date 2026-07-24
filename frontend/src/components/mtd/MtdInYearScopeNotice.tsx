import Link from "next/link";
import { ExternalLink } from "lucide-react";

import {
  GOVUK_MTD_COMPATIBLE_SOFTWARE_FINDER,
  GOVUK_PERSONAL_TAX_ACCOUNT,
} from "@/lib/govuk-mtd-links";

/**
 * HMRC Production checklist: in-year products must state clearly when Final Declaration
 * (and unsupported income sources) are not in-product, with a link to the software finder.
 */
export function MtdInYearScopeNotice({ className = "" }: { className?: string }) {
  return (
    <aside
      className={`rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700 sm:px-5 ${className}`}
      aria-labelledby="mtd-in-year-scope-heading"
    >
      <p id="mtd-in-year-scope-heading" className="font-semibold text-slate-900">
        What SelfSubmit covers today
      </p>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 leading-relaxed">
        <li>
          <strong className="text-slate-900">In-year MTD for Income Tax</strong> for{" "}
          <strong className="text-slate-900">self-employment</strong>: digital records, obligations, and
          cumulative quarterly updates to HMRC when your account is connected.
        </li>
        <li>
          SelfSubmit does <strong className="text-slate-900">not yet submit a Final Declaration</strong> or
          produce an official HMRC tax calculation. After year end, use your{" "}
          <a
            href={GOVUK_PERSONAL_TAX_ACCOUNT}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-semibold text-brand-green underline underline-offset-2 hover:text-brand-green-dark"
          >
            HMRC Personal Tax Account
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>{" "}
          or other{" "}
          <a
            href={GOVUK_MTD_COMPATIBLE_SOFTWARE_FINDER}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-semibold text-brand-green underline underline-offset-2 hover:text-brand-green-dark"
          >
            MTD-compatible software
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>{" "}
          that supports Final Declaration.
        </li>
        <li>
          <strong className="text-slate-900">UK property / foreign property</strong> MTD API filing is not
          included in this release. You can still keep records in SelfSubmit; for property MTD filing see the{" "}
          <a
            href={GOVUK_MTD_COMPATIBLE_SOFTWARE_FINDER}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-green underline underline-offset-2 hover:text-brand-green-dark"
          >
            GOV.UK software finder
          </a>
          .
        </li>
      </ul>
      <p className="mt-3 text-xs text-slate-500">
        More detail:{" "}
        <Link href="/how-tax-due-works" className="font-semibold text-brand-green hover:underline">
          How tax due works
        </Link>
        .
      </p>
    </aside>
  );
}
