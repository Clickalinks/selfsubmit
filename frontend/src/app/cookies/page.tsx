import type { Metadata } from "next";

import { PolicyRelatedLinks } from "@/components/legal/PolicyHelpers";
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
    "How SelfSubmit uses cookies and similar technologies for sign-in, security, and core functionality.",
};

export default function CookiesPage() {
  return (
    <LegalPageShell
      title="Cookie policy"
      description="This page explains how we use cookies and similar storage on selfsubmit.co.uk and the SelfSubmit application."
      lastUpdated="6 July 2026"
    >
      <LegalCallout title="Summary">
        <p>
          We use <strong>strictly necessary</strong> cookies and similar technologies to keep you signed in, protect
          accounts, and run the service. We do not use advertising cookies. If we add non-essential analytics, we will
          update this policy and ask for consent where required.
        </p>
      </LegalCallout>

      <LegalH2 id="what">1. What are cookies?</LegalH2>
      <LegalP>
        Cookies are small text files placed on your device by a website. Similar technologies include local storage,
        session storage, and pixels used for comparable purposes.
      </LegalP>

      <LegalH2 id="types">2. Categories</LegalH2>
      <LegalUl>
        <li>
          <strong className="text-brand-black">Strictly necessary:</strong> required for security, authentication, and
          core functionality. These are usually exempt from consent banners when truly essential.
        </li>
        <li>
          <strong className="text-brand-black">Functional:</strong> remember choices such as preferences (minimal use
          today).
        </li>
        <li>
          <strong className="text-brand-black">Analytics:</strong> help us understand usage — not deployed for marketing
          tracking at this time.
        </li>
        <li>
          <strong className="text-brand-black">Marketing:</strong> we do not operate advertising cookies on SelfSubmit.
        </li>
      </LegalUl>

      <LegalH2 id="use">3. Cookies we use</LegalH2>
      <LegalUl>
        <li>
          <strong className="text-brand-black">Authentication (Clerk):</strong> session and security cookies to keep you
          signed in and protect your account.
        </li>
        <li>
          <strong className="text-brand-black">Active business selection:</strong> a functional cookie may remember which
          business profile you are working on in the dashboard.
        </li>
        <li>
          <strong className="text-brand-black">Hosting (Vercel/CDN):</strong> infrastructure cookies for load balancing and
          security.
        </li>
        <li>
          <strong className="text-brand-black">Stripe:</strong> cookies may be set when you use the billing portal or
          checkout.
        </li>
      </LegalUl>
      <LegalP>
        Exact cookie names and durations may change as providers update their services. We will keep this page accurate
        when material changes occur.
      </LegalP>

      <LegalH2 id="banner">4. Cookie banner</LegalH2>
      <LegalP>
        When you first visit our site, we show a cookie notice explaining that we use essential cookies only. Dismissing
        the banner records your choice so we do not show it again on that device. If we add non-essential cookies in
        future, we will update this policy and the banner before enabling them.
      </LegalP>

      <LegalH2 id="control">5. Your choices</LegalH2>
      <LegalP>
        You can block or delete cookies through your browser settings. Blocking strictly necessary cookies may prevent
        sign-in or break parts of the service.
      </LegalP>

      <LegalH2 id="pecr">6. PECR and consent</LegalH2>
      <LegalP>
        UK Privacy and Electronic Communications Regulations (PECR) apply to cookies and similar technologies. We align
        with ICO guidance on essential cookies. Our cookie banner is live on the website; we will ask for consent before
        loading non-essential tracking if we add it.
      </LegalP>

      <LegalH2 id="changes">7. Changes</LegalH2>
      <LegalP>We will revise this page when our practices change and update the &ldquo;Last updated&rdquo; date.</LegalP>

      <LegalCallout title="Related policies">
        <PolicyRelatedLinks
          links={[
            { href: "/privacy", label: "Privacy policy" },
            { href: "/gdpr", label: "GDPR & data protection" },
          ]}
        />
      </LegalCallout>

      <LegalFooterNav currentPolicyHref="/cookies" />
    </LegalPageShell>
  );
}
