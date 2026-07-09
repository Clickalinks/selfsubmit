import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { JsonLd } from "@/components/seo/JsonLd";
import { LandingView } from "@/components/landing/LandingView";
import { resolveAuthenticatedDestination } from "@/lib/auth-redirect";
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/organization-jsonld";
import { pageCanonical, defaultOpenGraph, defaultTwitter } from "@/lib/seo";
import { getOptionalUserId } from "@/lib/safe-auth";

export const metadata: Metadata = {
  title: {
    absolute: "SelfSubmit — MTD record keeping for UK self-employed",
  },
  description:
    "Keep digital records, track income and expenses, and prepare HMRC Making Tax Digital quarterly updates. Built for UK sole traders, freelancers, and landlords.",
  alternates: pageCanonical("/"),
  openGraph: defaultOpenGraph({
    title: "SelfSubmit — MTD record keeping for UK self-employed",
    description:
      "Keep digital records, track income and expenses, and prepare HMRC Making Tax Digital quarterly updates.",
    url: "/",
  }),
  twitter: defaultTwitter({
    title: "SelfSubmit — MTD record keeping for UK self-employed",
    description:
      "Keep digital records, track income and expenses, and prepare HMRC Making Tax Digital quarterly updates.",
  }),
};

export default async function Home() {
  const userId = await getOptionalUserId();
  if (userId) {
    redirect(await resolveAuthenticatedDestination(userId));
  }

  return (
    <>
      <JsonLd data={[buildOrganizationJsonLd(), buildWebSiteJsonLd()]} />
      <LandingView />
    </>
  );
}
