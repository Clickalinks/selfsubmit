import { MonthlyExpenseForm } from "@/components/forms/MonthlyExpenseForm";
import { getActiveBusinessContext, persistActiveBusinessCookie } from "@/lib/active-business";
import { assertSubmitFormAccess, requireClerkUserId } from "@/server/subscription-guards";
import { requireMfaEnabled } from "@/server/mfa-guards";

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
        <p className="text-sm text-brand-muted">Add a business before submitting your return.</p>
      </div>
    );
  }

  await persistActiveBusinessCookie(activeBusiness.id);

  return (
    <MonthlyExpenseForm
      key={activeBusiness.id}
      activeBusiness={activeBusiness}
      businesses={businesses}
      allowBusinessSwitch={canSwitchBusiness}
    />
  );
}
