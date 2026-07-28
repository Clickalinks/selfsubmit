import { prisma } from "@/lib/db";
import {
  FAILED_ATTEMPT_WINDOW_MS,
  LOCKOUT_DURATION_MS,
  LOGIN_PRECHECK_MAX_AGE_MS,
  MAX_FAILED_ATTEMPTS_PER_ACCOUNT,
  MAX_FAILED_ATTEMPTS_PER_IP,
  RATE_LIMIT_MAX_REQUESTS_PER_IP,
  RATE_LIMIT_WINDOW_MS,
  SUSPICIOUS_FAILURE_THRESHOLD,
  SUSPICIOUS_FAILURE_WINDOW_MS,
} from "@/lib/login-protection-config";

export type LoginCheckResult = {
  allowed: boolean;
  lockedUntil: Date | null;
  message: string | null;
  reason: "account_locked" | "ip_locked" | "rate_limited" | null;
};

function normalizeIdentifier(email: string): string {
  return email.trim().toLowerCase();
}

function accountLockKey(identifier: string): string {
  return `account:${normalizeIdentifier(identifier)}`;
}

function ipLockKey(ip: string): string {
  return `ip:${ip}`;
}

function rateLimitKey(ip: string): string {
  return `ratelimit:${ip}`;
}

async function getLockout(key: string) {
  return prisma.accountLockout.findUnique({ where: { key } });
}

async function upsertLockout(params: {
  key: string;
  lockType: "account" | "ip" | "ratelimit";
  failedCount: number;
  lockedUntil: Date | null;
}) {
  return prisma.accountLockout.upsert({
    where: { key: params.key },
    create: {
      key: params.key,
      lockType: params.lockType,
      failedCount: params.failedCount,
      lockedUntil: params.lockedUntil,
    },
    update: {
      lockType: params.lockType,
      failedCount: params.failedCount,
      lockedUntil: params.lockedUntil,
    },
  });
}

function isActiveLock(lockedUntil: Date | null | undefined): boolean {
  return Boolean(lockedUntil && lockedUntil.getTime() > Date.now());
}

function preCheckKey(identifier: string, ip: string): string {
  return `precheck:${normalizeIdentifier(identifier)}:${ip}`;
}

/** Records that this email was checked on sign-in from this IP (required before failure logging). */
export async function recordLoginPreCheck(identifier: string, ip: string): Promise<void> {
  await upsertLockout({
    key: preCheckKey(identifier, ip),
    lockType: "ratelimit",
    failedCount: 1,
    lockedUntil: null,
  });
}

export async function hasRecentLoginPreCheck(identifier: string, ip: string): Promise<boolean> {
  const row = await getLockout(preCheckKey(identifier, ip));
  if (!row) return false;
  return row.updatedAt.getTime() > Date.now() - LOGIN_PRECHECK_MAX_AGE_MS;
}

export async function checkLoginAllowed(identifier: string | null, ip: string): Promise<LoginCheckResult> {
  const rateKey = rateLimitKey(ip);
  const rateRow = await getLockout(rateKey);
  if (isActiveLock(rateRow?.lockedUntil)) {
    return {
      allowed: false,
      lockedUntil: rateRow!.lockedUntil,
      message: "Too many requests. Please wait before trying again.",
      reason: "rate_limited",
    };
  }

  const ipRow = await getLockout(ipLockKey(ip));
  if (isActiveLock(ipRow?.lockedUntil)) {
    return {
      allowed: false,
      lockedUntil: ipRow!.lockedUntil,
      message: "Too many failed sign-in attempts from your network. Try again later.",
      reason: "ip_locked",
    };
  }

  if (identifier) {
    const accountRow = await getLockout(accountLockKey(identifier));
    if (isActiveLock(accountRow?.lockedUntil)) {
      return {
        allowed: false,
        lockedUntil: accountRow!.lockedUntil,
        message:
          "This account is temporarily locked after repeated failed sign-in attempts. Try again later or reset your password.",
        reason: "account_locked",
      };
    }
  }

  return { allowed: true, lockedUntil: null, message: null, reason: null };
}

export async function recordRateLimitHit(ip: string): Promise<void> {
  const key = rateLimitKey(ip);
  const row = await getLockout(key);
  const windowExpired =
    !row?.updatedAt || row.updatedAt.getTime() < Date.now() - RATE_LIMIT_WINDOW_MS;
  const nextCount = windowExpired ? 1 : (row?.failedCount ?? 0) + 1;

  await upsertLockout({
    key,
    lockType: "ratelimit",
    failedCount: nextCount,
    lockedUntil:
      nextCount >= RATE_LIMIT_MAX_REQUESTS_PER_IP
        ? new Date(Date.now() + LOCKOUT_DURATION_MS)
        : null,
  });
}

async function countRecentFailures(identifier: string | null, ip: string) {
  const since = new Date(Date.now() - FAILED_ATTEMPT_WINDOW_MS);
  const [accountFails, ipFails] = await Promise.all([
    identifier
      ? prisma.loginAttempt.count({
          where: { identifier: normalizeIdentifier(identifier), success: false, createdAt: { gte: since } },
        })
      : Promise.resolve(0),
    prisma.loginAttempt.count({
      where: { ipAddress: ip, success: false, createdAt: { gte: since } },
    }),
  ]);
  return { accountFails, ipFails };
}

async function createSecurityNotification(params: {
  userId?: string | null;
  email: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.securityNotification.create({
    data: {
      userId: params.userId ?? null,
      email: normalizeIdentifier(params.email),
      type: params.type,
      title: params.title,
      message: params.message,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    },
  });
}

export async function isSuspiciousFailureBurst(identifier: string, ip: string): Promise<boolean> {
  const since = new Date(Date.now() - SUSPICIOUS_FAILURE_WINDOW_MS);
  const failures = await prisma.loginAttempt.count({
    where: {
      success: false,
      createdAt: { gte: since },
      OR: [{ identifier: normalizeIdentifier(identifier) }, { ipAddress: ip }],
    },
  });
  return failures >= SUSPICIOUS_FAILURE_THRESHOLD;
}

export async function isSuspiciousSuccessLogin(params: {
  userId: string;
  email: string;
  ip: string;
  userAgent: string | null;
}): Promise<boolean> {
  const lastSuccess = await prisma.loginAttempt.findFirst({
    where: { userId: params.userId, success: true },
    orderBy: { createdAt: "desc" },
    skip: 1,
  });

  if (!lastSuccess) return false;

  const ipChanged = Boolean(lastSuccess.ipAddress && lastSuccess.ipAddress !== params.ip);
  const agentChanged = Boolean(
    lastSuccess.userAgent && params.userAgent && lastSuccess.userAgent !== params.userAgent,
  );

  return ipChanged || agentChanged;
}

export async function recordLoginFailure(params: {
  identifier: string;
  ip: string;
  userAgent: string | null;
  failureReason?: string;
  userId?: string | null;
}): Promise<LoginCheckResult> {
  const identifier = normalizeIdentifier(params.identifier);
  const suspiciousBurst = await isSuspiciousFailureBurst(identifier, params.ip);

  await prisma.loginAttempt.create({
    data: {
      identifier,
      userId: params.userId ?? null,
      ipAddress: params.ip,
      userAgent: params.userAgent,
      success: false,
      failureReason: params.failureReason ?? "invalid_credentials",
      suspicious: suspiciousBurst,
    },
  });

  const { accountFails, ipFails } = await countRecentFailures(identifier, params.ip);

  let lockedUntil: Date | null = null;
  let message: string | null = null;
  let reason: LoginCheckResult["reason"] = null;

  if (accountFails >= MAX_FAILED_ATTEMPTS_PER_ACCOUNT) {
    lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
    await upsertLockout({
      key: accountLockKey(identifier),
      lockType: "account",
      failedCount: accountFails,
      lockedUntil,
    });
    message =
      "Account temporarily locked after too many failed sign-in attempts. Try again in 30 minutes or reset your password.";
    reason = "account_locked";

    await createSecurityNotification({
      userId: params.userId,
      email: identifier,
      type: "account_locked",
      title: "Account temporarily locked",
      message,
      metadata: { ip: params.ip, failedAttempts: accountFails },
    });
  }

  if (ipFails >= MAX_FAILED_ATTEMPTS_PER_IP) {
    const ipLockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
    await upsertLockout({
      key: ipLockKey(params.ip),
      lockType: "ip",
      failedCount: ipFails,
      lockedUntil: ipLockedUntil,
    });
    if (!lockedUntil) {
      lockedUntil = ipLockedUntil;
      message = "Too many failed sign-in attempts from your network. Please try again later.";
      reason = "ip_locked";
    }
  }

  if (suspiciousBurst) {
    await createSecurityNotification({
      userId: params.userId,
      email: identifier,
      type: "suspicious_activity",
      title: "Suspicious sign-in activity",
      message: `Multiple failed sign-in attempts were detected for ${identifier}. If this wasn't you, change your password and enable MFA.`,
      metadata: { ip: params.ip, failureReason: params.failureReason },
    });
  }

  return {
    allowed: !lockedUntil,
    lockedUntil,
    message,
    reason,
  };
}

export async function recordLoginSuccess(params: {
  identifier: string;
  ip: string;
  userAgent: string | null;
  userId: string;
}): Promise<void> {
  const identifier = normalizeIdentifier(params.identifier);
  const suspicious = await isSuspiciousSuccessLogin({
    userId: params.userId,
    email: identifier,
    ip: params.ip,
    userAgent: params.userAgent,
  });

  await prisma.loginAttempt.create({
    data: {
      identifier,
      userId: params.userId,
      ipAddress: params.ip,
      userAgent: params.userAgent,
      success: true,
      suspicious,
    },
  });

  await Promise.all([
    upsertLockout({
      key: accountLockKey(identifier),
      lockType: "account",
      failedCount: 0,
      lockedUntil: null,
    }),
    upsertLockout({
      key: ipLockKey(params.ip),
      lockType: "ip",
      failedCount: 0,
      lockedUntil: null,
    }),
  ]);

  if (suspicious) {
    await createSecurityNotification({
      userId: params.userId,
      email: identifier,
      type: "suspicious_login",
      title: "New sign-in to your account",
      message:
        "We noticed a sign-in from a new device or location. If this wasn't you, secure your account immediately (change password and enable MFA).",
      metadata: { ip: params.ip, userAgent: params.userAgent },
    });
  }
}

export async function getRecentLoginAttemptsForUser(userId: string, limit = 10) {
  return prisma.loginAttempt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getSecurityNotificationsForUser(userId: string, limit = 20) {
  return prisma.securityNotification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function markSecurityNotificationsRead(
  userId: string,
  ids?: string[],
): Promise<{ count: number }> {
  const result = await prisma.securityNotification.updateMany({
    where: ids?.length ? { userId, id: { in: ids } } : { userId, read: false },
    data: { read: true },
  });
  return { count: result.count };
}

