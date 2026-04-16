import type { Metadata } from "next";
import Link from "next/link";

import {
  LegalCallout,
  LegalFooterNav,
  LegalH2,
  LegalOl,
  LegalP,
  LegalPageShell,
  LegalUl,
} from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "How it works — SelfSubmit",
  description:
    "Steps to record income and expenses, choose vehicle costing, and understand what happens when you submit on SelfSubmit.",
};

export default function HowItWorksPage() {
  return (
    <LegalPageShell
      title="How it works"
      description="SelfSubmit helps UK self-employed people capture a period’s income and expenses in one place, ready for your records or your accountant."
      lastUpdated="16 April 2026"
    >
      <LegalCallout title="Illustration vs real filing">
        <p>
          The monthly return screen is a <strong>demonstration</strong>: submitting logs to the browser console and
          does not send data to HMRC or store a legal return by itself. A production product would connect to your
          chosen filing route and your own backend. See also our{" "}
          <Link href="/disclaimer" className="font-semibold text-brand-green underline underline-offset-2">
            Disclaimer &amp; illustrative content
          </Link>{" "}
          page.
        </p>
      </LegalCallout>

      <LegalH2 id="steps">Steps on this site</LegalH2>
      <LegalOl>
        <li>
          <strong className="text-brand-black">Choose your trade</strong> on the home page or open the{" "}
          <Link href="/submit" className="text-brand-green underline underline-offset-2">
            monthly income &amp; expenses
          </Link>{" "}
          form with a profession pre-selected.
        </li>
        <li>
          <strong className="text-brand-black">Set the return period</strong> (from / up to dates) so every amount is
          tied to the correct window.
        </li>
        <li>
          <strong className="text-brand-black">Vehicle costs (if applicable):</strong> pick full (actual) costs or
          HMRC simplified mileage where allowed. Do not mix both for the same vehicle in the same period.
        </li>
        <li>
          <strong className="text-brand-black">Save each income line</strong>, then each expense line. Simplified
          mileage appears after income is complete.
        </li>
        <li>
          <strong className="text-brand-black">Review totals</strong> and submit when you are satisfied (demo only
          today).
        </li>
      </LegalOl>

      <LegalH2 id="calculator">Tax calculator</LegalH2>
      <LegalP>
        The{" "}
        <Link href="/tax-calculator" className="text-brand-green underline underline-offset-2">
          tax calculator
        </Link>{" "}
        gives a rough estimate using simplified rules. It is not a substitute for Self Assessment software, HMRC’s own
        tools, or professional advice.
      </LegalP>

      <LegalH2 id="official">Official guidance</LegalH2>
      <LegalP>
        Allowances, thresholds, and MTD rules change. Always confirm amounts and obligations on{" "}
        <a href="https://www.gov.uk" className="text-brand-green underline underline-offset-2" target="_blank" rel="noopener noreferrer">
          GOV.UK
        </a>{" "}
        or with a qualified accountant.
      </LegalP>

      <LegalH2 id="pricing">Pricing</LegalH2>
      <LegalP>
        The home page shows <strong className="text-brand-black">subscription tiers by income streams</strong> (Starter
        £8 for one stream, Standard £15 for 2–3, Pro £22 for 4+) — aligned with tracking multiple sources of income
        under MTD. Figures are illustrative until billing goes live; features and caps may change.
      </LegalP>

      <LegalUl>
        <li>
          <Link href="/" className="text-brand-green underline underline-offset-2">
            Home
          </Link>{" "}
          — choose a profession; the short three-step strip is still on the home page under{" "}
          <Link href="/#how-it-works" className="text-brand-green underline underline-offset-2">
            #how-it-works
          </Link>
          .
        </li>
        <li>
          <Link href="/submit" className="text-brand-green underline underline-offset-2">
            Monthly form
          </Link>
        </li>
        <li>
          <Link href="/tax-calculator" className="text-brand-green underline underline-offset-2">
            Tax calculator
          </Link>
        </li>
      </LegalUl>

      <LegalFooterNav />
    </LegalPageShell>
  );
}
