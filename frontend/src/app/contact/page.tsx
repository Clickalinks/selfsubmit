import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/components/landing/ContactForm";
import { SitePageHero, SitePageShell } from "@/components/landing/SitePageShell";
import { COMPANY } from "@/lib/company-details";

export const metadata: Metadata = {
  title: "Contact — SelfSubmit",
  description: "Contact SelfSubmit for product support, partnerships, or data protection requests.",
};

export default function ContactPage() {
  return (
    <SitePageShell>
      <SitePageHero
        eyebrow="Contact"
        title="Get in touch"
        description="Questions about your account, submissions, partnerships, or privacy — we aim to reply within two working days."
      />

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-brand-black">Send us a message</h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-muted sm:text-base">
            Fill in the form below and we will email you back. For company registration details, see our{" "}
            <Link href="/about" className="font-semibold text-brand-green underline-offset-2 hover:underline">
              About us
            </Link>{" "}
            page.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </section>

        <section className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-brand-black">Support</h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">
              Help with your account, subscriptions, receipts, or monthly submissions.
            </p>
            <a
              href={`mailto:${COMPANY.supportEmail}`}
              className="mt-3 inline-block text-sm font-semibold text-brand-green underline-offset-2 hover:underline"
            >
              {COMPANY.supportEmail}
            </a>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-brand-black">Privacy &amp; data rights</h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">
              Access, correction, erasure, or objection requests — choose &ldquo;Data protection request&rdquo; in the
              form or read our policies.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
              <Link href="/privacy" className="text-brand-green underline-offset-2 hover:underline">
                Privacy policy
              </Link>
              <Link href="/gdpr" className="text-brand-green underline-offset-2 hover:underline">
                GDPR
              </Link>
            </div>
          </div>
        </section>

        <p className="mt-8 text-center text-xs text-brand-muted">
          We do not publish a support phone line — please use the form or email.
        </p>
      </div>
    </SitePageShell>
  );
}
