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
    "How MTD quarterly updates and the final declaration relate to HMRC tax calculations, and where taxpayers view amounts due.",
};

export default function HowTaxDueWorksPage() {
  return (
    <LegalPageShell
      title="How tax due works"
      description="Overview of quarterly updates, the final declaration, and where HMRC displays tax due and payment dates."
      lastUpdated="20 July 2026"
    >
      <LegalCallout title="Summary">
        <p>
          SelfSubmit supports digital record-keeping and Making Tax Digital (MTD) update submissions.{" "}
          <strong className="text-brand-black">HMRC calculates tax liability</strong> and presents it in your{" "}
          <strong className="text-brand-black">HMRC Personal Tax Account</strong>. SelfSubmit does not currently display
          HMRC’s official tax calculation or balance to pay.
        </p>
      </LegalCallout>

      <LegalH2 id="journey">1. The MTD reporting cycle</LegalH2>
      <LegalOl>
        <li>
          <strong className="text-brand-black">During the tax year — quarterly updates</strong>
          <br />
          You submit digital summaries of business income and expenses to HMRC (from SelfSubmit records when filing is
          enabled). These update HMRC during the year. They are not normally a full annual tax liability for each
          quarter.
        </li>
        <li>
          <strong className="text-brand-black">Year end — final declaration</strong>
          <br />
          You confirm the full year’s figures (comparable to completing Self Assessment). HMRC then produces a{" "}
          <strong className="text-brand-black">tax calculation</strong> from the information submitted and other data
          held (for example PAYE).
        </li>
        <li>
          <strong className="text-brand-black">Payment</strong>
          <br />
          Pay the amounts shown in your HMRC account by the stated due dates. Many taxpayers also make{" "}
          <strong className="text-brand-black">payments on account</strong> (commonly 31 January and 31 July) under Self
          Assessment rules.
        </li>
      </LegalOl>

      <LegalH2 id="where">2. Where tax due is shown</LegalH2>
      <LegalUl>
        <li>
          <strong className="text-brand-black">HMRC online (primary source)</strong> — Your Personal Tax Account / Self
          Assessment service shows the tax calculation, balance, and payment dates. Access via{" "}
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
          <strong className="text-brand-black">HMRC correspondence</strong> — You may receive online messages or postal
          notices. Treat the online tax calculation as authoritative.
        </li>
        <li>
          <strong className="text-brand-black">SelfSubmit</strong> — Use SelfSubmit for digital records, receipts,
          deadlines, and MTD update submissions. The{" "}
          <Link href="/tax-calculator" className="text-brand-green underline underline-offset-2">
            tax calculator
          </Link>{" "}
          provides an <em>indicative estimate</em> only and is not HMRC’s official liability.
        </li>
      </LegalUl>

      <LegalH2 id="selfsubmit">3. SelfSubmit scope</LegalH2>
      <LegalP>
        <strong className="text-brand-black">Included:</strong> recording income and expenses, storing receipts,
        tracking obligations, and submitting MTD <em>in-year</em> quarterly updates for self-employment when your HMRC
        connection and product settings allow.
      </LegalP>
      <LegalP>
        <strong className="text-brand-black">Not included yet:</strong> submitting a Final Declaration from SelfSubmit,
        UK property / foreign property MTD API filing, or replacing HMRC’s official tax calculation or payment interface.
        For Final Declaration and other MTD-compatible products, see{" "}
        <a
          href="https://www.gov.uk/guidance/find-software-thats-compatible-with-making-tax-digital-for-income-tax"
          className="text-brand-green underline underline-offset-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          GOV.UK — find MTD-compatible software
        </a>
        . The amount payable remains the figure shown in your HMRC Personal Tax Account.
      </LegalP>

      <LegalH2 id="tips">4. Recommended practice</LegalH2>
      <LegalUl>
        <li>Maintain monthly records in SelfSubmit so quarterly totals are available when due.</li>
        <li>After the final declaration, review the tax calculation in your HMRC account before paying.</li>
        <li>Diary both submission deadlines and typical payment dates (January / July where applicable).</li>
        <li>
          If figures appear incorrect, correct your records and contact HMRC or a qualified accountant. Do not leave
          discrepancies unresolved.
        </li>
      </LegalUl>

      <LegalH2 id="disclaimer">5. Disclaimer</LegalH2>
      <LegalP>
        Tax rules change. This page is general information, not personal tax advice. You remain responsible for accurate
        figures and timely payments. See our{" "}
        <Link href="/disclaimer" className="text-brand-green underline underline-offset-2">
          Disclaimer
        </Link>{" "}
        and confirm current rules on GOV.UK.
      </LegalP>

      <LegalUl>
        <li>
          <Link href="/how-it-works" className="text-brand-green underline underline-offset-2">
            How SelfSubmit works
          </Link>
        </li>
        <li>
          <Link href="/dashboard" className="text-brand-green underline underline-offset-2">
            Dashboard
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
