import type { MetadataRoute } from "next";

import { MTD_CATEGORY_CONTENT } from "@/data/mtdCategoryContent";
import { PLAN_IDS } from "@/lib/plan-config";
import { getSiteUrl } from "@/lib/site-url";

const PUBLIC_STATIC_PATHS = [
  "",
  "/pricing",
  "/features",
  "/how-it-works",
  "/how-tax-due-works",
  "/business-types",
  "/tax-calculator",
  "/blog",
  "/faq",
  "/about",
  "/contact",
  "/partners",
  "/status",
  "/infrastructure",
  "/security",
  "/hmrc-agent",
  "/terms",
  "/privacy",
  "/cookies",
  "/gdpr",
  "/dpa",
  "/acceptable-use",
  "/anti-fraud",
  "/cancellation",
  "/refund",
  "/disclaimer",
  "/copyright",
  "/trademark",
  "/data-retention",
  "/accessibility",
  "/responsible-disclosure",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_STATIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: path === "" || path === "/pricing" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/pricing" || path === "/features" ? 0.9 : 0.7,
  }));

  const mtdEntries: MetadataRoute.Sitemap = MTD_CATEGORY_CONTENT.map((guide) => ({
    url: `${base}/mtd/${guide.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const planEntries: MetadataRoute.Sitemap = PLAN_IDS.map((planId) => ({
    url: `${base}/pricing/${planId}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  return [...staticEntries, ...mtdEntries, ...planEntries];
}
