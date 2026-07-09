import type { Metadata } from "next";
import Link from "next/link";

import {
  LegalCallout,
  LegalFooterNav,
  LegalH2,
  LegalP,
  LegalPageShell,
  LegalUl,
} from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Disclaimer — SelfSubmit",
  description:
    "Important limitations on tax calculator estimates, HMRC submissions, and professional advice when using SelfSubmit.",
};

export default function DisclaimerPage() {
  return (
    <LegalPageShell
      title="Disclaimer &amp; accuracy"
      description="Use this page to understand what SelfSubmit provides, what remains your responsibility, and where you must verify with HMRC or a professional."
      lastUpdated="9 July 2026"
    >
      <LegalCallout title="Not tax, legal, or financial advice">
        <p>
          Nothing on this website is professional advice. Tax, National Insurance, VAT, company law, and employment
          status depend on your facts. Always confirm with{" "}
          <a
            href="https://www.gov.uk"
            className="font-semibold text-brand-green underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            GOV.UK
          </a>{" "}
          or a qualified accountant or tax adviser.
        </p>
      </LegalCallout>

      <LegalH2 id="service">What SelfSubmit provides</LegalH2>
      <LegalUl>
        <li>
          <strong className="text-brand-black">Record-keeping tools</strong> for UK self-employed income, expenses,
          receipts, and monthly periods.
        </li>
        <li>
          <strong className="text-brand-black">HMRC connection features</strong> so you can link your account, view
          obligations, and submit quarterly updates when enabled for your account.
        </li>
        <li>
          <strong className="text-brand-black">HMRC references we surface</strong> (for example simplified mileage
          pence-per-mile) are copied from official HMRC material to help you find the same numbers you would use on
          GOV.UK. Rates and rules change; always cross-check the live HMRC page.
        </li>
      </LegalUl>

      <LegalH2 id="estimates">Tax calculator estimates</LegalH2>
      <LegalUl>
        <li>
          <strong className="text-brand-black">Tax calculator outputs</strong> are estimates using simplified bands and
          assumptions (see the calculator footer). They are <strong className="text-brand-black">not</strong> a Self
          Assessment calculation and do not include every adjustment (loss relief, PA taper, pensions in full
          complexity, student loans in all cases, etc.).
        </li>
        <li>
          Use the calculator for planning only. Before filing, confirm figures with GOV.UK, HMRC, or your accountant.
        </li>
      </LegalUl>

      <LegalH2 id="submissions">Monthly records and HMRC submissions</LegalH2>
      <LegalUl>
        <li>
          <strong className="text-brand-black">Monthly records</strong> saved in SelfSubmit are stored in your account
          and appear in your submission history. They support your MTD record-keeping obligations.
        </li>
        <li>
          <strong className="text-brand-black">Quarterly HMRC updates</strong> are only sent when you connect your HMRC
          account and complete a submission from your dashboard. Always review preview figures before submitting.
        </li>
        <li>
          You remain responsible for the accuracy of every figure you save or submit.
        </li>
      </LegalUl>

      <LegalH2 id="records">Your records</LegalH2>
      <LegalP>
        You remain responsible for keeping adequate business records under HMRC rules. SelfSubmit does not replace your
        statutory duties.
      </LegalP>

      <LegalH2 id="links">Third-party links</LegalH2>
      <LegalP>
        We may link to GOV.UK, ICO, or other official sites. We are not responsible for their content or availability.
      </LegalP>

      <LegalH2 id="liability">Liability</LegalH2>
      <LegalP>
        To the extent permitted by law, SelfSubmit and its operators exclude liability for loss arising from reliance on
        estimates or out-of-date information on this site. Our{" "}
        <Link href="/terms" className="text-brand-green underline underline-offset-2">
          Terms of use
        </Link>{" "}
        set out the full legal position for the service.
      </LegalP>

      <LegalFooterNav />
    </LegalPageShell>
  );
}
