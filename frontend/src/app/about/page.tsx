import type { Metadata } from "next";
import Link from "next/link";

import { SitePageHero, SitePageShell } from "@/components/landing/SitePageShell";
import { CompanyDetails } from "@/components/legal/CompanyDetails";
import { COMPANY } from "@/lib/company-details";

export const metadata: Metadata = {
  title: "About us — SelfSubmit",
  description:
    "SelfSubmit was founded by a self-employed taxi driver in Exeter to make Making Tax Digital straightforward — simple monthly records for UK sole traders.",
};

const WHO_WE_HELP = [
  "Taxi and private hire drivers",
  "Tradespeople",
  "Delivery drivers",
  "Barbers and hairdressers",
  "Freelancers",
  "Consultants",
  "Small business owners",
  "Anyone who wants a simpler way to manage business income and expenses",
] as const;

const VALUES = [
  { title: "Simplicity", text: "Easy-to-use software without unnecessary complexity." },
  { title: "Clarity", text: "Straightforward language and intuitive design." },
  { title: "Efficiency", text: "Helping you complete your records quickly and accurately." },
  { title: "Confidence", text: "Giving you the tools to stay organised and prepared for Making Tax Digital." },
] as const;

const CURRENT_FEATURES = [
  "Profession-led navigation and simple tools tailored to self-employed businesses.",
  "Monthly income and expense forms with built-in business expense categories.",
  "An illustrative tax calculator.",
  "HMRC guidance where relevant to help users understand common tax rules.",
] as const;

export default function AboutPage() {
  return (
    <SitePageShell>
      <SitePageHero
        eyebrow="About us"
        title="Making Tax Digital straightforward for the self-employed"
        description="Last updated: 21 April 2026"
      />

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <section className="space-y-4 text-sm leading-relaxed text-brand-muted sm:text-base">
          <p>
            At <strong className="text-brand-black">SelfSubmit</strong>, we believe managing your taxes should be simple,
            not stressful.
          </p>
          <p>
            SelfSubmit was founded by someone who understands self-employment from first-hand experience. As a
            self-employed taxi driver based in Exeter, Devon, I know how difficult it can be to balance serving
            customers, running a business, keeping accurate records, and staying on top of tax obligations.
          </p>
          <p>
            Alongside my work as a taxi driver, I have developed knowledge and experience in cybersecurity and software
            development. Those skills enabled me to build a solution to a problem I had experienced myself.
          </p>
          <p>
            While researching existing Making Tax Digital (MTD) software, I found that many platforms were designed like
            traditional accounting systems. Although they offer a wide range of features, they can often feel complex and
            overwhelming for sole traders who simply want an easy way to record their income and expenses.
          </p>
          <p>I believed there had to be a better, simpler approach.</p>
          <p className="font-semibold text-brand-black">That&apos;s why I created SelfSubmit.</p>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold text-brand-black sm:text-2xl">Why SelfSubmit?</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-brand-muted sm:text-base">
            <p>
              SelfSubmit has been designed specifically for busy self-employed people who want a straightforward way to
              prepare their monthly income and expenses for Making Tax Digital.
            </p>
            <p>
              Rather than asking you to learn complex accounting software, SelfSubmit guides you through clear,
              profession-focused forms that are quick to complete and easy to understand.
            </p>
            <p>
              Every feature has been designed with one goal in mind: to reduce unnecessary complexity. The platform
              focuses on the tools most self-employed people actually need, helping you keep accurate records without
              feeling overwhelmed by features designed for larger businesses.
            </p>
            <p>
              Whether you run one business or several, SelfSubmit helps you stay organised, save time, and prepare your
              records with confidence.
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
              See all supported business types →
            </Link>
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold text-brand-black sm:text-2xl">Our values</h2>
          <p className="mt-3 text-sm leading-relaxed text-brand-muted sm:text-base">
            Everything we build is guided by four simple principles:
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
              Our mission is to make Making Tax Digital more accessible for every self-employed person in the UK.
            </p>
            <p>
              We believe managing your business records shouldn&apos;t require accounting expertise. By simplifying the
              process, we help self-employed professionals spend less time on administration and more time focusing on
              the work that matters most.
            </p>
            <p>
              SelfSubmit exists to remove unnecessary barriers and provide a practical, affordable solution that supports
              self-employed businesses as tax reporting continues to evolve.
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
          <h2 className="text-xl font-bold text-brand-black sm:text-2xl">Product roadmap</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-brand-muted sm:text-base">
            <p>
              We&apos;re continuously improving SelfSubmit and adding new features to support the future of Making Tax
              Digital.
            </p>
            <p>
              Planned developments include secure user accounts, cloud storage, subscription management, and additional
              tools that make tax record-keeping even easier.
            </p>
            <p className="text-xs text-slate-600 sm:text-sm">
              Where SelfSubmit refers to Making Tax Digital or tax submission, this reflects the intended direction of
              the platform. Live submission to HMRC will only be described as available once officially implemented and
              supported.
            </p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold text-brand-black sm:text-2xl">Company information</h2>
          <p className="mt-3 text-sm leading-relaxed text-brand-muted sm:text-base">
            SelfSubmit is a trading name of <strong className="text-brand-black">Clicado Media UK Ltd</strong>,
            registered in England and Wales.
          </p>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <CompanyDetails />
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-brand-green/20 bg-brand-mint/50 p-6 text-center sm:p-8">
          <h2 className="text-xl font-bold text-brand-black sm:text-2xl">Contact us</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-brand-muted sm:text-base">
            If you have any questions, feedback, or partnership enquiries, we&apos;d be delighted to hear from you.
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
            Thank you for choosing SelfSubmit. We&apos;re committed to making tax record-keeping simpler, so you can
            spend more time doing what you do best — running your business.
          </p>
        </section>
      </div>
    </SitePageShell>
  );
}
