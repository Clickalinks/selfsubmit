import { auth } from "@clerk/nextjs/server";

import { ManageBillingSection } from "@/components/dashboard/ManageBillingSection";
import { SubscriptionAccessBanner } from "@/components/dashboard/SubscriptionAccessBanner";
import { getSubscriptionState } from "@/lib/billing-server";
import { getSubscriptionAccess } from "@/lib/subscription-access";

export async function ManageBillingPanel() {
  const { userId } = await auth();
  if (!userId) return null;

  const subscription = await getSubscriptionState(userId);
  const access = getSubscriptionAccess(subscription);
  const ending = access.phase === "ending";

  return (
    <div className="space-y-4">
      <SubscriptionAccessBanner access={access} />
      <ManageBillingSection
        showUpgradeCta
        subscriptionEnding={ending || access.phase === "grace" || access.phase === "lapsed"}
      />
    </div>
  );
}
