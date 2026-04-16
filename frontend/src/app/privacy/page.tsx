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
  title: "Privacy policy — SelfSubmit",
  description:
    "How SelfSubmit handles personal data on this website: what we collect, why, retention, your rights, and links to GDPR information.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Privacy policy"
      description="This policy describes how we process personal data when you use the SelfSubmit website. It should be read with our GDPR overview and cookie policy."
      lastUpdated="16 April 2026"
    >
      <LegalCallout title="Controller (placeholder)">
        <p className="text-sm leading-relaxed">
          Insert the legal name and contact details of the organisation operating SelfSubmit before you collect real
          personal data from the public. Until then, minimise data collection on this demo.
        </p>
      </LegalCallout>

      <LegalH2 id="scope">1. Scope</LegalH2>
      <LegalP>
        This policy covers information processed through pages served from this site (including forms and any future
        authenticated areas). It does not govern how your accountant or HMRC processes data when you deal with them
        directly.
      </LegalP>

      <LegalH2 id="collect">2. Data we may collect</LegalH2>
      <LegalUl>
        <li>
          <strong className="text-brand-black">Technical data:</strong> IP address, browser type, device identifiers,
          and logs needed for security and debugging (typically via hosting infrastructure).
        </li>
        <li>
          <strong className="text-brand-black">Form and usage data:</strong> anything you type into demos (for example
          income figures) if transmitted to our servers—today many demos run client-side only; confirm your deployment.
        </li>
        <li>
          <strong className="text-brand-black">Account data:</strong> when sign-in exists: name, email, hashed
          credentials, and preferences.
        </li>
        <li>
          <strong className="text-brand-black">Support communications:</strong> content you send if you email support.
        </li>
      </LegalUl>

      <LegalH2 id="purposes">3. Purposes and lawful bases</LegalH2>
      <LegalP>
        We process data to operate the site, provide features you request, secure our services, comply with law, and
        improve the product. Lawful bases may include contract, legitimate interests, legal obligation, and consent
        where required (see our{" "}
        <Link href="/gdpr" className="text-brand-green underline underline-offset-2">
          GDPR &amp; data protection
        </Link>{" "}
        page).
      </LegalP>

      <LegalH2 id="sharing">4. Sharing</LegalH2>
      <LegalP>
        We may use processors (hosting, email, analytics) under written agreements requiring them to protect data. We
        do not sell personal data. We may disclose data if required by law or to protect rights and safety.
      </LegalP>

      <LegalH2 id="retention">5. Retention</LegalH2>
      <LegalP>
        We keep data only as long as needed for the purposes above, then delete or anonymise it unless a longer period is
        required by law (for example tax record retention where we store business records on your behalf in a future
        product).
      </LegalP>

      <LegalH2 id="security">6. Security</LegalH2>
      <LegalP>
        We implement appropriate technical and organisational measures for the sensitivity of the data we handle. No
        method of transmission over the Internet is 100% secure.
      </LegalP>

      <LegalH2 id="rights">7. Your rights</LegalH2>
      <LegalP>
        UK individuals have rights of access, rectification, erasure, restriction, objection, portability, and
        complaint to the ICO, subject to conditions. See the{" "}
        <Link href="/gdpr" className="text-brand-green underline underline-offset-2">
          GDPR &amp; data protection
        </Link>{" "}
        page and contact us via the route on our{" "}
        <Link href="/contact" className="text-brand-green underline underline-offset-2">
          Contact
        </Link>{" "}
        page.
      </LegalP>

      <LegalH2 id="children">8. Children</LegalH2>
      <LegalP>This site is not directed at children under 16 and we do not knowingly collect their data.</LegalP>

      <LegalH2 id="international">9. International transfers</LegalH2>
      <LegalP>
        If personal data leaves the UK, we use appropriate safeguards as described in our GDPR page once applicable.
      </LegalP>

      <LegalH2 id="changes">10. Changes</LegalH2>
      <LegalP>We will update this policy when our practices change and revise the “Last updated” date.</LegalP>

      <LegalFooterNav />
    </LegalPageShell>
  );
}
