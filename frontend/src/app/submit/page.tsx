import type { Metadata } from "next";

import { MonthlyExpenseForm } from "@/components/forms/MonthlyExpenseForm";
import { getActiveBusinessContext } from "@/lib/active-business";
import { NOINDEX_ROBOTS } from "@/lib/seo";
import { assertSubmitFormAccess, requireClerkUserId } from "@/server/subscription-guards";
import { requireMfaEnabled } from "@/server/mfa-guards";

export const metadata: Metadata = {
  title: "Monthly record — SelfSubmit",
  description: "Save your monthly income and expense records.",
  robots: NOINDEX_ROBOTS,
};

type Props = {
  searchParams: Promise<{ trade?: string; businessId?: string }>;
};

export default async function SubmitPage({ searchParams }: Props) {
  const userId = await requireClerkUserId("/submit");
  await requireMfaEnabled(userId, "/submit");
  await assertSubmitFormAccess(userId);

  const sp = await searchParams;
  const businessId = typeof sp.businessId === "string" ? sp.businessId.trim() : undefined;

  const { businesses, activeBusiness, canSwitchBusiness } = await getActiveBusinessContext(
    userId,
    businessId,
  );

  if (!activeBusiness) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-brand-muted">Add a business before saving monthly records.</p>
      </div>
    );
  }

  return (
    <MonthlyExpenseForm
      key={activeBusiness.id}
      activeBusiness={activeBusiness}
      businesses={businesses}
      allowBusinessSwitch={canSwitchBusiness}
    />
  );
}
