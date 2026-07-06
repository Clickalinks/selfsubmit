import type { Metadata } from "next";
import Link from "next/link";

import { CompanyDetails } from "@/components/legal/CompanyDetails";
import { LegalFooterNav, LegalH2, LegalP, LegalPageShell, LegalUl } from "@/components/legal/LegalPageShell";
import { COMPANY } from "@/lib/company-details";

export const metadata: Metadata = {
  title: "About us — SelfSubmit",
  description:
    "Why SelfSubmit exists: straightforward monthly records and submission for UK self-employed people, built from real experience with clarity on what the demo includes today.",
};

export default function AboutPage() {
  return (
    <LegalPageShell
      title="About us"
      description="Making tax submission straightforward for the self-employed — with simple tools instead of complicated accounting software."
      lastUpdated="21 April 2026"
    >
      <LegalP>
        At <strong>SelfSubmit</strong>, we believe that managing your taxes shouldn&apos;t be complicated, stressful, or
        time-consuming — especially if you&apos;re self-employed.
      </LegalP>

      <LegalP>
        SelfSubmit was created by someone who understands the reality of self-employment firsthand. Like many others, we
        faced the same challenges: keeping records, understanding expenses, and making sure everything is submitted
        correctly and on time. It often felt like too much time was spent on paperwork instead of focusing on the actual
        work that earns a living.
      </LegalP>

      <LegalP>That&apos;s where the idea for SelfSubmit began.</LegalP>

      <LegalP>
        Working closely with an experienced and trusted accountant, we set out to build a simple, practical solution
        designed specifically for self-employed professionals. Our goal was clear: create a system that removes
        confusion, reduces errors, and makes monthly income submission straightforward and accessible to everyone.
      </LegalP>

      <LegalP>
        SelfSubmit is built to support a wide range of self-employed individuals — from drivers and barbers to
        tradespeople and freelancers. Instead of complex accounting tools, we provide clean, easy-to-use forms tailored
        to your type of work, with your most common expenses already included.
      </LegalP>

      <LegalH2 id="focus">We focus on what matters most</LegalH2>
      <LegalUl>
        <li>Simplicity over complexity</li>
        <li>Clarity over confusion</li>
        <li>Efficiency over wasted time</li>
      </LegalUl>

      <LegalP>
        Our mission is to help you stay organised, remain compliant, and submit your records with confidence — without
        needing to become an expert in accounting.
      </LegalP>

      <LegalP>
        At the end of the day, you should be able to spend your time growing your business, serving your customers, and
        doing what you do best.
      </LegalP>

      <LegalP>We&apos;ll take care of making the submission process simple.</LegalP>

      <LegalP>
        <strong>SelfSubmit — making tax submission straightforward for the self-employed.</strong>
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
        described on marketing copy as &quot;MTD compliant&quot; or &quot;submit&quot; reflects the{" "}
        <strong>intended direction</strong> of the product, not a certified integration unless we state otherwise on a
        dated release note.
      </LegalP>

      <LegalH2>Company information</LegalH2>
      <CompanyDetails />

      <LegalH2>Contact</LegalH2>
      <LegalP>
        For product questions or partnerships, email{" "}
        <a
          href={`mailto:${COMPANY.supportEmail}`}
          className="font-semibold text-brand-green underline underline-offset-2"
        >
          {COMPANY.supportEmail}
        </a>{" "}
        or see our{" "}
        <Link href="/contact" className="text-brand-green underline underline-offset-2">
          Contact
        </Link>{" "}
        page.
      </LegalP>

      <LegalFooterNav />
    </LegalPageShell>
  );
}
