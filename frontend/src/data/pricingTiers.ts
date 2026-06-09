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
    price: 15,
    highlights: [`${PLAN_INCLUDED_FEATURES.length} features included`, "One business profile", "Quarterly MTD updates"],
    popular: false,
  },
  {
    id: "business_plus",
    name: "Business Plus",
    businessesLabel: "2 businesses",
    businessesDetail: "For two separate trades or income streams you report to HMRC.",
    price: 25,
    popular: true,
    highlights: [`${PLAN_INCLUDED_FEATURES.length} features included`, "Up to two businesses", "Separate records per trade"],
  },
  {
    id: "professional",
    name: "Professional",
    businessesLabel: "3 businesses",
    businessesDetail: "Manage three businesses without switching between spreadsheets.",
    price: 40,
    popular: false,
    highlights: [`${PLAN_INCLUDED_FEATURES.length} features included`, "Up to three businesses", "Priority email support"],
  },
  {
    id: "unlimited",
    name: "Unlimited",
    businessesLabel: "4+ businesses",
    businessesDetail: "For landlords and portfolio self-employment with several income sources.",
    price: 60,
    popular: false,
    highlights: [`${PLAN_INCLUDED_FEATURES.length} features included`, "Unlimited businesses", "Built for heavier MTD use"],
  },
];
