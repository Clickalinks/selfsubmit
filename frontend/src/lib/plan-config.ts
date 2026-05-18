/**
 * Central plan limits — swap for Stripe price metadata later without changing call sites.
 */
export const PLAN_IDS = ["starter", "standard", "pro"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export const PLAN_LIMITS: Record<PlanId, number> = {
  starter: 1,
  standard: 3,
  pro: Number.POSITIVE_INFINITY,
};

export function isPlanId(value: string): value is PlanId {
  return (PLAN_IDS as readonly string[]).includes(value);
}

export function maxBusinessesForPlan(plan: PlanId): number {
  return PLAN_LIMITS[plan];
}
