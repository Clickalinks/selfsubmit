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
    "Steps to record income and expenses, upload receipts, connect HMRC, and submit quarterly updates with SelfSubmit.",
};

export default function HowItWorksPage() {
  return (
    <LegalPageShell
      title="How it works"
      description="SelfSubmit helps UK self-employed people capture each period’s income and expenses, keep receipts, and prepare Making Tax Digital quarterly updates."
      lastUpdated="9 July 2026"
    >
      <LegalCallout title="Your responsibility">
        <p>
          SelfSubmit helps you keep digital records and submit quarterly updates when your HMRC account is connected.
          You remain responsible for checking every figure before saving or submitting. See our{" "}
          <Link href="/disclaimer" className="font-semibold text-brand-green underline underline-offset-2">
            Disclaimer
          </Link>{" "}
          for limits on tax calculator estimates and professional advice.
        </p>
      </LegalCallout>

      <LegalH2 id="steps">Steps with SelfSubmit</LegalH2>
      <LegalOl>
        <li>
          <strong className="text-brand-black">Create an account</strong> and choose a subscription plan that matches
          how many businesses you run.
        </li>
        <li>
          <strong className="text-brand-black">Add your business</strong> and choose your trade so income and expense
          categories match how you work.
        </li>
        <li>
          <strong className="text-brand-black">Save monthly records</strong> — open the{" "}
          <Link href="/submit" className="text-brand-green underline underline-offset-2">
            monthly income &amp; expenses
          </Link>{" "}
          form, set the return period, and save each income and expense line.
        </li>
        <li>
          <strong className="text-brand-black">Upload receipts</strong> where you need evidence for expenses. Files
          are stored securely in your account.
        </li>
        <li>
          <strong className="text-brand-black">Connect HMRC</strong> from your dashboard, add your UTR and NI number,
          and link each business to the matching HMRC income source.
        </li>
        <li>
          <strong className="text-brand-black">Submit quarterly updates</strong> when your obligations are due —
          preview cumulative totals from your monthly records, then submit from your dashboard.
        </li>
      </LegalOl>

      <LegalH2 id="vehicle">Vehicle costs</LegalH2>
      <LegalP>
        Where your trade uses a vehicle, pick full (actual) costs or HMRC simplified mileage where allowed. Do not mix
        both methods for the same vehicle in the same period.
      </LegalP>

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
        Plans are priced by how many businesses you manage: Solo (£20/month for one), Business Plus (£36 for two),
        Professional (£52 for three), and Unlimited (£70 for four). Every plan includes the same core features. See{" "}
        <Link href="/pricing" className="text-brand-green underline underline-offset-2">
          pricing
        </Link>{" "}
        for full details.
      </LegalP>

      <LegalUl>
        <li>
          <Link href="/" className="text-brand-green underline underline-offset-2">
            Home
          </Link>
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
        <li>
          <Link href="/sign-up" className="text-brand-green underline underline-offset-2">
            Create account
          </Link>
        </li>
      </LegalUl>

      <LegalFooterNav />
    </LegalPageShell>
  );
}
