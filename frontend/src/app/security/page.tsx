import type { Metadata } from "next";

import Link from "next/link";

import { Check } from "lucide-react";



import { SitePageHero, SitePageShell } from "@/components/landing/SitePageShell";

import { COMPANY } from "@/lib/company-details";

import { SECURITY_FEATURES } from "@/lib/security-checklist";

import {

  DEFAULT_SESSION_INACTIVITY_MINUTES,

  DEFAULT_SESSION_WARN_MINUTES,

} from "@/lib/session-config";



export const metadata: Metadata = {

  title: "Security — SelfSubmit",

  description:

    "Account security at SelfSubmit: password hashing, 2FA, lockouts, session expiry, login history, and encryption for tax data.",

};



export default function SecurityPage() {

  return (

    <SitePageShell>

      <SitePageHero

        eyebrow="Trust"

        title="Security at SelfSubmit"

        description="We protect your account and tax records with layered authentication, monitoring, and encryption. Manage your security from Dashboard → Settings."

      />



      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">

        <section>

          <h2 className="text-xl font-bold text-brand-black">Account security features</h2>

          <p className="mt-3 text-[15px] leading-relaxed text-brand-muted sm:text-base">

            The following controls are built into SelfSubmit today:

          </p>

          <ul className="mt-6 space-y-4">

            {SECURITY_FEATURES.map((feature) => (

              <li

                key={feature.id}

                className="flex gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-4 sm:px-5"

              >

                <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" strokeWidth={2.5} aria-hidden />

                <div>

                  <p className="font-semibold text-brand-black">{feature.title}</p>

                  <p className="mt-1 text-sm leading-relaxed text-brand-muted">{feature.summary}</p>

                </div>

              </li>

            ))}

          </ul>

          <p className="mt-4 text-sm text-brand-muted">

            Session inactivity defaults to {DEFAULT_SESSION_INACTIVITY_MINUTES} minutes with a{" "}

            {DEFAULT_SESSION_WARN_MINUTES}-minute warning. Signed-in users can review login history and alerts under{" "}

            <Link href="/dashboard/settings" className="font-semibold text-brand-green underline underline-offset-2">

              Settings

            </Link>

            .

          </p>

        </section>



        <section className="mt-10">

          <h2 className="text-xl font-bold text-brand-black">Encryption &amp; storage</h2>

          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-brand-muted sm:text-base">

            <li>All traffic uses HTTPS (TLS encryption in transit)</li>

            <li>

              Sensitive tax identifiers (UTR and National Insurance number) are encrypted at the application layer before

              storage

            </li>

            <li>Receipts and documents are stored in secure object storage linked to your account</li>

            <li>Submission history and business records are held in a managed PostgreSQL database</li>

          </ul>

        </section>



        <section className="mt-10">

          <h2 className="text-xl font-bold text-brand-black">Payments</h2>

          <p className="mt-4 text-[15px] leading-relaxed text-brand-muted sm:text-base">

            Card payments are processed by Stripe. SelfSubmit does not store your full card number. Billing uses

            Stripe&apos;s PCI-compliant checkout and customer portal.

          </p>

        </section>



        <section className="mt-10">

          <h2 className="text-xl font-bold text-brand-black">Infrastructure</h2>

          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-brand-muted sm:text-base">

            <li>Cloud application hosting with CDN and serverless infrastructure</li>

            <li>Managed PostgreSQL database hosting</li>

            <li>Authentication via Clerk; email via Resend; optional SMS reminders</li>

            <li>Technical error monitoring and reliability diagnostics</li>

          </ul>

        </section>



        <section className="mt-10">

          <h2 className="text-xl font-bold text-brand-black">Your responsibilities</h2>

          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-brand-muted sm:text-base">

            <li>Use a strong unique password and keep your authenticator app or email OTP access secure</li>

            <li>If you lose your phone, use email OTP or password reset to recover access</li>

            <li>Sign out on shared devices and report suspicious alerts promptly</li>

            <li>Ensure figures submitted to HMRC are accurate</li>

          </ul>

        </section>



        <section className="mt-10">

          <h2 className="text-xl font-bold text-brand-black">Report a vulnerability or incident</h2>

          <p className="mt-4 text-[15px] leading-relaxed text-brand-muted sm:text-base">

            Security researchers: see our{" "}

            <Link href="/responsible-disclosure" className="text-brand-green underline underline-offset-2">

              Responsible disclosure policy

            </Link>

            . Account concerns: email{" "}

            <a

              href={`mailto:${COMPANY.supportEmail}?subject=Security%20enquiry`}

              className="font-semibold text-brand-green underline underline-offset-2"

            >

              {COMPANY.supportEmail}

            </a>

            .

          </p>

        </section>



        <div className="mt-10 flex flex-wrap gap-4 border-t border-slate-200/80 pt-8 text-sm font-semibold">

          <Link href="/privacy" className="text-brand-green underline-offset-2 hover:underline">

            Privacy policy

          </Link>

          <Link href="/gdpr" className="text-brand-green underline-offset-2 hover:underline">

            GDPR &amp; data protection

          </Link>

          <Link href="/anti-fraud" className="text-brand-green underline-offset-2 hover:underline">

            Anti-fraud policy

          </Link>

          <Link href="/status" className="text-brand-green underline-offset-2 hover:underline">

            System status

          </Link>

        </div>

      </div>

    </SitePageShell>

  );

}


