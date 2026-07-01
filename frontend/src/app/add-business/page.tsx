import type { Metadata } from "next";
import { Suspense } from "react";

import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { AddBusinessClientShell } from "@/components/subscription/AddBusinessClientShell";
import { requireClerkUserId, requireUserPlan } from "@/server/subscription-guards";
import { requireMfaEnabled } from "@/server/mfa-guards";

export const metadata: Metadata = {
  title: "Add business — SelfSubmit",
  description: "Create a business profile before opening the monthly return form.",
};

export default async function AddBusinessPage() {
  const userId = await requireClerkUserId("/add-business");
  await requireMfaEnabled(userId, "/add-business");
  await requireUserPlan(userId);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-content px-5 py-10 min-[900px]:px-10 min-[900px]:py-14">
        <h1 className="text-2xl font-bold text-brand-black min-[900px]:text-3xl">Choose your profession</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-muted min-[900px]:text-base">
          Pick the business type that matches your work. On the Solo plan this locks your income and expense
          categories — you will only see forms for that profession.
        </p>
        <div className="mt-10">
          <Suspense fallback={<p className="text-sm text-brand-muted">Loading…</p>}>
            <AddBusinessClientShell />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
