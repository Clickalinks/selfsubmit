import "@/lib/clerk-env";

import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";

import { ComplianceDisclaimerBanner } from "@/components/ComplianceDisclaimerBanner";
import { SessionInactivityGuard } from "@/components/auth/SessionInactivityGuard";
import { clerkProviderProxyUrl, reconcileClerkProxyEnv } from "@/lib/clerk-env";

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
  title: "SelfSubmit — Simple tax returns for the self-employed",
  description:
    "UK self-employed monthly submissions, PDFs, and your accountant — built for taxi drivers, barbers, driving instructors, and more.",
  applicationName: "SelfSubmit",
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
            "setup-mfa": "/dashboard/settings?mfa=required",
            "reset-password": "/dashboard/settings",
          }}
        >
          <SessionInactivityGuard />
          <ComplianceDisclaimerBanner />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
