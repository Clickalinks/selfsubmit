import type { Metadata } from "next";
import Link from "next/link";

import { CompanyDetails } from "@/components/legal/CompanyDetails";
import { PolicyContactEmail } from "@/components/legal/PolicyHelpers";
import {
  LegalCallout,
  LegalFooterNav,
  LegalH2,
  LegalOl,
  LegalP,
  LegalPageShell,
  LegalUl,
} from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Responsible disclosure — SelfSubmit",
  description:
    "How security researchers can report vulnerabilities in SelfSubmit responsibly and what we ask in return.",
};

export default function ResponsibleDisclosurePage() {
  return (
    <LegalPageShell
      title="Responsible disclosure policy"
      description="We welcome reports of genuine security vulnerabilities. Please follow this policy so we can fix issues safely."
      lastUpdated="6 July 2026"
    >
      <LegalCallout title="Operator">
        <CompanyDetails />
      </LegalCallout>

      <LegalH2 id="welcome">1. We appreciate responsible reports</LegalH2>
      <LegalP>
        If you believe you have found a security vulnerability in selfsubmit.co.uk or the SelfSubmit application, please
        tell us privately before disclosing it publicly. We will investigate in good faith.
      </LegalP>

      <LegalH2 id="report">2. How to report</LegalH2>
      <LegalP>
        Email <PolicyContactEmail subject="Security vulnerability report" /> with:
      </LegalP>
      <LegalUl>
        <li>A clear description of the issue and affected URLs or features</li>
        <li>Steps to reproduce (proof-of-concept where helpful)</li>
        <li>Your assessment of impact (confidentiality, integrity, availability)</li>
        <li>Your contact details for follow-up</li>
      </LegalUl>
      <LegalP>Please encrypt sensitive attachments if you use them — ask us for a PGP key if required.</LegalP>

      <LegalH2 id="please-do">3. Please do</LegalH2>
      <LegalUl>
        <li>Act in good faith and avoid privacy violations</li>
        <li>Test only against accounts you own or our explicit written authorisation</li>
        <li>Give us reasonable time to remediate before public disclosure</li>
        <li>Comply with applicable laws</li>
      </LegalUl>

      <LegalH2 id="please-dont">4. Please do not</LegalH2>
      <LegalUl>
        <li>Access, modify, or delete other users&apos; data</li>
        <li>Perform denial-of-service attacks or social engineering against our staff or users</li>
        <li>Exploit vulnerabilities beyond what is needed to demonstrate the issue</li>
        <li>Demand payment before reporting (we do not operate a paid bug bounty at this time)</li>
      </LegalUl>

      <LegalH2 id="process">5. Our process</LegalH2>
      <LegalOl>
        <li>Acknowledge receipt within three working days where possible</li>
        <li>Investigate and prioritise by severity</li>
        <li>Keep you informed of material progress</li>
        <li>Notify you when we believe the issue is fixed</li>
      </LegalOl>

      <LegalH2 id="safe-harbour">6. Safe harbour</LegalH2>
      <LegalP>
        If you follow this policy and act in good faith, we will not pursue legal action against you for research
        activities that were necessary to report the vulnerability. This does not extend to conduct outside the policy
        (for example data theft or extortion).
      </LegalP>

      <LegalH2 id="recognition">7. Recognition</LegalH2>
      <LegalP>
        We may thank researchers privately or with permission on a security acknowledgements page. We do not currently
        offer monetary rewards.
      </LegalP>

      <LegalCallout title="Related">
        <p className="text-sm leading-relaxed">
          See also our{" "}
          <Link href="/security" className="font-semibold text-brand-green underline underline-offset-2">
            Security overview
          </Link>{" "}
          and{" "}
          <Link href="/acceptable-use" className="font-semibold text-brand-green underline underline-offset-2">
            Acceptable use policy
          </Link>
          .
        </p>
      </LegalCallout>

      <LegalFooterNav currentPolicyHref="/responsible-disclosure" />
    </LegalPageShell>
  );
}
