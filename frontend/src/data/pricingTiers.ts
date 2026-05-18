import type { PlanId } from "@/lib/plan-config";

export type PricingTier = {
  id: PlanId;
  name: string;
  streamsLabel: string;
  streamsDetail: string;
  price: number;
  highlights: string[];
  popular: boolean;
};

export const TIERS: readonly PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    streamsLabel: "1 income stream",
    streamsDetail: "One business or sole source you track for MTD.",
    price: 8,
    highlights: ["One stream in SelfSubmit", "Profession templates", "Monthly capture & totals"],
    popular: false,
  },
  {
    id: "standard",
    name: "Standard",
    streamsLabel: "2–3 income streams",
    streamsDetail: "Ideal if you run a few trades or side income HMRC treats separately.",
    price: 15,
    popular: true,
    highlights: ["Up to three streams", "Everything in Starter", "Clear split per stream"],
  },
  {
    id: "pro",
    name: "Pro",
    streamsLabel: "4+ income streams",
    streamsDetail: "For complex self-employment with several sources to report.",
    price: 22,
    popular: false,
    highlights: ["Unlimited streams (4+)", "Everything in Standard", "Built for heavier MTD use"],
  },
];
