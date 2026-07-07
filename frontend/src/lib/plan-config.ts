/**
 * Central plan limits — swap for Stripe price metadata later without changing call sites.
 */
export const PLAN_IDS = ["solo", "business_plus", "professional", "unlimited"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

/** Maximum businesses allowed per plan (hard cap of 4 across all tiers). */
export const MAX_BUSINESSES_PLATFORM = 4;

export const PLAN_LIMITS: Record<PlanId, number> = {
  solo: 1,
  business_plus: 2,
  professional: 3,
  unlimited: 4,
};

export const PLAN_DISPLAY_NAMES: Record<PlanId, string> = {
  solo: "Solo",
  business_plus: "Business Plus",
  professional: "Professional",
  unlimited: "Portfolio",
};

/** Legacy plan ids from earlier product iterations. */
const LEGACY_PLAN_MAP: Record<string, PlanId> = {
  starter: "solo",
  standard: "professional",
  pro: "unlimited",
};

export function isPlanId(value: string): value is PlanId {
  return (PLAN_IDS as readonly string[]).includes(value);
}

export function normalizePlanId(value: string | null | undefined): PlanId | null {
  if (!value) return null;
  if (isPlanId(value)) return value;
  return LEGACY_PLAN_MAP[value] ?? null;
}

export function maxBusinessesForPlan(plan: PlanId): number {
  return PLAN_LIMITS[plan];
}

/** Features included in every plan (plain English for pricing UI). */
export const PLAN_INCLUDED_FEATURES = [
  "Income tracking",
  "Expense tracking",
  "Receipt uploads",
  "CSV uploads",
  "MTD-ready record keeping",
  "Practice monthly records",
  "Final declaration support (roadmap)",
  "Deadline reminders",
  "MTD compliance dashboard",
  "Submission history",
  "Secure document storage",
  "Email support",
  "Mobile access",
] as const;
