import type { Metadata } from "next";
import Link from "next/link";

import { CompanyDetails } from "@/components/legal/CompanyDetails";
import { LegalFooterNav, LegalH2, LegalP, LegalPageShell } from "@/components/legal/LegalPageShell";
import { COMPANY } from "@/lib/company-details";

export const metadata: Metadata = {
  title: "Contact — SelfSubmit",
  description: "Contact SelfSubmit for product support, partnerships, or privacy queries.",
};

export default function ContactPage() {
  return (
    <LegalPageShell
      title="Contact"
      description="Reach the SelfSubmit team for help with your account, submissions, or data protection requests."
      lastUpdated="6 July 2026"
    >
      <LegalH2>Company details</LegalH2>
      <CompanyDetails />

      <LegalH2>General enquiries &amp; support</LegalH2>
      <LegalP>
        For help with your account, subscriptions, receipts, or submissions, email us at{" "}
        <a
          href={`mailto:${COMPANY.supportEmail}`}
          className="font-semibold text-brand-green underline underline-offset-2"
        >
          {COMPANY.supportEmail}
        </a>
        . We aim to respond within two working days.
      </LegalP>
      {COMPANY.phone ? (
        <LegalP>
          Phone:{" "}
          <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="text-brand-green underline underline-offset-2">
            {COMPANY.phone}
          </a>
        </LegalP>
      ) : (
        <LegalP>We do not publish a support phone line at this time — please use email.</LegalP>
      )}

      <LegalH2>Privacy &amp; data rights</LegalH2>
      <LegalP>
        For requests about personal data (access, correction, erasure, objection), email{" "}
        <a
          href={`mailto:${COMPANY.supportEmail}`}
          className="font-semibold text-brand-green underline underline-offset-2"
        >
          {COMPANY.supportEmail}
        </a>{" "}
        with the subject line &ldquo;Data protection request&rdquo;, or see our{" "}
        <Link href="/privacy" className="text-brand-green underline underline-offset-2">
          Privacy policy
        </Link>{" "}
        and{" "}
        <Link href="/gdpr" className="text-brand-green underline underline-offset-2">
          GDPR &amp; data protection
        </Link>{" "}
        pages.
      </LegalP>

      <LegalFooterNav />
    </LegalPageShell>
  );
}
