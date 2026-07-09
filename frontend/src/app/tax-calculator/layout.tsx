import type { Metadata } from "next";

import { pageCanonical, defaultOpenGraph, defaultTwitter } from "@/lib/seo";

export const metadata: Metadata = {
  title: "UK self-employed tax calculator — SelfSubmit",
  description:
    "Estimate income tax and National Insurance for UK self-employed sole traders. See how much to set aside using profession-specific expense categories.",
  alternates: pageCanonical("/tax-calculator"),
  openGraph: defaultOpenGraph({
    title: "UK self-employed tax calculator — SelfSubmit",
    description:
      "Estimate income tax and National Insurance for UK self-employed sole traders.",
    url: "/tax-calculator",
  }),
  twitter: defaultTwitter({
    title: "UK self-employed tax calculator — SelfSubmit",
    description:
      "Estimate income tax and National Insurance for UK self-employed sole traders.",
  }),
};

export default function TaxCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
