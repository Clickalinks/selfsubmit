import type { Metadata } from "next";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign in — SelfSubmit",
  description: "Sign in to SelfSubmit with Clerk (email, password, passkeys when enabled in Clerk).",
};

const clerkAppearance = {
  variables: {
    colorPrimary: "#00b050",
    colorText: "#000000",
    colorTextSecondary: "#5c5c5c",
    borderRadius: "0.75rem",
  },
  elements: {
    card: "shadow-card",
    formButtonPrimary: "bg-gradient-to-b from-[#00c85f] to-[#008f45] hover:opacity-95",
    footerActionLink: "text-[#00b050] hover:text-[#008f45]",
    headerTitle: "text-brand-black",
    socialButtonsBlockButton: "border-black/15",
  },
} as const;

export default function SignInPage() {
  return (
    <div className="min-h-screen pb-20">
      <div className="border-b border-black/10 bg-white/80 shadow-sm shadow-black/[0.04] backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-5 py-4 min-[900px]:px-10">
          <Link href="/" className="text-sm font-semibold text-brand-green underline-offset-4 hover:underline">
            ← Home
          </Link>
          <span className="text-sm font-medium text-brand-muted">Sign in</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-content justify-center px-5 py-10 min-[900px]:px-10 min-[900px]:py-14">
        <SignIn
          appearance={clerkAppearance}
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/"
          forceRedirectUrl="/"
        />
      </div>
    </div>
  );
}
