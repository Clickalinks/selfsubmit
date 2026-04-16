import type { Metadata } from "next";

import {
  LegalCallout,
  LegalFooterNav,
  LegalH2,
  LegalP,
  LegalPageShell,
  LegalUl,
} from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Cookie policy — SelfSubmit",
  description:
    "How SelfSubmit uses cookies and similar technologies. Essential-only stance for the current demo; analytics disclosed if added.",
};

export default function CookiesPage() {
  return (
    <LegalPageShell
      title="Cookie policy"
      description="This page explains how we use cookies and similar storage on selfsubmit (the public demo site)."
      lastUpdated="16 April 2026"
    >
      <LegalCallout title="Current demo">
        <p>
          Today, this deployment is intended to run <strong>without non-essential tracking cookies</strong>. If we add
          analytics, advertising tags, or A/B testing, we will update this policy and, where required, ask for consent
          before those cookies load.
        </p>
      </LegalCallout>

      <LegalH2 id="what">What are cookies?</LegalH2>
      <LegalP>
        Cookies are small text files placed on your device by a website. “Similar technologies” can include local
        storage, session storage, or pixels used for comparable purposes.
      </LegalP>

      <LegalH2 id="types">How we categorise cookies</LegalH2>
      <LegalUl>
        <li>
          <strong className="text-brand-black">Strictly necessary:</strong> required for security, load balancing, or
          core functionality (for example keeping you signed in after you authenticate). These are usually exempt from
          consent banners under UK ePrivacy guidance when they are truly essential.
        </li>
        <li>
          <strong className="text-brand-black">Functional:</strong> remember choices such as language or accessibility
          preferences.
        </li>
        <li>
          <strong className="text-brand-black">Analytics / performance:</strong> help us understand usage (often
          optional and consent-based).
        </li>
        <li>
          <strong className="text-brand-black">Marketing:</strong> rarely used on a product like this; we would list
          them explicitly if introduced.
        </li>
      </LegalUl>

      <LegalH2 id="selfsubmit">SelfSubmit today</LegalH2>
      <LegalP>
        The marketing and form pages you see may rely on normal HTTP responses from the hosting provider (for example
        security or CDN cookies). We do not operate our own ad network on this demo.
      </LegalP>
      <LegalP>
        When sign-in and accounts exist, session cookies or tokens may be used to protect your account. Details will be
        listed here with name, purpose, and retention when that feature ships.
      </LegalP>

      <LegalH2 id="control">Your choices</LegalH2>
      <LegalP>
        You can block or delete cookies through your browser settings. Blocking strictly necessary cookies may break
        parts of the site (for example login).
      </LegalP>

      <LegalH2 id="changes">Changes</LegalH2>
      <LegalP>We will revise this page when our practices change and update the “Last updated” date at the top.</LegalP>

      <LegalFooterNav />
    </LegalPageShell>
  );
}
