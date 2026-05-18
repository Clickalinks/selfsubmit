import type { Metadata } from "next";

import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { AddBusinessForm } from "@/components/subscription/AddBusinessForm";
import { requireClerkUserId, requireUserPlan } from "@/server/subscription-guards";

export const metadata: Metadata = {
  title: "Add business — SelfSubmit",
  description: "Create a business profile before opening the monthly return form.",
};

export default async function AddBusinessPage() {
  const userId = await requireClerkUserId("/add-business");
  await requireUserPlan(userId);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-content px-5 py-10 min-[900px]:px-10 min-[900px]:py-14">
        <h1 className="text-2xl font-bold text-brand-black min-[900px]:text-3xl">Add a business</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-muted min-[900px]:text-base">
          Each business is tied to a profession template. Plan limits are enforced on the server — you cannot add more
          than your plan allows.
        </p>
        <div className="mt-10">
          <AddBusinessForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
