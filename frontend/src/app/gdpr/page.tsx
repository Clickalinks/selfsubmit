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
  title: "GDPR & UK data protection — SelfSubmit",
  description:
    "Overview of UK GDPR and Data Protection Act 2018 concepts as they relate to SelfSubmit: rights, lawful bases, retention, and ICO.",
};

export default function GdprPage() {
  return (
    <LegalPageShell
      title="GDPR &amp; UK data protection"
      description="UK organisations must comply with the UK GDPR (as tailored by the Data Protection Act 2018) and the Privacy and Electronic Communications Regulations (PECR) where relevant. This page summarises how SelfSubmit approaches those duties in plain language—it is not legal advice."
      lastUpdated="16 April 2026"
    >
      <LegalCallout title="Controller">
        <p>
          When SelfSubmit operates a live service, the organisation named in our{" "}
          <Link href="/privacy" className="font-semibold text-brand-green underline underline-offset-2">
            Privacy policy
          </Link>{" "}
          will be the <strong>data controller</strong> for personal data processed through the product (unless we tell
          you otherwise, for example where your accountant is a separate controller).
        </p>
      </LegalCallout>

      <LegalH2 id="principles">Principles we follow</LegalH2>
      <LegalUl>
        <li>Process personal data lawfully, fairly, and transparently.</li>
        <li>Collect data for specified, explicit, legitimate purposes and not reuse it incompatibly.</li>
        <li>Keep data adequate, relevant, and limited to what is necessary.</li>
        <li>Keep data accurate and erase or rectify when needed.</li>
        <li>Keep data only as long as necessary (retention schedules).</li>
        <li>Protect data with appropriate technical and organisational measures.</li>
        <li>Demonstrate accountability (records, assessments, and contracts with processors).</li>
      </LegalUl>

      <LegalH2 id="lawful">Lawful bases (examples)</LegalH2>
      <LegalP>
        Depending on the feature, we may rely on <strong>contract</strong> (providing the service you asked for),{" "}
        <strong>legal obligation</strong> (where the law requires retention or reporting),{" "}
        <strong>legitimate interests</strong> (fraud prevention or product improvement, balanced against your rights), or{" "}
        <strong>consent</strong> (for example optional marketing or non-essential cookies). The privacy policy will map
        each processing activity to a basis when we go live.
      </LegalP>

      <LegalH2 id="rights">Your rights</LegalH2>
      <LegalP>In the UK, individuals generally have the following rights in respect of personal data:</LegalP>
      <LegalUl>
        <li>Right to be informed (this page plus the privacy policy).</li>
        <li>Right of access (subject access request).</li>
        <li>Right to rectification.</li>
        <li>Right to erasure (“right to be forgotten”) in certain cases.</li>
        <li>Right to restrict processing in certain cases.</li>
        <li>Right to data portability for certain automated processing based on contract or consent.</li>
        <li>Right to object to processing based on legitimate interests or direct marketing.</li>
        <li>Rights related to automated decision-making and profiling where applicable.</li>
      </LegalUl>
      <LegalP>
        To exercise a right, use the contact route on our{" "}
        <Link href="/contact" className="text-brand-green underline underline-offset-2">
          Contact
        </Link>{" "}
        page once published. We will respond within statutory timeframes (normally one month, extendable in complex
        cases).
      </LegalP>

      <LegalH2 id="transfers">International transfers</LegalH2>
      <LegalP>
        If we host data outside the UK, we will use appropriate safeguards (for example UK International Data Transfer
        Agreement or adequacy regulations) and document them.
      </LegalP>

      <LegalH2 id="ico">Supervisory authority</LegalH2>
      <LegalP>
        You may complain to the Information Commissioner’s Office (ICO), the UK supervisory authority for data
        protection issues:{" "}
        <a
          href="https://ico.org.uk/make-a-complaint/"
          className="text-brand-green underline underline-offset-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          ico.org.uk
        </a>
        .
      </LegalP>

      <LegalH2 id="dpo">Data Protection Officer</LegalH2>
      <LegalP>
        We will publish a DPO or privacy lead contact if required by law or if we choose to appoint one voluntarily.
      </LegalP>

      <LegalFooterNav />
    </LegalPageShell>
  );
}
