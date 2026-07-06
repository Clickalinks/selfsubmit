import type { Metadata } from "next";

import { PolicyContactEmail } from "@/components/legal/PolicyHelpers";
import { LegalFooterNav, LegalH2, LegalP, LegalPageShell, LegalUl } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Accessibility — SelfSubmit",
  description: "Accessibility statement for SelfSubmit: WCAG goals, known limitations, and how to report barriers.",
};

export default function AccessibilityPage() {
  return (
    <LegalPageShell
      title="Accessibility statement"
      description="We want SelfSubmit to be usable by as many people as possible, including keyboard-only users and people using assistive technologies."
      lastUpdated="6 July 2026"
    >
      <LegalH2 id="goal">1. Our goal</LegalH2>
      <LegalP>
        We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA for core journeys — reading content,
        completing forms, managing accounts, and navigating with a keyboard. Some marketing sections and newer features
        may still be being improved.
      </LegalP>

      <LegalH2 id="measures">2. Measures we take</LegalH2>
      <LegalUl>
        <li>Semantic HTML landmarks and heading structure on pages we control</li>
        <li>Visible focus styles on interactive controls</li>
        <li>Labels associated with form inputs in our application forms</li>
        <li>Sufficient colour contrast on primary UI components</li>
        <li>Responsive layouts for mobile and desktop screen sizes</li>
      </LegalUl>

      <LegalH2 id="limitations">3. Known limitations</LegalH2>
      <LegalP>
        Third-party components (for example authentication and payment flows) may not fully meet our target standard.
        Uploaded receipt images may not include alternative text supplied by users. We are working through a backlog of
        improvements as the product grows.
      </LegalP>

      <LegalH2 id="feedback">4. Feedback and enforcement</LegalH2>
      <LegalP>
        If you cannot access part of this site, please email <PolicyContactEmail subject="Accessibility feedback" /> with
        the page URL, a description of the barrier, and the browser or assistive technology you use. We aim to respond
        within ten working days.
      </LegalP>
      <LegalP>
        The Equality and Human Rights Commission (EHRC) enforces accessibility regulations for public sector bodies.
        SelfSubmit is a private service, but we follow similar good practice and welcome your reports.
      </LegalP>

      <LegalH2 id="preparation">5. Preparation of this statement</LegalH2>
      <LegalP>
        This statement was prepared on 6 July 2026. It was last reviewed on that date. We evaluate accessibility as part
        of ongoing development rather than a one-off audit.
      </LegalP>

      <LegalFooterNav currentPolicyHref="/accessibility" />
    </LegalPageShell>
  );
}
