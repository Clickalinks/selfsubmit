import type { Metadata } from "next";
import Link from "next/link";

import { SitePageHero, SitePageShell } from "@/components/landing/SitePageShell";
import { pageCanonical, defaultOpenGraph, defaultTwitter } from "@/lib/seo";

export const metadata: Metadata = {
  title: "HMRC software & agent services — SelfSubmit",
  description:
    "How SelfSubmit connects to HMRC for Making Tax Digital quarterly updates and what agent services mean for customers.",
  alternates: pageCanonical("/hmrc-agent"),
  openGraph: defaultOpenGraph({
    title: "HMRC software & agent services — SelfSubmit",
    url: "/hmrc-agent",
  }),
  twitter: defaultTwitter({
    title: "HMRC software & agent services — SelfSubmit",
  }),
};

export default function HmrcAgentPage() {
  return (
    <SitePageShell>
      <SitePageHero
        eyebrow="HMRC"
        title="HMRC connection & software"
        description="SelfSubmit is MTD record-keeping and quarterly update software. You authorise access through GOV.UK when you connect your HMRC account."
      />

      <div className="mx-auto max-w-3xl space-y-8 px-5 py-12 text-sm leading-relaxed text-brand-muted sm:px-8 sm:py-16 sm:text-base lg:px-10">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-brand-black">How HMRC connection works</h2>
          <p>
            From your dashboard you can connect your HMRC account, fetch obligations, link each SelfSubmit business to
            the matching HMRC income source, and submit cumulative quarterly updates when they are due.
          </p>
          <p>
            You sign in on GOV.UK to authorise SelfSubmit. We only access the HMRC data needed to show obligations and
            submit updates you request.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-brand-black">Software provider vs tax agent</h2>
          <p>
            SelfSubmit is <strong className="text-brand-black">software</strong> that helps you keep records and send
            quarterly updates. It is not a substitute for an accountant unless you separately appoint one.
          </p>
          <p>
            A recognised <strong className="text-brand-black">tax agent</strong> acts on your behalf with HMRC. If you
            use an accountant, they may use their own agent credentials — you do not need to make them an agent through
            SelfSubmit unless we explicitly offer that service.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-lg font-bold text-brand-black">Questions?</h2>
          <p className="mt-2">
            Email{" "}
            <a href="mailto:support@selfsubmit.co.uk" className="font-semibold text-brand-green underline-offset-2 hover:underline">
              support@selfsubmit.co.uk
            </a>{" "}
            or visit{" "}
            <Link href="/contact" className="font-semibold text-brand-green underline-offset-2 hover:underline">
              Contact
            </Link>
            . For official MTD rules, see{" "}
            <a
              href="https://www.gov.uk/guidance/making-tax-digital-for-income-tax"
              className="font-semibold text-brand-green underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              GOV.UK — Making Tax Digital for Income Tax
            </a>
            .
          </p>
        </section>

        <p>
          <Link href="/" className="font-semibold text-brand-green underline-offset-2 hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </SitePageShell>
  );
}
