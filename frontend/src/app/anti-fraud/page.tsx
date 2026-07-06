import type { Metadata } from "next";
import Link from "next/link";

import { CompanyDetails } from "@/components/legal/CompanyDetails";
import { PolicyContactEmail } from "@/components/legal/PolicyHelpers";
import {
  LegalCallout,
  LegalFooterNav,
  LegalH2,
  LegalP,
  LegalPageShell,
  LegalUl,
} from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Anti-fraud policy — SelfSubmit",
  description:
    "SelfSubmit's zero-tolerance approach to tax fraud, identity abuse, and financial crime on the platform.",
};

export default function AntiFraudPage() {
  return (
    <LegalPageShell
      title="Anti-fraud policy"
      description="We take fraud seriously. This policy explains our expectations and how we respond to suspected abuse."
      lastUpdated="6 July 2026"
    >
      <LegalCallout title="Operator">
        <CompanyDetails />
      </LegalCallout>

      <LegalH2 id="commitment">1. Our commitment</LegalH2>
      <LegalP>
        SelfSubmit exists to help honest self-employed people and landlords meet their tax obligations. We do not
        tolerate use of the platform to evade tax, launder money, or deceive HMRC or other users.
      </LegalP>

      <LegalH2 id="prohibited">2. Prohibited activity</LegalH2>
      <LegalP>Examples include:</LegalP>
      <LegalUl>
        <li>Submitting false income, expenses, or supporting documents to HMRC</li>
        <li>Creating accounts with stolen identities or payment details</li>
        <li>Structuring records to conceal taxable income</li>
        <li>Abusing free trials, refunds, or promotions</li>
        <li>Coordinated attempts to bypass security or submission controls</li>
      </LegalUl>

      <LegalH2 id="your-duty">3. Your duty</LegalH2>
      <LegalP>
        You must enter accurate figures and keep genuine records. You are legally responsible for your tax position.
        SelfSubmit does not verify every receipt or figure — you must not rely on the tool to legitimise dishonest
        claims.
      </LegalP>

      <LegalH2 id="detection">4. Detection and prevention</LegalH2>
      <LegalP>We may use technical, behavioural, and manual review measures including:</LegalP>
      <LegalUl>
        <li>Login and payment fraud monitoring</li>
        <li>Account verification and rate limits</li>
        <li>Investigation of unusual submission patterns or abuse reports</li>
        <li>Suspension pending review where risk is identified</li>
      </LegalUl>

      <LegalH2 id="response">5. Our response</LegalH2>
      <LegalP>If we reasonably suspect fraud or serious breach of our Acceptable use policy, we may:</LegalP>
      <LegalUl>
        <li>Suspend or terminate accounts without refund where permitted by law</li>
        <li>Preserve evidence and cooperate with HMRC, banks, or law enforcement</li>
        <li>Report activity to the National Crime Agency or Action Fraud where appropriate</li>
      </LegalUl>

      <LegalH2 id="report">6. Report suspected fraud</LegalH2>
      <LegalP>
        If you believe someone is misusing SelfSubmit, email <PolicyContactEmail subject="Fraud report" /> with as much
        detail as you can safely provide. For HMRC tax fraud, you may also use HMRC&apos;s own reporting channels on
        GOV.UK.
      </LegalP>

      <LegalCallout title="Related policies">
        <p className="text-sm leading-relaxed">
          <Link href="/acceptable-use" className="font-semibold text-brand-green underline underline-offset-2">
            Acceptable use policy
          </Link>
          ,{" "}
          <Link href="/terms" className="font-semibold text-brand-green underline underline-offset-2">
            Terms of use
          </Link>
          , and{" "}
          <Link href="/responsible-disclosure" className="font-semibold text-brand-green underline underline-offset-2">
            Responsible disclosure
          </Link>
          .
        </p>
      </LegalCallout>

      <LegalFooterNav currentPolicyHref="/anti-fraud" />
    </LegalPageShell>
  );
}
