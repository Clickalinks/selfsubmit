import type { Metadata } from "next";

import { PricingBanner } from "@/components/landing/PricingBanner";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { pageCanonical, defaultOpenGraph, defaultTwitter } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Pricing — SelfSubmit",
  description:
    "Simple MTD subscription plans for UK self-employed sole traders. All plans include income tracking, expense records, receipt uploads, and quarterly update support.",
  alternates: pageCanonical("/pricing"),
  openGraph: defaultOpenGraph({
    title: "Pricing — SelfSubmit",
    description:
      "Simple MTD subscription plans for UK self-employed sole traders.",
    url: "/pricing",
  }),
  twitter: defaultTwitter({
    title: "Pricing — SelfSubmit",
    description:
      "Simple MTD subscription plans for UK self-employed sole traders.",
  }),
};

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <PricingBanner interactive />
      </main>
      <SiteFooter />
    </div>
  );
}
