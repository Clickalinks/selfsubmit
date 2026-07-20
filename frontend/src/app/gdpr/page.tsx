import type { Metadata } from "next";

import Link from "next/link";



import { IcoRegistrationSection } from "@/components/legal/CompanyDetails";
import { DataControllerCallout, PolicyContactEmail, PolicyRelatedLinks } from "@/components/legal/PolicyHelpers";

import { ProcessorList } from "@/components/legal/ProcessorList";

import {

  LegalCallout,

  LegalFooterNav,

  LegalH2,

  LegalP,

  LegalPageShell,

  LegalUl,

} from "@/components/legal/LegalPageShell";



export const metadata: Metadata = {

  title: "GDPR & UK data protection — SelfSubmit",

  description:

    "UK GDPR overview for SelfSubmit: principles, lawful bases, your rights, international transfers, and ICO complaints.",

};



export default function GdprPage() {

  return (

    <LegalPageShell

      title="GDPR &amp; UK data protection"

      description="UK organisations must comply with the UK GDPR (as tailored by the Data Protection Act 2018) and PECR where relevant. This page summarises how SelfSubmit approaches those duties in plain language — it is not legal advice."

      lastUpdated="20 July 2026"

    >

      <DataControllerCallout>
        <p>
          The organisation named above is the <strong>data controller</strong> for personal data processed through
          SelfSubmit when you sign up directly. Business partners processing client data may be separate controllers —
          see our{" "}
          <Link href="/dpa" className="font-semibold text-brand-green underline underline-offset-2">
            DPA
          </Link>
          .
        </p>
      </DataControllerCallout>



      <LegalH2 id="principles">1. Principles we follow</LegalH2>

      <LegalUl>

        <li>Process personal data lawfully, fairly, and transparently.</li>

        <li>Collect data for specified, explicit, legitimate purposes and not reuse it incompatibly.</li>

        <li>Keep data adequate, relevant, and limited to what is necessary.</li>

        <li>Keep data accurate and erase or rectify when needed.</li>

        <li>Keep data only as long as necessary — see our{" "}

          <Link href="/data-retention" className="text-brand-green underline underline-offset-2">

            Data retention policy

          </Link>

          .

        </li>

        <li>Protect data with appropriate technical and organisational measures.</li>

        <li>Demonstrate accountability (records, assessments, and contracts with processors).</li>

      </LegalUl>



      <LegalH2 id="lawful">2. Lawful bases (examples)</LegalH2>

      <LegalP>

        Depending on the activity, we may rely on <strong>contract</strong> (providing the service you requested),{" "}

        <strong>legal obligation</strong> (tax and accounting records),{" "}

        <strong>legitimate interests</strong> (security, fraud prevention, proportionate product improvement), or{" "}

        <strong>consent</strong> (optional marketing or non-essential cookies). Our{" "}

        <Link href="/privacy" className="text-brand-green underline underline-offset-2">

          Privacy policy

        </Link>{" "}

        maps processing activities to these bases.

      </LegalP>



      <LegalH2 id="rights">3. Your rights</LegalH2>

      <LegalP>In the UK, individuals generally have the following rights in respect of personal data:</LegalP>

      <LegalUl>

        <li>Right to be informed (this page plus the privacy policy).</li>

        <li>Right of access (subject access request).</li>

        <li>Right to rectification.</li>

        <li>Right to erasure (&ldquo;right to be forgotten&rdquo;) in certain cases.</li>

        <li>Right to restrict processing in certain cases.</li>

        <li>Right to data portability for certain automated processing based on contract or consent.</li>

        <li>Right to object to processing based on legitimate interests or direct marketing.</li>

        <li>Rights related to automated decision-making and profiling where applicable.</li>

      </LegalUl>

      <LegalP>

        To exercise a right, email <PolicyContactEmail subject="Data protection request" /> with the subject line

        &ldquo;Data protection request&rdquo;. We will respond within statutory timeframes (normally one month,

        extendable in complex cases). You can also use in-app tools under{" "}

        <Link href="/settings" className="text-brand-green underline underline-offset-2">

          Settings

        </Link>{" "}

        to export your data or delete your account.

      </LegalP>



      <LegalH2 id="minimisation">4. Data minimisation</LegalH2>

      <LegalP>

        We design SelfSubmit to collect only data needed for MTD record-keeping, billing, and security. We do not ask for

        special category data. Tax identifiers are optional until you choose to store them and are encrypted at the

        application layer. See our{" "}

        <Link href="/privacy" className="text-brand-green underline underline-offset-2">

          Privacy policy

        </Link>{" "}

        for details.

      </LegalP>



      <LegalH2 id="consent">5. Consent and records</LegalH2>

      <LegalP>

        When you sign up, accept our cookie notice, or opt into optional communications, we record your consent with a

        timestamp, policy version, and technical context (such as IP address) so we can demonstrate compliance. Essential

        cookies for sign-in and security do not require consent under UK PECR.

      </LegalP>



      <LegalH2 id="processors">6. Processors and DPAs</LegalH2>

      <LegalP>

        We use subprocessors under UK GDPR Article 28 terms. Infrastructure services (hosting, databases, file storage,

        optional SMS, and technical monitoring) are described by category in our Privacy policy. The table below names

        providers you are most likely to interact with directly. Business customers who need a signed agreement should

        see our{" "}

        <Link href="/dpa" className="text-brand-green underline underline-offset-2">

          Data processing agreement

        </Link>

        .

      </LegalP>

      <ProcessorList />



      <LegalH2 id="transfers">7. International transfers</LegalH2>

      <LegalP>

        Some providers may process data outside the UK. We use appropriate safeguards (for example UK International Data

        Transfer Agreements or adequacy regulations) and document them.

      </LegalP>



      <LegalH2 id="ico-registration">8. ICO registration</LegalH2>
      <IcoRegistrationSection />
      <LegalP>
        See our{" "}
        <Link href="/about#company-information" className="text-brand-green underline underline-offset-2">
          About us
        </Link>{" "}
        page for full company registration details.
      </LegalP>

      <LegalH2 id="ico">9. Supervisory authority</LegalH2>

      <LegalP>

        You may complain to the Information Commissioner&apos;s Office (ICO):{" "}

        <a

          href="https://ico.org.uk/make-a-complaint/"

          className="text-brand-green underline underline-offset-2"

          target="_blank"

          rel="noopener noreferrer"

        >

          ico.org.uk

        </a>

        . We encourage you to contact us first so we can try to resolve your concern.

      </LegalP>



      <LegalH2 id="contact">10. Privacy contact</LegalH2>

      <LegalP>

        For data protection enquiries, email <PolicyContactEmail subject="Data protection enquiry" />. We will publish a

        dedicated Data Protection Officer contact if we are required to appoint one.

      </LegalP>



      <LegalCallout title="Related policies">

        <PolicyRelatedLinks

          links={[

            { href: "/privacy", label: "Privacy policy" },

            { href: "/data-retention", label: "Data retention policy" },

            { href: "/cookies", label: "Cookie policy" },

          ]}

        />

      </LegalCallout>



      <LegalFooterNav currentPolicyHref="/gdpr" />

    </LegalPageShell>

  );

}


