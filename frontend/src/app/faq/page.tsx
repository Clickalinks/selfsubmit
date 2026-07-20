import type { Metadata } from "next";
import Link from "next/link";

import { FaqList } from "@/components/marketing/FaqList";
import { SitePageHero, SitePageShell } from "@/components/landing/SitePageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQ_ITEMS } from "@/data/faqItems";
import { buildFaqPageJsonLd } from "@/lib/faq-jsonld";
import { COMPANY } from "@/lib/company-details";
import { pageCanonical, defaultOpenGraph, defaultTwitter } from "@/lib/seo";

export const metadata: Metadata = {
  title: "FAQ — SelfSubmit",
  description: "Frequently asked questions about SelfSubmit, MTD quarterly updates, pricing, receipts, and support.",
  alternates: pageCanonical("/faq"),
  openGraph: defaultOpenGraph({
    title: "FAQ — SelfSubmit",
    description: "Frequently asked questions about SelfSubmit, MTD quarterly updates, pricing, receipts, and support.",
    url: "/faq",
  }),
  twitter: defaultTwitter({
    title: "FAQ — SelfSubmit",
    description: "Frequently asked questions about SelfSubmit, MTD quarterly updates, pricing, receipts, and support.",
  }),
};

export default function FaqPage() {
  return (
    <SitePageShell>
      <JsonLd data={buildFaqPageJsonLd(FAQ_ITEMS)} />
      <SitePageHero
        eyebrow="Help"
        title="Frequently asked questions"
        description="Answers on SelfSubmit, Making Tax Digital, and subscriptions."
      />

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <FaqList items={FAQ_ITEMS} />

        <div className="mt-10 rounded-2xl border border-slate-200/80 bg-slate-50 px-5 py-6 text-center sm:px-8">
          <p className="text-sm text-brand-muted sm:text-base">Need further help?</p>
          <p className="mt-2 text-base font-semibold text-brand-black">
            Email{" "}
            <a
              href={`mailto:${COMPANY.supportEmail}`}
              className="text-brand-green underline underline-offset-2"
            >
              {COMPANY.supportEmail}
            </a>
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-block text-sm font-semibold text-brand-green underline-offset-2 hover:underline"
          >
            Contact page →
          </Link>
        </div>
      </div>
    </SitePageShell>
  );
}
