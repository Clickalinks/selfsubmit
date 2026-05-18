import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/auth/OnboardingWizard";
import { resolveAuthenticatedDestination } from "@/lib/auth-redirect";

export const metadata: Metadata = {
  title: "Complete your profile — SelfSubmit",
  description: "Finish setting up your SelfSubmit client account.",
};

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/onboarding");
  }

  const destination = await resolveAuthenticatedDestination(userId);
  if (destination === "/dashboard") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 pb-20">
      <div className="border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-5 py-4 min-[900px]:px-10">
          <Link href="/" className="text-sm font-semibold text-indigo-600 underline-offset-4 hover:underline">
            ← Home
          </Link>
          <span className="text-sm font-medium text-slate-500">Complete profile</span>
        </div>
      </div>

      <div className="mx-auto px-5 py-10 min-[900px]:px-10 min-[900px]:py-14">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 min-[900px]:text-3xl">Almost there</h1>
          <p className="mt-2 text-sm text-slate-500">Add your details so we can set up your client dashboard.</p>
        </div>
        <OnboardingWizard />
      </div>
    </div>
  );
}
