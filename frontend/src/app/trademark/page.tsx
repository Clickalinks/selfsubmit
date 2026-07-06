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
import { COMPANY } from "@/lib/company-details";

export const metadata: Metadata = {
  title: "Trademark — SelfSubmit",
  description:
    "Trademark notice for the SelfSubmit name, logo, and related branding used by Clicado Media UK Ltd.",
};

export default function TrademarkPage() {
  return (
    <LegalPageShell
      title="Trademark notice"
      description="How the SelfSubmit name and branding may be used by third parties."
      lastUpdated="6 July 2026"
    >
      <LegalCallout title="Rights holder">
        <CompanyDetails />
      </LegalCallout>

      <LegalH2 id="marks">1. Our marks</LegalH2>
      <LegalP>
        &ldquo;SelfSubmit&rdquo;, the SelfSubmit logo, and related trade dress are trademarks or registered trademarks
        of {COMPANY.legalName} (trading as {COMPANY.tradingAs}). Other names and logos on this site may be trademarks of
        their respective owners.
      </LegalP>

      <LegalH2 id="permitted">2. Permitted references</LegalH2>
      <LegalP>You may refer to SelfSubmit in:</LegalP>
      <LegalUl>
        <li>Truthful statements that you use or have used our service</li>
        <li>Reviews, news, or commentary that does not suggest endorsement or affiliation</li>
        <li>Links to our official website at {COMPANY.websiteUrl}</li>
      </LegalUl>

      <LegalH2 id="prohibited">3. Prohibited uses</LegalH2>
      <LegalP>Without our written permission, you must not:</LegalP>
      <LegalUl>
        <li>Use SelfSubmit marks in your company name, product name, or domain name</li>
        <li>Display our logo in a way that implies partnership, sponsorship, or HMRC endorsement</li>
        <li>Modify our logos or combine them with other marks in a confusing manner</li>
        <li>Use our marks in advertising that is false, misleading, or disparaging</li>
      </LegalUl>

      <LegalH2 id="hmrc">4. No HMRC endorsement</LegalH2>
      <LegalP>
        SelfSubmit is not affiliated with or endorsed by HM Revenue &amp; Customs. Do not use our marks to suggest
        official HMRC approval. See our{" "}
        <Link href="/disclaimer" className="text-brand-green underline underline-offset-2">
          Disclaimer
        </Link>
        .
      </LegalP>

      <LegalH2 id="permission">5. Permission requests</LegalH2>
      <LegalP>
        For press, partnership, or co-branding use of our marks, email{" "}
        <PolicyContactEmail subject="Trademark enquiry" />.
      </LegalP>

      <LegalFooterNav currentPolicyHref="/trademark" />
    </LegalPageShell>
  );
}
