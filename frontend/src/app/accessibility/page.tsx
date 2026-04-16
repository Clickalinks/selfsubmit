import type { Metadata } from "next";
import Link from "next/link";

import { LegalFooterNav, LegalH2, LegalP, LegalPageShell, LegalUl } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Accessibility — SelfSubmit",
  description: "Accessibility statement for the SelfSubmit website: goals, standards, and how to report issues.",
};

export default function AccessibilityPage() {
  return (
    <LegalPageShell
      title="Accessibility"
      description="We want SelfSubmit to be usable by as many people as possible, including keyboard-only users and people using assistive technologies."
      lastUpdated="16 April 2026"
    >
      <LegalH2>Our goal</LegalH2>
      <LegalP>
        We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA for core journeys (read content, use
        forms, navigate with a keyboard). The site is a work in progress; some marketing sections may still need
        refinement.
      </LegalP>

      <LegalH2>Feedback</LegalH2>
      <LegalP>
        If you cannot access part of this site, please tell us via the contact route on our{" "}
        <Link href="/contact" className="text-brand-green underline underline-offset-2">
          Contact
        </Link>{" "}
        page once published, including the page URL and browser or assistive technology you use.
      </LegalP>

      <LegalH2>Techniques we use</LegalH2>
      <LegalUl>
        <li>Semantic HTML landmarks and headings where components have been built out.</li>
        <li>Visible focus styles on interactive controls.</li>
        <li>Labels associated with inputs on forms we control.</li>
      </LegalUl>

      <LegalFooterNav />
    </LegalPageShell>
  );
}
