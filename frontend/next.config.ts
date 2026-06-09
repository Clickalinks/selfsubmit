import type { NextConfig } from "next";

/** Clerk FAPI + accounts hosts for dev (*.clerk.accounts.dev) and production (clerk.yourdomain.com). */
function clerkCspOrigins(): string[] {
  const origins = ["https://*.clerk.accounts.dev", "https://*.clerk.com"];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return origins;

  try {
    const apex = new URL(appUrl).hostname.replace(/^www\./, "");
    if (apex !== "localhost" && apex !== "127.0.0.1") {
      origins.push(`https://clerk.${apex}`, `https://accounts.${apex}`);
    }
  } catch {
    // ignore invalid NEXT_PUBLIC_APP_URL
  }

  return origins;
}

const clerkOrigins = clerkCspOrigins().join(" ");

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${clerkOrigins} https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https: https://img.clerk.com",
  "font-src 'self' data:",
  `connect-src 'self' ${clerkOrigins} https://api.stripe.com https://*.sentry.io https://clerk-telemetry.com https://*.clerk-telemetry.com`,
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
