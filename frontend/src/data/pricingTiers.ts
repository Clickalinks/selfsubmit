import type { PlanId } from "@/lib/plan-config";
import { PLAN_INCLUDED_FEATURES } from "@/lib/plan-config";

export type PricingTier = {
  id: PlanId;
  name: string;
  businessesLabel: string;
  businessesDetail: string;
  price: number;
  highlights: string[];
  popular: boolean;
};

export const TIERS: readonly PricingTier[] = [
  {
    id: "solo",
    name: "Solo",
    businessesLabel: "1 business",
    businessesDetail: "Ideal if you run one self-employed trade or rental property.",
    price: 20,
    highlights: ["All core features included", "One business profile", "Quarterly MTD updates"],
    popular: false,
  },
  {
    id: "business_plus",
    name: "Business Plus",
    businessesLabel: "2 businesses",
    businessesDetail: "For two separate trades or income streams you report to HMRC.",
    price: 36,
    popular: true,
    highlights: ["All core features included", "Up to two businesses", "Separate records per trade"],
  },
  {
    id: "professional",
    name: "Professional",
    businessesLabel: "3 businesses",
    businessesDetail: "Manage three businesses without switching between spreadsheets.",
    price: 52,
    popular: false,
    highlights: ["All core features included", "Up to three businesses", "Priority email support"],
  },
  {
    id: "unlimited",
    name: "Portfolio",
    businessesLabel: "4 businesses",
    businessesDetail: "Our maximum plan — up to four separate trades or rental streams.",
    price: 70,
    popular: false,
    highlights: ["All core features included", "Up to four businesses", "Built for heavier MTD use"],
  },
];

export function getTierByPlanId(planId: PlanId): PricingTier | undefined {
  return TIERS.find((tier) => tier.id === planId);
}

export const PLAN_CORE_FEATURE_COUNT = PLAN_INCLUDED_FEATURES.length;
