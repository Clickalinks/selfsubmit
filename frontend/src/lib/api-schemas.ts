import { z } from "zod";

import { PLAN_IDS } from "@/lib/plan-config";

export const planIdSchema = z.enum(PLAN_IDS);

export const checkoutBodySchema = z.object({
  plan: planIdSchema,
});

export const billingConfirmSchema = z.object({
  sessionId: z.string().trim().min(1).max(200),
});

export const postcodeQuerySchema = z.object({
  postcode: z
    .string()
    .trim()
    .min(2)
    .max(12)
    .regex(/^[A-Za-z0-9\s-]+$/, "Invalid postcode format"),
});

export function parseJsonBody<T>(body: unknown, schema: z.ZodSchema<T>): T | null {
  const parsed = schema.safeParse(body);
  return parsed.success ? parsed.data : null;
}

export function zodErrorMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Validation failed";
}
