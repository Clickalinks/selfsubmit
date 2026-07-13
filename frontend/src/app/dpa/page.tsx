import type { Metadata } from "next";
import Link from "next/link";

import { DataControllerCallout, PolicyContactEmail, PolicyRelatedLinks } from "@/components/legal/PolicyHelpers";
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
  title: "Data processing agreement — SelfSubmit",
  description:
    "How SelfSubmit acts as data processor for business customers and subprocessors we use to deliver the service.",
};

export default function DpaPage() {
  return (
    <LegalPageShell
      title="Data processing agreement (DPA)"
      description="This page summarises how we process personal data on behalf of customers and the subprocessors we use. It supplements our Privacy policy and GDPR overview."
      lastUpdated="13 July 2026"
    >
      <DataControllerCallout>
        <p>
          For end users who sign up directly, {COMPANY.legalName} is usually the <strong>data controller</strong>. Where
          a partner organisation uses SelfSubmit to process personal data on its own clients&apos; instructions, that
          organisation may be the controller and we act as a <strong>processor</strong> under UK GDPR Article 28.
        </p>
      </DataControllerCallout>

      <LegalH2 id="when">1. When a DPA applies</LegalH2>
      <LegalP>A formal DPA is relevant when:</LegalP>
      <LegalUl>
        <li>An accountant, bookkeeper, or agency uses SelfSubmit to handle client personal data on their instructions</li>
        <li>You need a signed Article 28 contract for your own compliance programme</li>
        <li>A corporate customer requires processor terms before rollout</li>
      </LegalUl>
      <LegalP>
        Individual self-employed subscribers using SelfSubmit for their own records generally rely on our{" "}
        <Link href="/privacy" className="text-brand-green underline underline-offset-2">
          Privacy policy
        </Link>{" "}
        rather than a separate DPA.
      </LegalP>

      <LegalH2 id="commitments">2. Our processor commitments</LegalH2>
      <LegalP>Where we act as processor, we will:</LegalP>
      <LegalUl>
        <li>Process personal data only on documented instructions from the controller</li>
        <li>Ensure personnel with access are bound by confidentiality</li>
        <li>Implement appropriate technical and organisational security measures</li>
        <li>Assist with data subject requests and security incidents as required by law</li>
        <li>Delete or return data at the end of the service, subject to legal retention</li>
        <li>Make available information needed to demonstrate compliance</li>
      </LegalUl>

      <LegalH2 id="subprocessors">3. Subprocessors</LegalH2>
      <LegalP>We use trusted providers to run SelfSubmit, including:</LegalP>
      <LegalUl>
        <li>
          <strong className="text-brand-black">Authentication</strong> — Clerk
        </li>
        <li>
          <strong className="text-brand-black">Payments</strong> — Stripe
        </li>
        <li>
          <strong className="text-brand-black">Hosting &amp; storage</strong> — Vercel (application and file storage)
        </li>
        <li>
          <strong className="text-brand-black">Database</strong> — Neon (PostgreSQL)
        </li>
        <li>
          <strong className="text-brand-black">Email</strong> — Resend
        </li>
        <li>
          <strong className="text-brand-black">SMS</strong> — Twilio (where you opt in to SMS reminders)
        </li>
        <li>
          <strong className="text-brand-black">Error monitoring</strong> — Sentry
        </li>
      </LegalUl>
      <LegalP>
        We require subprocessors to protect data under contract. We will notify controllers of material subprocessor
        changes where our DPA requires it.
      </LegalP>

      <LegalH2 id="transfers">4. International transfers</LegalH2>
      <LegalP>
        Some subprocessors may process data outside the UK. We use appropriate safeguards (such as UK International Data
        Transfer Agreements or adequacy regulations) where required. See our{" "}
        <Link href="/gdpr" className="text-brand-green underline underline-offset-2">
          GDPR &amp; data protection
        </Link>{" "}
        page.
      </LegalP>

      <LegalH2 id="request">5. Request a signed DPA</LegalH2>
      <LegalP>
        Email <PolicyContactEmail subject="DPA request" /> with your organisation name, role (controller/processor), and
        expected data volumes. We will provide our standard UK GDPR Article 28 terms or discuss bespoke arrangements for
        enterprise partners.
      </LegalP>

      <LegalCallout title="Related policies">
        <PolicyRelatedLinks
          links={[
            { href: "/privacy", label: "Privacy policy" },
            { href: "/gdpr", label: "GDPR & data protection" },
            { href: "/data-retention", label: "Data retention policy" },
          ]}
        />
      </LegalCallout>

      <LegalFooterNav currentPolicyHref="/dpa" />
    </LegalPageShell>
  );
}
