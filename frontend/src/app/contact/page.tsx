import type { Metadata } from "next";
import Link from "next/link";

import { LegalFooterNav, LegalH2, LegalP, LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Contact — SelfSubmit",
  description: "How to reach SelfSubmit about the product, partnerships, or privacy queries.",
};

export default function ContactPage() {
  return (
    <LegalPageShell
      title="Contact"
      description="We will publish a monitored inbox for SelfSubmit before launch. Until then, this page sets expectations."
      lastUpdated="16 April 2026"
    >
      <LegalH2>General enquiries</LegalH2>
      <LegalP>
        Placeholder: replace with your real support email (for example{" "}
        <span className="font-mono text-brand-black">hello@selfsubmit.example</span>) and optional phone or ticketing
        link when you go live.
      </LegalP>

      <LegalH2>Privacy &amp; data rights</LegalH2>
      <LegalP>
        For requests about personal data (access, correction, erasure, objection), please use the contact route you
        publish alongside your privacy information, or see our{" "}
        <Link href="/privacy" className="text-brand-green underline underline-offset-2">
          Privacy policy
        </Link>{" "}
        and{" "}
        <Link href="/gdpr" className="text-brand-green underline underline-offset-2">
          GDPR &amp; data protection
        </Link>{" "}
        pages.
      </LegalP>

      <LegalFooterNav />
    </LegalPageShell>
  );
}
