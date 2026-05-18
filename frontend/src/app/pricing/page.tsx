import type { Metadata } from "next";

import { PricingBanner } from "@/components/landing/PricingBanner";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { PlanPicker } from "@/components/subscription/PlanPicker";

export const metadata: Metadata = {
  title: "Pricing — SelfSubmit",
  description: "Choose a SelfSubmit plan to unlock businesses and the monthly MTD-style return form.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <PricingBanner footer={<PlanPicker />} />
      </main>
      <SiteFooter />
    </div>
  );
}
