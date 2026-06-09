import type { Metadata } from "next";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

import { LoginProtectionGuard } from "@/components/auth/LoginProtectionGuard";

export const metadata: Metadata = {
  title: "Sign in — SelfSubmit",
  description: "Sign in to SelfSubmit with Clerk (email, password, passkeys when enabled in Clerk).",
};

const clerkAppearance = {
  variables: {
    colorPrimary: "#14a44d",
    colorText: "#1a1d1f",
    colorTextSecondary: "#5c5c5c",
    borderRadius: "0.75rem",
  },
  elements: {
    card: "shadow-card",
    formButtonPrimary: "bg-brand-green hover:bg-brand-green-dark",
    footerActionLink: "text-brand-green hover:text-brand-green-dark",
    headerTitle: "text-brand-black",
    socialButtonsBlockButton: "border-black/15",
  },
} as const;

export default function SignInPage() {
  return (
    <div className="min-h-screen pb-16 sm:pb-20">
      <div className="border-b border-black/10 bg-white/80 shadow-sm shadow-black/[0.04] backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:px-10">
          <Link href="/" className="text-sm font-semibold text-brand-green underline-offset-4 hover:underline">
            ← Home
          </Link>
          <span className="text-sm font-medium text-brand-muted">Sign in</span>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-content justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-14">
        <div className="w-full max-w-md [&_.cl-rootBox]:mx-auto [&_.cl-card]:w-full">
          <p className="mb-4 text-center text-sm text-brand-muted sm:mb-6">
            Returning client? Sign in below.{" "}
            <Link href="/sign-up" className="font-semibold text-brand-green hover:underline">
              New here? Register as a client
            </Link>
          </p>
          <LoginProtectionGuard>
            <SignIn
              appearance={clerkAppearance}
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              fallbackRedirectUrl="/dashboard"
              forceRedirectUrl="/dashboard"
            />
          </LoginProtectionGuard>
        </div>
      </div>
    </div>
  );
}
