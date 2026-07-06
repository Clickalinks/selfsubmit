import type { Metadata } from "next";
import Link from "next/link";

import { SitePageHero, SitePageShell } from "@/components/landing/SitePageShell";
import { COMPANY } from "@/lib/company-details";

export const metadata: Metadata = {
  title: "Partners — SelfSubmit",
  description:
    "Partner with SelfSubmit — for accountants, bookkeepers, and advisers supporting self-employed clients with MTD.",
};

export default function PartnersPage() {
  return (
    <SitePageShell>
      <SitePageHero
        eyebrow="Partners"
        title="Work with SelfSubmit"
        description="We are building relationships with accountants and bookkeepers who support self-employed clients through Making Tax Digital."
      />

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <section>
          <h2 className="text-xl font-bold text-brand-black">Who we partner with</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-brand-muted sm:text-base">
            <li>Accountants and tax advisers with self-employed and landlord clients</li>
            <li>Bookkeepers who prepare quarterly MTD updates</li>
            <li>Professional bodies and training providers covering MTD ITSA</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-brand-black">What partners get today</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-brand-muted sm:text-base">
            <li>Clients can export records and share submission history from their dashboard</li>
            <li>Profession-specific forms that match how trades actually record income and expenses</li>
            <li>Clear separation between multiple businesses on higher-tier plans</li>
            <li>Early access conversations as we expand adviser tooling</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-brand-black">Coming next</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-brand-muted sm:text-base">
            We are exploring dedicated partner onboarding, referral arrangements, and read-only adviser access. These
            programmes are not open for general sign-up yet — register your interest and we will contact you when a fit
            is available.
          </p>
        </section>

        <div className="mt-10 rounded-2xl border border-brand-green/25 bg-brand-mint/40 px-5 py-6 sm:px-8">
          <h2 className="text-lg font-bold text-brand-black">Register interest</h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-muted sm:text-base">
            Email{" "}
            <a
              href={`mailto:${COMPANY.supportEmail}?subject=Partner%20enquiry`}
              className="font-semibold text-brand-green underline underline-offset-2"
            >
              {COMPANY.supportEmail}
            </a>{" "}
            with the subject line &ldquo;Partner enquiry&rdquo;. Include your firm name, number of MTD clients, and
            how you would like to work with SelfSubmit.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/features"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-brand-black transition hover:bg-slate-50"
            >
              View features
            </Link>
            <Link
              href="/security"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-brand-black transition hover:bg-slate-50"
            >
              Security overview
            </Link>
          </div>
        </div>
      </div>
    </SitePageShell>
  );
}
