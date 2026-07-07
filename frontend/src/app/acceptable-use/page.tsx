import type { Metadata } from "next";
import Link from "next/link";

import { PolicyContactEmail, PolicyRelatedLinks } from "@/components/legal/PolicyHelpers";
import {
  LegalCallout,
  LegalFooterNav,
  LegalH2,
  LegalP,
  LegalPageShell,
  LegalUl,
} from "@/components/legal/LegalPageShell";
import { COMPANY } from "@/lib/company-details";

export const metadata: Metadata = {
  title: "Acceptable use policy — SelfSubmit",
  description:
    "Rules for using SelfSubmit lawfully and responsibly, including HMRC submissions, account security, and prohibited conduct.",
};

export default function AcceptableUsePage() {
  return (
    <LegalPageShell
      title="Acceptable use policy"
      description="This policy sets out how you may use SelfSubmit. It forms part of our Terms of use."
      lastUpdated="6 July 2026"
    >
      <LegalH2 id="scope">1. Scope</LegalH2>
      <LegalP>
        This policy applies to all users of selfsubmit.co.uk and the SelfSubmit application, including trial and paid
        accounts. Breach may result in suspension or termination under our{" "}
        <Link href="/terms" className="text-brand-green underline underline-offset-2">
          Terms of use
        </Link>
        .
      </LegalP>

      <LegalH2 id="permitted">2. Permitted use</LegalH2>
      <LegalP>You may use SelfSubmit to:</LegalP>
      <LegalUl>
        <li>Keep digital records for your own UK self-employment or rental income</li>
        <li>Prepare and submit MTD quarterly updates and related declarations where the feature is available</li>
        <li>Store receipts and supporting documents linked to your records</li>
        <li>Export or share your data with your accountant where you choose</li>
      </LegalUl>

      <LegalH2 id="prohibited">3. Prohibited conduct</LegalH2>
      <LegalP>You must not:</LegalP>
      <LegalUl>
        <li>Submit false, misleading, or fraudulent information to HMRC or through SelfSubmit</li>
        <li>Use the service to facilitate tax evasion, money laundering, or other financial crime</li>
        <li>Access or attempt to access another person&apos;s account or data without authority</li>
        <li>Probe, scan, or test vulnerabilities except through our responsible disclosure programme</li>
        <li>Introduce malware, spam, or harmful code</li>
        <li>Scrape, crawl, or overload the service in a way that harms availability</li>
        <li>Reverse engineer the service except where law permits and we cannot restrict it</li>
        <li>Impersonate {COMPANY.legalName}, HMRC, or any other person or organisation</li>
        <li>Resell or sublicense the service without our written agreement</li>
        <li>Use the service for any unlawful purpose under the laws of England and Wales</li>
      </LegalUl>

      <LegalH2 id="hmrc">4. HMRC and tax integrity</LegalH2>
      <LegalP>
        You are responsible for the accuracy of figures you submit. SelfSubmit is a tool — it does not replace your
        obligation to keep correct records and meet HMRC deadlines. See our{" "}
        <Link href="/anti-fraud" className="text-brand-green underline underline-offset-2">
          Anti-fraud policy
        </Link>{" "}
        and{" "}
        <Link href="/disclaimer" className="text-brand-green underline underline-offset-2">
          Disclaimer
        </Link>
        .
      </LegalP>

      <LegalH2 id="security">5. Account security</LegalH2>
      <LegalP>
        Keep credentials confidential, use multi-factor authentication where offered, and notify us promptly if you
        suspect unauthorised access. See{" "}
        <Link href="/security" className="text-brand-green underline underline-offset-2">
          Security
        </Link>
        .
      </LegalP>

      <LegalH2 id="enforcement">6. Enforcement</LegalH2>
      <LegalP>
        We may investigate suspected breaches, suspend access, terminate accounts, and report serious matters to HMRC,
        law enforcement, or regulators where required or appropriate.
      </LegalP>

      <LegalH2 id="contact">7. Contact</LegalH2>
      <LegalP>
        Questions about this policy: <PolicyContactEmail subject="Acceptable use enquiry" />.
      </LegalP>

      <LegalCallout title="Related policies">
        <PolicyRelatedLinks
          links={[
            { href: "/terms", label: "Terms of use" },
            { href: "/anti-fraud", label: "Anti-fraud policy" },
            { href: "/privacy", label: "Privacy policy" },
          ]}
        />
      </LegalCallout>

      <LegalFooterNav currentPolicyHref="/acceptable-use" />
    </LegalPageShell>
  );
}
