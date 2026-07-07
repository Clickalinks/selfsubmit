import type { Metadata } from "next";
import Link from "next/link";

import { PolicyContactEmail } from "@/components/legal/PolicyHelpers";
import {
  LegalFooterNav,
  LegalH2,
  LegalP,
  LegalPageShell,
  LegalUl,
} from "@/components/legal/LegalPageShell";
import { COMPANY, copyrightNotice } from "@/lib/company-details";

export const metadata: Metadata = {
  title: "Copyright — SelfSubmit",
  description:
    "Copyright notice and permitted use of SelfSubmit website content, software, and branding owned by Clicado Media UK Ltd.",
};

export default function CopyrightPage() {
  return (
    <LegalPageShell
      title="Copyright notice"
      description="This page explains who owns the SelfSubmit website and what you may do with our content."
      lastUpdated="6 July 2026"
    >
      <LegalH2 id="ownership">1. Ownership</LegalH2>
      <LegalP>
        {copyrightNotice()} Unless stated otherwise, all content on selfsubmit.co.uk — including text, graphics, logos,
        icons, images, software, and page layout — is owned by {COMPANY.legalName} trading as {COMPANY.tradingAs} or its
        licensors and is protected by UK and international copyright laws. See our{" "}
        <Link href="/about#company-information" className="text-brand-green underline underline-offset-2">
          About us
        </Link>{" "}
        page for company registration details.
      </LegalP>

      <LegalH2 id="permitted">2. Permitted use</LegalH2>
      <LegalP>You may:</LegalP>
      <LegalUl>
        <li>View and print pages for your personal, non-commercial reference</li>
        <li>Share links to our public pages</li>
        <li>Quote brief excerpts with clear attribution and a link to the source</li>
      </LegalUl>

      <LegalH2 id="prohibited">3. Prohibited use</LegalH2>
      <LegalP>Without our prior written permission, you must not:</LegalP>
      <LegalUl>
        <li>Copy, reproduce, or republish substantial parts of the site</li>
        <li>Modify, adapt, or create derivative works from our content or code</li>
        <li>Use our content in a competing product or misleading context</li>
        <li>Remove copyright or proprietary notices</li>
      </LegalUl>

      <LegalH2 id="user-content">4. Your content</LegalH2>
      <LegalP>
        You retain ownership of data and documents you upload (for example receipts and figures). You grant us a limited
        licence to host, process, and display that content solely to provide the service, as described in our{" "}
        <Link href="/terms" className="text-brand-green underline underline-offset-2">
          Terms of use
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-brand-green underline underline-offset-2">
          Privacy policy
        </Link>
        .
      </LegalP>

      <LegalH2 id="third-party">5. Third-party material</LegalH2>
      <LegalP>
        HMRC guidance links and GOV.UK content remain subject to Open Government Licence or other terms published by the
        Crown. Trademarks of third parties belong to their respective owners.
      </LegalP>

      <LegalH2 id="permission">6. Permission requests</LegalH2>
      <LegalP>
        For licensing enquiries, email <PolicyContactEmail subject="Copyright enquiry" />.
      </LegalP>

      <LegalFooterNav currentPolicyHref="/copyright" />
    </LegalPageShell>
  );
}
