import { COMPANY } from "@/lib/company-details";
import { absoluteUrl } from "@/lib/seo";

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY.tradingName,
    legalName: COMPANY.legalName,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/icon-512.png"),
    email: COMPANY.supportEmail,
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.registeredOffice.line1,
      addressLocality: COMPANY.registeredOffice.city,
      postalCode: COMPANY.registeredOffice.postcode,
      addressCountry: "GB",
    },
    sameAs: [COMPANY.websiteUrl],
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: COMPANY.tradingName,
    url: absoluteUrl("/"),
    description:
      "UK self-employed Making Tax Digital record keeping, quarterly updates, and submission support.",
    publisher: {
      "@type": "Organization",
      name: COMPANY.tradingName,
      url: absoluteUrl("/"),
    },
  };
}
