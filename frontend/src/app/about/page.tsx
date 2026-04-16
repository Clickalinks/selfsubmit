import type { Metadata } from "next";
import Link from "next/link";

import { LegalFooterNav, LegalH2, LegalP, LegalPageShell, LegalUl } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "About us — SelfSubmit",
  description:
    "What SelfSubmit is building: simpler monthly income and expense capture for UK self-employed trades, with clarity on what is demo today.",
};

export default function AboutPage() {
  return (
    <LegalPageShell
      title="About us"
      description="SelfSubmit is a UK-focused product concept for self-employed people who want a calmer, clearer way to keep on top of money in and money out."
      lastUpdated="16 April 2026"
    >
      <LegalP>
        We are designing flows around real trades (taxi and private hire, barbers, driving instructors, and others) so
        templates, wording, and vehicle options match how people actually work—not generic “business expenses” lists
        that miss the point.
      </LegalP>

      <LegalH2>What you can use today</LegalH2>
      <LegalUl>
        <li>Landing experience, profession-led navigation, and links to tools on this site.</li>
        <li>
          A structured{" "}
          <Link href="/submit" className="text-brand-green underline underline-offset-2">
            monthly income &amp; expenses
          </Link>{" "}
          form with HMRC-aligned notices where we surface official simplified mileage references.
        </li>
        <li>
          An illustrative{" "}
          <Link href="/tax-calculator" className="text-brand-green underline underline-offset-2">
            tax calculator
          </Link>
          .
        </li>
      </LegalUl>

      <LegalH2>What is still roadmap</LegalH2>
      <LegalP>
        Account sign-in, cloud save, payments, and live HMRC submission are not wired in the public demo. Anything
        described on marketing copy as “MTD compliant” or “submit” reflects the <strong>intended direction</strong> of
        the product, not a certified integration unless we state otherwise on a dated release note.
      </LegalP>

      <LegalH2>Contact</LegalH2>
      <LegalP>
        For product questions or partnerships, use the details on our{" "}
        <Link href="/contact" className="text-brand-green underline underline-offset-2">
          Contact
        </Link>{" "}
        page.
      </LegalP>

      <LegalFooterNav />
    </LegalPageShell>
  );
}
