import type { Metadata } from "next";
import Link from "next/link";

import { CompanyInfoLink } from "@/components/legal/CompanyDetails";
import { PolicyContactEmail, PolicyRelatedLinks } from "@/components/legal/PolicyHelpers";
import {
  LegalCallout,
  LegalFooterNav,
  LegalH2,
  LegalP,
  LegalPageShell,
} from "@/components/legal/LegalPageShell";
import { COMPANY } from "@/lib/company-details";

export const metadata: Metadata = {
  title: "Terms of use — SelfSubmit",
  description:
    "Terms governing use of the SelfSubmit website and subscription service operated by Clicado Media UK Ltd.",
};

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms of use"
      description="These terms apply when you browse or use selfsubmit.co.uk and the SelfSubmit application."
      lastUpdated="6 July 2026"
    >
      <LegalCallout title="Read together with">
        <PolicyRelatedLinks
          links={[
            { href: "/privacy", label: "Privacy policy" },
            { href: "/acceptable-use", label: "Acceptable use policy" },
            { href: "/refund", label: "Refund policy" },
            { href: "/cancellation", label: "Cancellation policy" },
            { href: "/cookies", label: "Cookie policy" },
          ]}
        />
      </LegalCallout>

      <LegalH2 id="operator">1. Who we are</LegalH2>
      <CompanyInfoLink />
      <LegalP>
        In these terms, &ldquo;we&rdquo;, &ldquo;us&rdquo; and &ldquo;our&rdquo; mean {COMPANY.legalName} trading as{" "}
        {COMPANY.tradingAs}. &ldquo;You&rdquo; means the person or business using the service.
      </LegalP>

      <LegalH2 id="accept">2. Acceptance</LegalH2>
      <LegalP>
        By accessing this website or creating an account you agree to these terms. If you do not agree, do not use the
        service. We may update these terms; continued use after changes constitutes acceptance of the revised terms.
      </LegalP>

      <LegalH2 id="service">3. The service</LegalH2>
      <LegalP>
        SelfSubmit provides record-keeping, submission tools, and guidance for UK self-employed users and landlords
        preparing Making Tax Digital updates. Some features may be labelled beta or illustrative until we confirm live
        HMRC filing for a specific release.
      </LegalP>

      <LegalH2 id="accounts">4. Accounts and eligibility</LegalH2>
      <LegalP>
        You must provide accurate information and keep credentials secure. The product is aimed at UK self-employed
        users; you must meet any age or capacity requirements we publish at sign-up.
      </LegalP>

      <LegalH2 id="acceptable">5. Acceptable use</LegalH2>
      <LegalP>
        You must use the service lawfully and honestly. Prohibited conduct includes fraud, unauthorised access, abuse of
        HMRC submissions, and misuse of our intellectual property. The full rules are in our{" "}
        <Link href="/acceptable-use" className="text-brand-green underline underline-offset-2">
          Acceptable use policy
        </Link>{" "}
        and{" "}
        <Link href="/anti-fraud" className="text-brand-green underline underline-offset-2">
          Anti-fraud policy
        </Link>
        .
      </LegalP>

      <LegalH2 id="billing">6. Subscriptions, refunds &amp; cancellation</LegalH2>
      <LegalP>
        Paid plans renew monthly until cancelled. Prices are shown at checkout. Refunds and cancellation are described
        in our{" "}
        <Link href="/refund" className="text-brand-green underline underline-offset-2">
          Refund policy
        </Link>{" "}
        and{" "}
        <Link href="/cancellation" className="text-brand-green underline underline-offset-2">
          Cancellation policy
        </Link>
        . Statutory consumer rights are not affected.
      </LegalP>

      <LegalH2 id="ip">7. Intellectual property</LegalH2>
      <LegalP>
        Branding, text, layout, and code on this site are owned by {COMPANY.legalName} or its licensors unless stated.
        See our{" "}
        <Link href="/copyright" className="text-brand-green underline underline-offset-2">
          Copyright
        </Link>{" "}
        and{" "}
        <Link href="/trademark" className="text-brand-green underline underline-offset-2">
          Trademark
        </Link>{" "}
        notices for permitted use.
      </LegalP>

      <LegalH2 id="third">8. Third-party services</LegalH2>
      <LegalP>
        We rely on hosting, authentication, payment, messaging, and email providers. Their terms may also apply where you
        interact with them.
      </LegalP>

      <LegalH2 id="warranty">9. Disclaimers</LegalH2>
      <LegalP>
        The service is provided &ldquo;as is&rdquo; to the extent permitted by law. We do not provide tax, legal, or
        accounting advice. You are responsible for the accuracy of information you submit to HMRC.
      </LegalP>

      <LegalH2 id="liability">10. Limitation of liability</LegalH2>
      <LegalP>
        To the fullest extent permitted by applicable law, {COMPANY.legalName} shall not be liable for any indirect,
        consequential, or special loss, or for any loss of profit, revenue, goodwill, or data arising from use of the
        service. Nothing in these terms excludes liability that cannot be excluded by law (including death or personal
        injury caused by negligence, or fraud).
      </LegalP>

      <LegalH2 id="law">11. Governing law and disputes</LegalH2>
      <LegalP>
        These terms are governed by the laws of England and Wales. The courts of England and Wales have exclusive
        jurisdiction, subject to any mandatory rights you have as a consumer in your home country.
      </LegalP>

      <LegalH2 id="contact">12. Contact</LegalH2>
      <LegalP>
        Email <PolicyContactEmail /> or see our{" "}
        <Link href="/contact" className="text-brand-green underline underline-offset-2">
          Contact
        </Link>{" "}
        page.
      </LegalP>

      <LegalFooterNav currentPolicyHref="/terms" />
    </LegalPageShell>
  );
}
