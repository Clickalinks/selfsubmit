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
  title: "How tax due works — SelfSubmit",
  description:
    "Where to see how much tax you owe after MTD quarterly updates and your final declaration — SelfSubmit vs HMRC.",
};

export default function HowTaxDueWorksPage() {
  return (
    <LegalPageShell
      title="How tax due works"
      description="A plain-English guide to quarterly updates, your final declaration, and where HMRC shows what you need to pay."
      lastUpdated="20 July 2026"
    >
      <LegalCallout title="Quick answer">
        <p>
          SelfSubmit helps you keep records and send Making Tax Digital (MTD) updates.{" "}
          <strong className="text-brand-black">HMRC calculates what you owe</strong> and shows it in your{" "}
          <strong className="text-brand-black">HMRC Personal Tax Account</strong> (online). We do not currently show
          your official tax bill inside SelfSubmit.
        </p>
      </LegalCallout>

      <LegalH2 id="journey">1. Your year in three stages</LegalH2>
      <LegalOl>
        <li>
          <strong className="text-brand-black">Through the year — quarterly updates</strong>
          <br />
          You send HMRC digital summaries of business income and expenses (from your SelfSubmit records when filing is
          enabled). These keep HMRC up to date. They are <em>not</em> usually a full “final tax bill for the year” each
          quarter.
        </li>
        <li>
          <strong className="text-brand-black">End of year — final declaration</strong>
          <br />
          You confirm the full year’s figures (similar to finishing Self Assessment). HMRC then produces a{" "}
          <strong className="text-brand-black">tax calculation</strong> from what you submitted and other information
          they hold (for example PAYE).
        </li>
        <li>
          <strong className="text-brand-black">Pay HMRC</strong>
          <br />
          Use the amount and dates shown in your HMRC account. Many people also have{" "}
          <strong className="text-brand-black">payments on account</strong> (often 31 January and 31 July) under normal
          Self Assessment rules.
        </li>
      </LegalOl>

      <LegalH2 id="where">2. Where should you look for “how much do I owe?”</LegalH2>
      <LegalUl>
        <li>
          <strong className="text-brand-black">HMRC online (main place)</strong> — Personal Tax Account / Self Assessment
          shows your tax calculation, balance, and payment dates. Start at{" "}
          <a
            href="https://www.gov.uk/log-in-register-hmrc-online-services"
            className="text-brand-green underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            GOV.UK HMRC online services
          </a>
          .
        </li>
        <li>
          <strong className="text-brand-black">HMRC messages or post</strong> — you may get notices or reminders.
          Always check the online calculation as well.
        </li>
        <li>
          <strong className="text-brand-black">SelfSubmit</strong> — use this for digital records, receipts, deadlines,
          and submitting updates. Our{" "}
          <Link href="/tax-calculator" className="text-brand-green underline underline-offset-2">
            tax calculator
          </Link>{" "}
          can give a <em>rough estimate</em> only — it is not your official HMRC bill.
        </li>
      </LegalUl>

      <LegalH2 id="selfsubmit">3. What SelfSubmit does (and does not do)</LegalH2>
      <LegalP>
        <strong className="text-brand-black">Does:</strong> help you record income and expenses, store receipts, track
        obligations, and submit MTD updates when your HMRC connection and product settings allow.
      </LegalP>
      <LegalP>
        <strong className="text-brand-black">Does not (yet):</strong> replace HMRC’s official tax calculation or payment
        screen. Putting everything in one app can feel nicer later; for accuracy and trust, the amount to pay still
        comes from HMRC.
      </LegalP>

      <LegalH2 id="tips">4. Practical tips</LegalH2>
      <LegalUl>
        <li>Keep monthly records in SelfSubmit so quarterly totals are ready when due.</li>
        <li>After your final declaration, open your HMRC account and review the tax calculation before paying.</li>
        <li>Set reminders for submission deadlines <em>and</em> typical payment dates (January / July where they apply).</li>
        <li>If figures look wrong, fix your records and speak to HMRC or a qualified accountant — do not ignore a mismatch.</li>
      </LegalUl>

      <LegalH2 id="disclaimer">5. Important</LegalH2>
      <LegalP>
        Tax rules change. This page is general guidance, not personal tax advice. You remain responsible for correct
        figures and on-time payments. See our{" "}
        <Link href="/disclaimer" className="text-brand-green underline underline-offset-2">
          Disclaimer
        </Link>{" "}
        and confirm details on GOV.UK.
      </LegalP>

      <LegalUl>
        <li>
          <Link href="/how-it-works" className="text-brand-green underline underline-offset-2">
            How SelfSubmit works
          </Link>
        </li>
        <li>
          <Link href="/dashboard" className="text-brand-green underline underline-offset-2">
            Your dashboard
          </Link>
        </li>
        <li>
          <Link href="/tax-calculator" className="text-brand-green underline underline-offset-2">
            Tax calculator (estimate)
          </Link>
        </li>
        <li>
          <Link href="/faq" className="text-brand-green underline underline-offset-2">
            FAQ
          </Link>
        </li>
      </LegalUl>

      <LegalFooterNav />
    </LegalPageShell>
  );
}
