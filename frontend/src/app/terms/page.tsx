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
  title: "Terms of use — SelfSubmit",
  description:
    "Terms governing use of the SelfSubmit website and demo features. Includes limitations, acceptable use, and links to privacy and disclaimers.",
};

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms of use"
      description="These terms apply when you browse or use selfsubmit (the website). They may be replaced by a fuller commercial agreement when paid accounts launch."
      lastUpdated="16 April 2026"
    >
      <LegalCallout title="Read together with">
        <p className="text-sm leading-relaxed">
          <Link href="/privacy" className="font-semibold text-brand-green underline underline-offset-2">
            Privacy policy
          </Link>
          ,{" "}
          <Link href="/disclaimer" className="font-semibold text-brand-green underline underline-offset-2">
            Disclaimer &amp; illustrative content
          </Link>
          , and{" "}
          <Link href="/cookies" className="font-semibold text-brand-green underline underline-offset-2">
            Cookie policy
          </Link>
          .
        </p>
      </LegalCallout>

      <LegalH2 id="accept">1. Acceptance</LegalH2>
      <LegalP>
        By accessing this website you agree to these terms. If you do not agree, do not use the site. We may update
        these terms; continued use after changes constitutes acceptance of the revised terms.
      </LegalP>

      <LegalH2 id="service">2. The service today</LegalH2>
      <LegalP>
        SelfSubmit currently provides informational pages, a demonstration monthly income and expenses form, and an
        illustrative tax calculator. Features labelled as demo may not persist data or file anything with HMRC.
      </LegalP>

      <LegalH2 id="accounts">3. Accounts and eligibility</LegalH2>
      <LegalP>
        When registration opens, you must provide accurate information and keep credentials secure. The product is aimed
        at UK self-employed users; you must meet any age or capacity requirements we publish at signup.
      </LegalP>

      <LegalH2 id="acceptable">4. Acceptable use</LegalH2>
      <LegalP>You must not:</LegalP>
      <LegalUl>
        <li>Attempt to gain unauthorised access to our systems, other users’ data, or third-party networks.</li>
        <li>Use the site to distribute malware, spam, or unlawful content.</li>
        <li>Reverse engineer or scrape the site in a way that harms performance or breaches intellectual property rights.</li>
        <li>Misrepresent your identity or affiliation.</li>
      </LegalUl>

      <LegalH2 id="ip">5. Intellectual property</LegalH2>
      <LegalP>
        Branding, text, layout, and code on this site are owned by SelfSubmit or its licensors unless stated. You may
        view and print pages for personal, non-commercial reference. Other use requires our written permission.
      </LegalP>

      <LegalH2 id="third">6. Third-party services</LegalH2>
      <LegalP>
        We may rely on hosting providers, analytics (if enabled), or payment processors. Their terms may also apply
        where you interact with them.
      </LegalP>

      <LegalH2 id="warranty">7. Disclaimers</LegalH2>
      <LegalP>
        The site is provided “as is” to the extent permitted by law. We do not warrant uninterrupted or error-free
        operation. Tax and compliance outputs are illustrative unless we expressly state otherwise for a specific
        certified feature.
      </LegalP>

      <LegalH2 id="liability">8. Limitation of liability</LegalH2>
      <LegalP>
        To the fullest extent permitted by applicable law, SelfSubmit and its operators shall not be liable for any
        indirect, consequential, or special loss, or for any loss of profit, revenue, goodwill, or data arising from use
        of this demo site. Nothing in these terms excludes liability that cannot be excluded by law (including death or
        personal injury caused by negligence, or fraud).
      </LegalP>

      <LegalH2 id="law">9. Governing law and disputes</LegalH2>
      <LegalP>
        These terms are governed by the laws of England and Wales. The courts of England and Wales have exclusive
        jurisdiction, subject to any mandatory rights you have as a consumer in your home country.
      </LegalP>

      <LegalH2 id="contact">10. Contact</LegalH2>
      <LegalP>
        See our{" "}
        <Link href="/contact" className="text-brand-green underline underline-offset-2">
          Contact
        </Link>{" "}
        page for how to reach us once routes are published.
      </LegalP>

      <LegalFooterNav />
    </LegalPageShell>
  );
}
