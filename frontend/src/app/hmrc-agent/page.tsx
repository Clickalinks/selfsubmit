import type { Metadata } from "next";
import Link from "next/link";

import { pageCanonical, defaultOpenGraph, defaultTwitter } from "@/lib/seo";

export const metadata: Metadata = {
  title: "HMRC recognised agent — SelfSubmit",
  description:
    "Information about SelfSubmit and HMRC agent services for Making Tax Digital quarterly updates.",
  alternates: pageCanonical("/hmrc-agent"),
  openGraph: defaultOpenGraph({
    title: "HMRC recognised agent — SelfSubmit",
    url: "/hmrc-agent",
  }),
  twitter: defaultTwitter({
    title: "HMRC recognised agent — SelfSubmit",
  }),
};

export default function HmrcAgentPage() {
  return (
    <main className="mx-auto max-w-prose px-5 py-16">
      <p className="text-sm text-brand-muted">
        <Link href="/" className="font-medium text-brand-green underline">
          ← Back to home
        </Link>
      </p>
      <h1 className="mt-6 text-3xl font-bold text-brand-black">HMRC recognised agent</h1>
      <p className="mt-4 text-brand-muted">Information about our HMRC agent status will go here.</p>
    </main>
  );
}
