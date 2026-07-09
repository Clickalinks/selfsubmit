import type { Metadata } from "next";

import { getSiteUrl } from "@/lib/site-url";

export const DEFAULT_OG_IMAGE_PATH = "/landing/hero-banner.png";

export const NOINDEX_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = getSiteUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageCanonical(path: string): Metadata["alternates"] {
  return { canonical: absoluteUrl(path) };
}

export function defaultOpenGraph(overrides?: Partial<NonNullable<Metadata["openGraph"]>>): Metadata["openGraph"] {
  return {
    type: "website",
    locale: "en_GB",
    url: getSiteUrl(),
    siteName: "SelfSubmit",
    images: [
      {
        url: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
        alt: "SelfSubmit — MTD record keeping for UK self-employed",
      },
    ],
    ...overrides,
  };
}

export function defaultTwitter(overrides?: Partial<NonNullable<Metadata["twitter"]>>): Metadata["twitter"] {
  return {
    card: "summary_large_image",
    images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    ...overrides,
  };
}
