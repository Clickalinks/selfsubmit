import type { Metadata } from "next";

import Link from "next/link";



import { DataControllerCallout, PolicyContactEmail, PolicyRelatedLinks } from "@/components/legal/PolicyHelpers";
import { IcoRegistrationSection } from "@/components/legal/CompanyDetails";

import { ProcessorList } from "@/components/legal/ProcessorList";

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

  title: "Privacy policy — SelfSubmit",

  description:

    "How SelfSubmit handles personal data: what we collect, why, retention, subprocessors, your rights, and contact details.",

};



export default function PrivacyPage() {

  return (

    <LegalPageShell

      title="Privacy policy"

      description="This policy describes how we process personal data when you use selfsubmit.co.uk and the SelfSubmit application."

      lastUpdated="20 July 2026"

    >

      <DataControllerCallout>
        <p>
          {COMPANY.legalName} ({COMPANY.tradingName}) is the data controller for personal data processed through
          selfsubmit.co.uk, unless we tell you otherwise (for example where a partner acts as controller — see our{" "}
          <Link href="/dpa" className="font-semibold text-brand-green underline underline-offset-2">
            DPA
          </Link>
          ).
        </p>
      </DataControllerCallout>

      <LegalCallout title="ICO registration">
        <IcoRegistrationSection />
      </LegalCallout>

      <LegalH2 id="scope">1. Scope</LegalH2>

      <LegalP>

        This policy covers personal data we process when you browse our website, create an account, subscribe, upload

        records, contact support, or receive reminders. It does not govern how HMRC or your accountant processes data

        when you deal with them directly.

      </LegalP>



      <LegalH2 id="collect">2. Data we collect</LegalH2>

      <LegalUl>

        <li>

          <strong className="text-brand-black">Identity &amp; contact:</strong> name, email address, phone number (if

          you provide it for SMS reminders), and account identifiers from our authentication provider.

        </li>

        <li>

          <strong className="text-brand-black">Tax identifiers:</strong> Unique Taxpayer Reference (UTR) and National

          Insurance number — encrypted at the application layer before storage.

        </li>

        <li>

          <strong className="text-brand-black">Business records:</strong> income and expense figures, profession, business

          names, submission history, and receipt images you upload.

        </li>

        <li>

          <strong className="text-brand-black">Billing:</strong> subscription status and Stripe customer identifiers —

          card details are handled by Stripe, not stored on our servers.

        </li>

        <li>

          <strong className="text-brand-black">Technical &amp; security:</strong> IP address, device/browser data, logs,

          and security events needed to operate and protect the service.

        </li>

        <li>

          <strong className="text-brand-black">Communications:</strong> support emails and optional marketing preferences

          where you opt in.

        </li>

      </LegalUl>



      <LegalH2 id="purposes">3. Purposes and lawful bases</LegalH2>

      <LegalP>We process data to:</LegalP>

      <LegalUl>

        <li>

          <strong className="text-brand-black">Provide the service</strong> (contract) — accounts, record-keeping,

          submissions, receipts, reminders.

        </li>

        <li>

          <strong className="text-brand-black">Bill and administer subscriptions</strong> (contract / legal obligation).

        </li>

        <li>

          <strong className="text-brand-black">Secure the platform</strong> (legitimate interests) — fraud prevention,

          abuse detection, and incident response.

        </li>

        <li>

          <strong className="text-brand-black">Comply with law</strong> (legal obligation) — tax, accounting, and

          regulatory requirements.

        </li>

        <li>

          <strong className="text-brand-black">Improve the product</strong> (legitimate interests) — aggregated usage

          insight without selling personal data.

        </li>

        <li>

          <strong className="text-brand-black">Marketing</strong> (consent where required) — only if you opt in.

        </li>

      </LegalUl>

      <LegalP>

        See our{" "}

        <Link href="/gdpr" className="text-brand-green underline underline-offset-2">

          GDPR &amp; data protection

        </Link>{" "}

        page for more on lawful bases and rights.

      </LegalP>



      <LegalH2 id="processors">4. Processors and sharing</LegalH2>

      <LegalP>

        We use carefully selected service providers under contract to operate SelfSubmit. We do not sell personal data.

        We may disclose data if required by law, to protect rights and safety, or in connection with a business transfer.

      </LegalP>

      <LegalP>In broad terms, personal data may be processed by providers that help us with:</LegalP>

      <LegalUl>

        <li>Cloud application hosting, content delivery, and serverless compute</li>

        <li>Managed database hosting for account and business records</li>

        <li>Secure file storage for receipts and documents you upload</li>

        <li>Optional SMS notifications (where you opt in)</li>

        <li>Technical error monitoring and reliability diagnostics</li>

        <li>Authentication, payments, transactional email, and UK address lookup (named below)</li>

      </LegalUl>

      <LegalP>

        Those infrastructure and communications services are engaged under data-processing terms appropriate to UK GDPR.

        We do not publish a full directory of every infrastructure vendor on this page. Named providers you are most

        likely to interact with (or see branded flows for) are:

      </LegalP>

      <ProcessorList />

      <LegalP>

        Business customers may need a signed agreement — see our{" "}

        <Link href="/dpa" className="text-brand-green underline underline-offset-2">

          DPA

        </Link>

        .

      </LegalP>



      <LegalH2 id="minimisation">5. Data minimisation</LegalH2>

      <LegalP>We collect only what we need to provide the service, including:</LegalP>

      <LegalUl>

        <li>Identity and contact details to create and support your account</li>

        <li>Tax identifiers (UTR and NI) when you choose to store them — encrypted at rest</li>

        <li>Business records, receipts, and submissions you enter or upload</li>

        <li>Technical logs for security and reliability</li>

      </LegalUl>

      <LegalP>

        We do not collect special category data unless you voluntarily include it in free-text fields — please avoid

        doing so.

      </LegalP>



      <LegalH2 id="retention">6. Retention</LegalH2>

      <LegalP>

        We keep data only as long as needed. Tax and business records may be retained to support HMRC record-keeping

        expectations while your account is active and for a limited period after closure. See our{" "}

        <Link href="/data-retention" className="text-brand-green underline underline-offset-2">

          Data retention policy

        </Link>

        .

      </LegalP>



      <LegalH2 id="security">7. Security</LegalH2>

      <LegalP>

        We use HTTPS, encrypted storage for sensitive tax identifiers, access controls, and monitoring. See{" "}

        <Link href="/security" className="text-brand-green underline underline-offset-2">

          Security

        </Link>{" "}

        and{" "}

        <Link href="/responsible-disclosure" className="text-brand-green underline underline-offset-2">

          Responsible disclosure

        </Link>

        .

      </LegalP>



      <LegalH2 id="rights">8. Your rights</LegalH2>

      <LegalP>

        UK individuals have rights of access, rectification, erasure, restriction, objection, portability, and complaint

        to the ICO, subject to conditions. In the app, you can{" "}

        <Link href="/settings" className="text-brand-green underline underline-offset-2">

          export your data

        </Link>{" "}

        or delete your account from Settings. You can also email <PolicyContactEmail subject="Data protection request" />{" "}

        or see{" "}

        <Link href="/gdpr" className="text-brand-green underline underline-offset-2">

          GDPR &amp; data protection

        </Link>

        .

      </LegalP>



      <LegalH2 id="cookies">9. Cookies</LegalH2>

      <LegalP>

        See our{" "}

        <Link href="/cookies" className="text-brand-green underline underline-offset-2">

          Cookie policy

        </Link>

        .

      </LegalP>



      <LegalH2 id="children">10. Children</LegalH2>

      <LegalP>The service is not directed at children under 16 and we do not knowingly collect their data.</LegalP>



      <LegalH2 id="international">11. International transfers</LegalH2>

      <LegalP>

        Some processors may process data outside the UK. We use appropriate safeguards where required — see our GDPR page.

      </LegalP>



      <LegalH2 id="changes">12. Changes</LegalH2>

      <LegalP>We will update this policy when practices change and revise the &ldquo;Last updated&rdquo; date.</LegalP>



      <LegalCallout title="Related policies">

        <PolicyRelatedLinks

          links={[

            { href: "/gdpr", label: "GDPR & data protection" },

            { href: "/data-retention", label: "Data retention policy" },

            { href: "/cookies", label: "Cookie policy" },

          ]}

        />

      </LegalCallout>



      <LegalFooterNav currentPolicyHref="/privacy" />

    </LegalPageShell>

  );

}


