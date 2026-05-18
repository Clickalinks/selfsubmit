import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { SignUpWizard } from "@/components/auth/SignUpWizard";
import { resolveAuthenticatedDestination } from "@/lib/auth-redirect";

export const metadata: Metadata = {
  title: "Create account — SelfSubmit",
  description: "Register for SelfSubmit with your personal and business details.",
};

export default async function SignUpPage() {
  const { userId } = await auth();
  if (userId) {
    redirect(await resolveAuthenticatedDestination(userId));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 pb-16 sm:pb-20">
      <div className="border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:px-10">
          <Link href="/" className="text-sm font-semibold text-indigo-600 underline-offset-4 hover:underline">
            ← Home
          </Link>
          <span className="text-sm font-medium text-slate-500">New client registration</span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-content px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-14">
        <div className="mb-6 text-center sm:mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 sm:text-sm">New client</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">Join SelfSubmit</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500 sm:text-base">
            Complete all steps to create your client account — personal details, business information, then your login.
          </p>
        </div>
        <SignUpWizard />
      </div>
    </div>
  );
}
