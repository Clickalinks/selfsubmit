import type { Metadata } from "next";
import Link from "next/link";

import { SitePageHero, SitePageShell } from "@/components/landing/SitePageShell";
import { CompanyDetails, IcoRegistrationSection } from "@/components/legal/CompanyDetails";
import { COMPANY } from "@/lib/company-details";

export const metadata: Metadata = {
  title: "About us — SelfSubmit",
  description:
    "SelfSubmit provides Making Tax Digital record-keeping for UK sole traders — founded in Exeter with a focus on clear monthly income and expense workflows.",
};

const WHO_WE_HELP = [
  "Taxi and private hire drivers",
  "Tradespeople",
  "Delivery drivers",
  "Barbers and hairdressers",
  "Freelancers",
  "Consultants",
  "Small business owners",
  "Self-employed professionals who need structured income and expense records",
] as const;

const VALUES = [
  { title: "Focus", text: "Tools for sole-trader MTD records, without unused accounting suite features." },
  { title: "Clarity", text: "Clear language and a structured interface for monthly reporting." },
  { title: "Efficiency", text: "Workflows designed for accurate records with minimal administration time." },
  { title: "Compliance readiness", text: "Organisation and evidence ready for Making Tax Digital obligations." },
] as const;

const CURRENT_FEATURES = [
  "Profession-specific navigation and forms for self-employed businesses.",
  "Monthly income and expense forms with built-in business expense categories.",
  "A UK self-employed tax calculator for indicative estimates.",
  "HMRC connection, quarterly update preparation, and secure document storage.",
] as const;

export default function AboutPage() {
  return (
    <SitePageShell>
      <SitePageHero
        eyebrow="About us"
        title="Making Tax Digital software for the self-employed"
        description="Last updated: 20 July 2026"
      />

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <section className="space-y-4 text-sm leading-relaxed text-brand-muted sm:text-base">
          <p>
            <strong className="text-brand-black">SelfSubmit</strong> is UK SaaS for Making Tax Digital (MTD) income and
            expense record-keeping, built for sole traders and similar self-employed businesses.
          </p>
          <p>
            The company was founded in Exeter, Devon, by a self-employed taxi driver with experience in cybersecurity
            and software development. SelfSubmit addresses a gap observed in practice: many existing MTD products
            resemble full accounting suites, which is more capability than most sole traders need for digital income and
            expense records.
          </p>
          <p>
            SelfSubmit was created as a focused alternative — structured monthly recording, profession-specific
            categories, and a path to HMRC quarterly updates — without requiring users to adopt a full accounting
            package.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold text-brand-black sm:text-2xl">Why SelfSubmit?</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-brand-muted sm:text-base">
            <p>
              SelfSubmit is designed for self-employed people who need a clear process to prepare monthly income and
              expenses for Making Tax Digital.
            </p>
            <p>
              Profession-focused forms guide income and expense entry so records can be maintained without learning a
              full accounting product.
            </p>
            <p>
              Features are prioritised around what most sole traders need for MTD readiness: accurate records, receipt
              evidence, and quarterly update preparation — not unused modules aimed at larger organisations.
            </p>
            <p>
              Whether you operate one business or several, SelfSubmit supports organised records and efficient
              preparation for reporting deadlines.
            </p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold text-brand-black sm:text-2xl">Who we help</h2>
          <p className="mt-3 text-sm leading-relaxed text-brand-muted sm:text-base">
            SelfSubmit is designed for self-employed professionals across the UK, including:
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {WHO_WE_HELP.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2.5 text-sm text-slate-800"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4">
            <Link href="/business-types" className="text-sm font-semibold text-brand-green underline-offset-2 hover:underline">
              View supported business types →
            </Link>
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold text-brand-black sm:text-2xl">Product principles</h2>
          <p className="mt-3 text-sm leading-relaxed text-brand-muted sm:text-base">
            Development is guided by four principles:
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {VALUES.map((value) => (
              <article
                key={value.title}
                className="rounded-2xl border border-brand-green/15 bg-brand-mint/40 p-5"
              >
                <h3 className="font-bold text-brand-forest">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-forest/90">{value.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold text-brand-black sm:text-2xl">Our mission</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-brand-muted sm:text-base">
            <p>
              Our mission is to make Making Tax Digital accessible and practical for self-employed people in the UK.
            </p>
            <p>
              Compliant digital records should not require formal accounting qualifications. By structuring the
              workflow, SelfSubmit helps professionals reduce administration time and focus on operating their
              business.
            </p>
            <p>
              We provide a practical, affordable platform that supports self-employed businesses as tax reporting
              requirements continue to evolve.
            </p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold text-brand-black sm:text-2xl">Current features</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-brand-muted sm:text-base">
            {CURRENT_FEATURES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-brand-black sm:text-2xl">Built for the long term</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-brand-muted sm:text-base">
            <p>
              SelfSubmit is a live subscription service with secure accounts, Stripe billing, receipt storage, monthly
              record-keeping, and HMRC quarterly update support.
            </p>
            <p>
              We continue to develop the platform as Making Tax Digital evolves — including production HMRC filing and
              GOV.UK software recognition when those approvals are complete.
            </p>
          </div>
        </section>

        <section id="company-information" className="mt-12">
          <h2 className="text-xl font-bold text-brand-black sm:text-2xl">Company information</h2>
          <p className="mt-3 text-sm leading-relaxed text-brand-muted sm:text-base">
            SelfSubmit is a trading name of <strong className="text-brand-black">Clicado Media UK Ltd</strong>,
            registered in England and Wales.
          </p>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <CompanyDetails />
          </div>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <h3 className="text-lg font-bold text-brand-black">ICO registration</h3>
            <IcoRegistrationSection className="mt-3" />
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-brand-green/20 bg-brand-mint/50 p-6 text-center sm:p-8">
          <h2 className="text-xl font-bold text-brand-black sm:text-2xl">Contact</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-brand-muted sm:text-base">
            For product questions, feedback, or partnership enquiries, contact us by email or via the contact page.
          </p>
          <p className="mt-4 text-sm text-brand-muted sm:text-base">
            Email{" "}
            <a
              href={`mailto:${COMPANY.supportEmail}`}
              className="font-semibold text-brand-green underline-offset-2 hover:underline"
            >
              {COMPANY.supportEmail}
            </a>{" "}
            or visit our{" "}
            <Link href="/contact" className="font-semibold text-brand-green underline-offset-2 hover:underline">
              Contact page
            </Link>
            .
          </p>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-brand-forest">
            Thank you for using SelfSubmit. We are committed to clear, reliable MTD record-keeping so you can focus on
            operating your business.
          </p>
        </section>
      </div>
    </SitePageShell>
  );
}
