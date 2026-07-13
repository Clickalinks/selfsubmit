import "@/lib/clerk-env";

import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";

import { SessionInactivityGuard } from "@/components/auth/SessionInactivityGuard";
import { ComplianceDisclaimerBanner } from "@/components/ComplianceDisclaimerBanner";
import { CookieConsentBanner } from "@/components/legal/CookieConsentBanner";
import { clerkProviderProxyUrl, reconcileClerkProxyEnv } from "@/lib/clerk-env";
import { defaultOpenGraph, defaultTwitter } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

/** Avoid Clerk touching `window` during static generation of MTD pages. */
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16a34a" },
    { media: "(prefers-color-scheme: dark)", color: "#16a34a" },
  ],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "SelfSubmit — MTD record keeping for UK self-employed",
    template: "%s",
  },
  description:
    "SelfSubmit helps UK self-employed people and landlords keep digital records, track income and expenses, and prepare Making Tax Digital quarterly updates.",
  applicationName: "SelfSubmit",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: defaultOpenGraph(),
  twitter: defaultTwitter(),
  appleWebApp: {
    capable: true,
    title: "SelfSubmit",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: [{ url: "/favicon-32.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkProxyOverride = clerkProviderProxyUrl();
  reconcileClerkProxyEnv();

  return (
    <html lang="en-GB" className={inter.variable}>
      <body className="min-h-screen min-h-[100dvh] font-sans antialiased supports-[padding:max(0px)]:pl-[max(0px,env(safe-area-inset-left))] supports-[padding:max(0px)]:pr-[max(0px,env(safe-area-inset-right))]">
        <ClerkProvider
          {...(clerkProxyOverride ? { proxyUrl: clerkProxyOverride } : {})}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/sign-up"
          afterSignOutUrl="/"
          taskUrls={{
            "setup-mfa": "/setup-mfa?mfa=required&return_url=/sign-up",
            "reset-password": "/dashboard/settings",
          }}
        >
          <SessionInactivityGuard />
          <ComplianceDisclaimerBanner />
          <CookieConsentBanner />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
