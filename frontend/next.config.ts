import type { NextConfig } from "next";

/** Production apex domains — Clerk custom hosts are clerk.{apex} and accounts.{apex}. */
const PRODUCTION_SITE_APEX_DOMAINS = ["selfsubmit.co.uk"] as const;

function normalizeApex(hostname: string): string | null {
  const apex = hostname.replace(/^www\./, "").trim().toLowerCase();
  if (!apex || apex === "localhost" || apex === "127.0.0.1" || apex.endsWith(".vercel.app")) {
    return null;
  }
  return apex;
}

function apexFromUrl(value: string | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const host = value.includes("://") ? new URL(value).hostname : value.split("/")[0];
    return normalizeApex(host);
  } catch {
    return normalizeApex(value);
  }
}

/** Clerk FAPI + accounts hosts for dev (*.clerk.accounts.dev) and production (clerk.yourdomain.com). */
function clerkCspOrigins(): string[] {
  const origins = new Set<string>([
    "https://*.clerk.accounts.dev",
    "https://*.clerk.com",
    "https://challenges.cloudflare.com",
  ]);

  const explicitFapi = process.env.CLERK_FAPI_URL?.trim() || process.env.NEXT_PUBLIC_CLERK_FAPI_URL?.trim();
  if (explicitFapi) {
    try {
      origins.add(new URL(explicitFapi).origin);
    } catch {
      // ignore invalid CLERK_FAPI_URL
    }
  }

  const apexCandidates = [
    apexFromUrl(process.env.NEXT_PUBLIC_APP_URL),
    apexFromUrl(process.env.APP_URL),
    apexFromUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL),
    ...PRODUCTION_SITE_APEX_DOMAINS,
  ];

  for (const apex of apexCandidates) {
    if (!apex) continue;
    origins.add(`https://clerk.${apex}`);
    origins.add(`https://accounts.${apex}`);
    origins.add(`https://*.${apex}`);
  }

  return [...origins];
}

const clerkOrigins = clerkCspOrigins().join(" ");

const scriptSources = `'self' 'unsafe-inline' 'unsafe-eval' ${clerkOrigins}`;

const csp = [
  "default-src 'self'",
  `script-src ${scriptSources}`,
  `script-src-elem ${scriptSources}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https: https://img.clerk.com",
  "font-src 'self' data:",
  `connect-src 'self' ${clerkOrigins} https://api.stripe.com https://*.sentry.io https://clerk-telemetry.com https://*.clerk-telemetry.com wss:`,
  `frame-src 'self' ${clerkOrigins} https://js.stripe.com https://challenges.cloudflare.com`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(), payment=(self)",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@prisma/client", "prisma", "archiver"],
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
