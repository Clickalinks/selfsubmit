import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

type RateLimitConfig = {
  key: string;
  max: number;
  windowMs: number;
};

type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSec: number };

export async function checkApiRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const now = Date.now();
  const row = await prisma.accountLockout.findUnique({ where: { key: config.key } });

  if (!row || row.updatedAt.getTime() < now - config.windowMs) {
    await prisma.accountLockout.upsert({
      where: { key: config.key },
      create: { key: config.key, lockType: "api_rate", failedCount: 1 },
      update: { lockType: "api_rate", failedCount: 1, lockedUntil: null, updatedAt: new Date() },
    });
    return { allowed: true };
  }

  const next = row.failedCount + 1;
  if (next > config.max) {
    const retryAfterSec = Math.ceil((row.updatedAt.getTime() + config.windowMs - now) / 1000);
    return { allowed: false, retryAfterSec: Math.max(retryAfterSec, 1) };
  }

  await prisma.accountLockout.update({
    where: { key: config.key },
    data: { failedCount: next, updatedAt: new Date() },
  });
  return { allowed: true };
}

export const API_RATE_LIMITS = {
  /** Public postcode lookup */
  addressLookup: { max: 30, windowMs: 15 * 60 * 1000 },
  /** Authenticated API default */
  authenticated: { max: 120, windowMs: 15 * 60 * 1000 },
  /** Billing / payment */
  billing: { max: 10, windowMs: 15 * 60 * 1000 },
  /** Account data export */
  export: { max: 3, windowMs: 60 * 60 * 1000 },
  /** Public contact form */
  contact: { max: 5, windowMs: 60 * 60 * 1000 },
  /** Cookie / consent logging */
  consent: { max: 30, windowMs: 15 * 60 * 1000 },
  /** Sign-in pre-check and failure reporting */
  loginProtection: { max: 30, windowMs: 15 * 60 * 1000 },
  /** HMRC API calls per user */
  hmrc: { max: 40, windowMs: 15 * 60 * 1000 },
  /** Receipt uploads */
  receiptsUpload: { max: 40, windowMs: 15 * 60 * 1000 },
  /** Monthly record saves */
  submissions: { max: 60, windowMs: 15 * 60 * 1000 },
} as const;

export function rateLimitKey(prefix: string, identifier: string): string {
  return `api:${prefix}:${identifier}`;
}

/** Returns a 429 response when limited, otherwise null. */
export async function rateLimitOrNull(
  prefix: string,
  identifier: string,
  config: { max: number; windowMs: number },
): Promise<NextResponse | null> {
  const limited = await checkApiRateLimit({
    key: rateLimitKey(prefix, identifier),
    ...config,
  });
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }
  return null;
}
