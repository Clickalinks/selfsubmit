import "@/lib/clerk-env";

import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";

import { ComplianceDisclaimerBanner } from "@/components/ComplianceDisclaimerBanner";
import { clerkProviderProxyUrl, reconcileClerkProxyEnv } from "@/lib/clerk-env";

import "./globals.css";

/** Avoid Clerk touching `window` during static generation of MTD pages. */
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
          signUpFallbackRedirectUrl="/onboarding"
          afterSignOutUrl="/"
        >
          <ComplianceDisclaimerBanner />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
