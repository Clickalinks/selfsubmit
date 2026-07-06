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
  title: "Data retention policy — SelfSubmit",
  description:
    "How long SelfSubmit keeps account data, tax records, receipts, and logs, including HMRC six-year expectations.",
};

export default function DataRetentionPage() {
  return (
    <LegalPageShell
      title="Data retention policy"
      description="This policy explains how long we keep different categories of data and when we delete or anonymise them."
      lastUpdated="6 July 2026"
    >
      <LegalCallout title="Data controller">
        <CompanyDetails />
      </LegalCallout>

      <LegalH2 id="principle">1. Principle</LegalH2>
      <LegalP>
        We keep personal and business data only as long as necessary for the purposes described in our{" "}
        <Link href="/privacy" className="text-brand-green underline underline-offset-2">
          Privacy policy
        </Link>
        , or as required by law — whichever is longer where the law demands retention.
      </LegalP>

      <LegalH2 id="tax-records">2. Tax and business records</LegalH2>
      <LegalP>
        HMRC generally expects self-employed people to keep records for at least <strong>five years</strong> after the 31
        January submission deadline of the relevant tax year (often described as six tax years in practice). While your
        subscription is active, we store submissions, figures, and uploaded receipts so you can meet those obligations.
      </LegalP>
      <LegalP>
        If you cancel, we may retain your business records for a grace period so you can export them, then delete or
        anonymise them unless we must keep them longer for legal, accounting, or dispute resolution reasons.
      </LegalP>

      <LegalH2 id="account">3. Account and profile data</LegalH2>
      <LegalUl>
        <li>
          <strong className="text-brand-black">Active accounts:</strong> retained while your account exists and the
          service is used.
        </li>
        <li>
          <strong className="text-brand-black">Closed accounts:</strong> deleted or anonymised within a reasonable period
          after closure, except data we must retain (see below).
        </li>
        <li>
          <strong className="text-brand-black">Billing records:</strong> kept as required for tax, accounting, and
          anti-fraud purposes (typically up to six years for UK companies).
        </li>
      </LegalUl>

      <LegalH2 id="documents">4. Receipts and uploads</LegalH2>
      <LegalP>
        Receipt images and documents are stored in your account while active. Deleting an expense line or account may
        remove linked files subject to backup cycles. Export copies you need before deletion.
      </LegalP>

      <LegalH2 id="logs">5. Security and technical logs</LegalH2>
      <LegalP>
        Server, authentication, and security logs are kept for shorter periods (often 30–90 days, sometimes longer if
        investigating an incident) unless a longer period is needed for security or legal reasons.
      </LegalP>

      <LegalH2 id="support">6. Support communications</LegalH2>
      <LegalP>
        Emails and support tickets are retained long enough to resolve your enquiry and improve service quality, then
        deleted or anonymised unless linked to a legal claim or regulatory matter.
      </LegalP>

      <LegalH2 id="rights">7. Your rights</LegalH2>
      <LegalP>
        You may request erasure under UK GDPR where applicable, but we may refuse or limit deletion where we have a
        lawful basis to retain data (for example legal obligation or establishment of legal claims). See our{" "}
        <Link href="/gdpr" className="text-brand-green underline underline-offset-2">
          GDPR &amp; data protection
        </Link>{" "}
        page and email <PolicyContactEmail subject="Data retention enquiry" />.
      </LegalP>

      <LegalH2 id="backups">8. Backups</LegalH2>
      <LegalP>
        Deleted data may persist in encrypted backups for a limited time before being overwritten. Backups are not used
        to restore deleted accounts except where required for disaster recovery involving active customers.
      </LegalP>

      <LegalFooterNav currentPolicyHref="/data-retention" />
    </LegalPageShell>
  );
}
