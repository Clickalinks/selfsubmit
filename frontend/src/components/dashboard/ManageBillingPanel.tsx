import { auth } from "@clerk/nextjs/server";

import { ManageBillingSection } from "@/components/dashboard/ManageBillingSection";
import { SubscriptionEndingBanner } from "@/components/dashboard/SubscriptionEndingBanner";
import { getSubscriptionState } from "@/lib/billing-server";
import { formatSubscriptionEndDate, subscriptionIsEnding } from "@/lib/subscription-ending";

export async function ManageBillingPanel() {
  const { userId } = await auth();
  if (!userId) return null;

  const subscription = await getSubscriptionState(userId);
  const ending = subscriptionIsEnding(subscription);
  const endDate = subscription.stripeCurrentPeriodEnd
    ? formatSubscriptionEndDate(subscription.stripeCurrentPeriodEnd)
    : null;

  return (
    <div className="space-y-4">
      {ending && endDate ? <SubscriptionEndingBanner endDate={endDate} /> : null}
      <ManageBillingSection />
    </div>
  );
}
