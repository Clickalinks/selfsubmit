import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  Check,
  CreditCard,
  FileText,
  Landmark,
  Receipt,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { SitePageHero, SitePageShell } from "@/components/landing/SitePageShell";
import {
  GOVUK_MTD_ITSA_ELIGIBILITY,
  GOVUK_PERSONAL_TAX_ACCOUNT,
} from "@/lib/govuk-mtd-links";
import { defaultOpenGraph, defaultTwitter, pageCanonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "How to use SelfSubmit",
  description:
    "A simple step-by-step guide to SelfSubmit: create an account, keep monthly Making Tax Digital records, store receipts, and connect HMRC when you are ready.",
  alternates: pageCanonical("/how-to-use"),
  openGraph: defaultOpenGraph({
    title: "How to use SelfSubmit",
    description:
      "A simple step-by-step guide to SelfSubmit before you sign up: account, monthly records, receipts, and HMRC.",
    url: "/how-to-use",
  }),
  twitter: defaultTwitter({
    title: "How to use SelfSubmit",
    description:
      "A simple step-by-step guide to SelfSubmit before you sign up: account, monthly records, receipts, and HMRC.",
  }),
};

type Step = {
  n: string;
  title: string;
  summary: string;
  details: string[];
  Icon: LucideIcon;
};

const STEPS: Step[] = [
  {
    n: "1",
    title: "Create your account",
    summary: "Open Sign up and complete one form: personal details, business address, email, and password.",
    details: [
      "Enter your name, home address, phone number, and email.",
      "If you work from home, tick that your business address is the same.",
      "Choose a password of at least 12 characters. You pick your trade later, after the plan.",
    ],
    Icon: UserPlus,
  },
  {
    n: "2",
    title: "Confirm your email and turn on two-step verification",
    summary: "We ask you to verify your email, then set up two-step verification so only you can open the account.",
    details: [
      "Use the code or link we send to your email.",
      "Follow the two-step verification screen before you continue.",
      "Keep your phone or authenticator app somewhere you can reach it when you sign in.",
    ],
    Icon: ShieldCheck,
  },
  {
    n: "3",
    title: "Choose a plan and start the trial",
    summary: "Plans differ only by how many businesses you need. Every plan includes the same record-keeping tools.",
    details: [
      "Solo is one business (£20/month after the trial). Add more businesses on Business Plus, Professional, or Portfolio.",
      "New first-time subscribers get a 3-month free trial. A card is taken at checkout; you are not charged during the trial if you cancel before it ends.",
      "After checkout you are taken to add your business.",
    ],
    Icon: CreditCard,
  },
  {
    n: "4",
    title: "Add your business and pick your trade",
    summary: "Select the profession that matches how you work. SelfSubmit then loads income and expense lines for that trade.",
    details: [
      "Use your trading name if you have one, or your own name.",
      "Landlords: choose a UK property / rental type so rent and property costs appear on the form.",
      "On the Solo plan this trade is locked in, so pick the one you actually use.",
    ],
    Icon: Building2,
  },
  {
    n: "5",
    title: "Save each month’s income and expenses",
    summary: "This is the main habit. Open the monthly form, choose the period, and save your lines. Totals run as you go.",
    details: [
      "From your dashboard, open monthly income and expenses.",
      "Set the month, then add what you earned and what you spent, using the categories for your trade.",
      "You do not need to connect a bank. Type the figures, or import a CSV if you already keep a spreadsheet.",
      "If you use a vehicle, choose actual costs or HMRC simplified mileage where allowed — do not mix both for the same vehicle in the same period.",
    ],
    Icon: FileText,
  },
  {
    n: "6",
    title: "Keep receipts with the same records",
    summary: "Attach photos or PDFs to expense lines so evidence sits with the figure, not in a separate folder.",
    details: [
      "Upload a photo or PDF when you save an expense you need to prove.",
      "Files stay in your account so you can find them later if HMRC asks.",
      "A filename or short note on a photo is useful. Keep records for as long as HMRC requires (typically six years).",
    ],
    Icon: Receipt,
  },
  {
    n: "7",
    title: "Connect HMRC when you are ready",
    summary: "You can keep monthly records first. Connect HMRC from the dashboard when you want obligations and a business link.",
    details: [
      "Have your Government Gateway sign-in, Unique Taxpayer Reference (UTR), and National Insurance number.",
      "Authorise SelfSubmit, then link each SelfSubmit business to the matching HMRC income source (self-employment or UK property).",
      "You remain responsible for using the correct HMRC account and figures.",
    ],
    Icon: Landmark,
  },
  {
    n: "8",
    title: "Prepare your quarterly update",
    summary: "Your months roll into quarterly totals. Preview them on the dashboard before anything is sent.",
    details: [
      "Check every figure. Quarterly updates are a summary of the period — they are not your tax bill.",
      "Live send to HMRC is turned on after a controlled pilot. Until then you still keep the records so you are ready.",
      "SelfSubmit does not yet submit a Final Declaration at year end. Use your HMRC Personal Tax Account or other compatible software for that step.",
    ],
    Icon: CalendarDays,
  },
];

const NEED_ITEMS = [
  "An email address you check",
  "A payment card for the trial (no charge for 3 months if you cancel in time)",
  "The name of your trade, or that you are a landlord",
  "Later, for HMRC: Government Gateway, UTR, and National Insurance number",
];

const NOT_NEEDED = [
  "A bank feed or Open Banking connection",
  "An accountant login",
  "VAT software inside SelfSubmit",
];

export default function HowToUsePage() {
  return (
    <SitePageShell>
      <SitePageHero
        eyebrow="Guide"
        title="How to use SelfSubmit"
        description="Read this before you sign up. Eight steps from creating an account to keeping monthly Making Tax Digital records."
      />

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-brand-black sm:text-xl">Before you start</h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-muted sm:text-base">
            SelfSubmit is for UK self-employed people and landlords who want digital income and expense records without
            a full accounts package. You stay responsible for accurate figures and for tax you owe. This is not tax
            advice. Confirm whether Making Tax Digital applies to you on{" "}
            <a
              href={GOVUK_MTD_ITSA_ELIGIBILITY}
              className="font-semibold text-brand-green underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              GOV.UK
            </a>
            .
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-green">You will need</p>
              <ul className="mt-3 space-y-2">
                {NEED_ITEMS.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-brand-black/90">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2.5} aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-green">You will not need</p>
              <ul className="mt-3 space-y-2">
                {NOT_NEEDED.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-brand-black/90">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2.5} aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <nav aria-label="Guide steps" className="mt-10">
          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STEPS.map((step) => (
              <li key={step.n}>
                <a
                  href={`#step-${step.n}`}
                  className="flex h-full items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50 px-3 py-2.5 text-left no-underline transition hover:border-brand-green/40 hover:bg-brand-mint/50"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-green text-xs font-bold text-white">
                    {step.n}
                  </span>
                  <span className="text-xs font-semibold leading-snug text-brand-black">{step.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <ol className="mt-12 space-y-8">
          {STEPS.map((step) => {
            const Icon = step.Icon;
            return (
              <li
                key={step.n}
                id={`step-${step.n}`}
                className="scroll-mt-28 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-mint text-brand-green ring-1 ring-brand-green/15">
                    <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-green">Step {step.n}</p>
                    <h2 className="mt-1 text-xl font-bold text-brand-black sm:text-2xl">{step.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-brand-muted sm:text-base">{step.summary}</p>
                    <ul className="mt-4 space-y-2">
                      {step.details.map((line) => (
                        <li key={line} className="flex items-start gap-2 text-sm leading-relaxed text-brand-black/90">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2.5} aria-hidden />
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-brand-black sm:text-xl">What SelfSubmit does not do yet</h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-brand-black/90">
            <li>It does not file your VAT return.</li>
            <li>
              It does not submit your year-end Final Declaration. After the tax year, use your{" "}
              <a
                href={GOVUK_PERSONAL_TAX_ACCOUNT}
                className="font-semibold text-brand-green underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                HMRC Personal Tax Account
              </a>{" "}
              or other compatible software.
            </li>
            <li>
              The tax calculator is an estimate only. Official tax due appears in your HMRC account.
            </li>
            <li>You remain responsible for checking every figure before you save or send.</li>
          </ul>
        </section>

        <div className="mt-10 rounded-2xl border border-brand-green/25 bg-brand-mint/40 px-6 py-8 text-center sm:px-10">
          <h2 className="text-lg font-bold text-brand-black sm:text-xl">Ready to start?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-brand-muted sm:text-base">
            Create an account, pick a plan, and save your first month. 3-month free trial for new first-time
            subscribers.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-full bg-brand-green px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-green-dark"
            >
              Create your account
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-brand-black transition hover:bg-slate-50"
            >
              View pricing
            </Link>
          </div>
        </div>
      </div>
    </SitePageShell>
  );
}
