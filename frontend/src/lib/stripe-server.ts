import "server-only";

import Stripe from "stripe";

import type { PlanId } from "@/lib/plan-config";

let stripeClient: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

const PRICE_ENV_KEYS: Record<PlanId, string> = {
  solo: "STRIPE_PRICE_SOLO",
  business_plus: "STRIPE_PRICE_BUSINESS_PLUS",
  professional: "STRIPE_PRICE_PROFESSIONAL",
  unlimited: "STRIPE_PRICE_UNLIMITED",
};

export function getStripePriceId(plan: PlanId): string | null {
  const envKey = PRICE_ENV_KEYS[plan];
  const value = process.env[envKey]?.trim();
  return value || null;
}

export function appBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const ACTIVE_STRIPE_STATUSES = new Set(["active", "trialing"]);
