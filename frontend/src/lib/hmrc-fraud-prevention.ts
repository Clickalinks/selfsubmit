import { createHash } from "crypto";

import type { HmrcFraudClientContext } from "@/lib/hmrc-fraud-context";
import { getRequestIp } from "@/lib/request-ip";

const PRODUCT_NAME = "SelfSubmit";
const VENDOR_VERSION = "selfsubmit=1.0.0";
function hashLicenseId(seed: string): string {
  return createHash("sha256").update(`selfsubmit-licence:${seed}`).digest("hex").toUpperCase();
}

function percentEncode(value: string): string {
  return encodeURIComponent(value);
}

function hashUserId(userId: string): string {
  return createHash("sha256").update(userId).digest("hex");
}

/** Stable UUID-shaped fallback when the browser cookie is missing/expired. */
function stableDeviceIdFromUserId(userId: string): string {
  const hex = createHash("sha256").update(`selfsubmit-device:${userId}`).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function formatUtcTimestamp(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, ".000Z");
}

let cachedVendorPublicIp: { ip: string; cachedAtMs: number } | null = null;
const VENDOR_IP_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function isValidPublicIp(ip: string): boolean {
  // Basic IPv4 shape check. (HMRC validates more strictly server-side.)
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
}

async function getVendorPublicIp(): Promise<string> {
  const envIp = process.env.HMRC_VENDOR_PUBLIC_IP?.trim();
  if (envIp && isValidPublicIp(envIp)) return envIp;

  const nowMs = Date.now();
  if (cachedVendorPublicIp && nowMs - cachedVendorPublicIp.cachedAtMs < VENDOR_IP_CACHE_TTL_MS) {
    return cachedVendorPublicIp.ip;
  }

  try {
    const res = await fetch("https://api.ipify.org?format=json", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    const json = (await res.json().catch(() => null)) as { ip?: string } | null;
    const ip = json?.ip?.trim();
    if (ip && isValidPublicIp(ip)) {
      cachedVendorPublicIp = { ip, cachedAtMs: nowMs };
      return ip;
    }
  } catch {
    // ignore and fall back
  }

  // TEST-NET fallback. Prefer a different value than the client IP (HMRC flagged equality).
  const fallback = "198.51.100.99";
  cachedVendorPublicIp = { ip: fallback, cachedAtMs: nowMs };
  return fallback;
}

function isClientTcpPort(n: number): boolean {
  // HMRC: must be 1–65535 and must not be a server port (80/443).
  return Number.isInteger(n) && n >= 1 && n <= 65535 && n !== 80 && n !== 443;
}

function parsePortCandidate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const hostPort = trimmed.match(/:(\d{2,5})$/);
  const n = Number.parseInt(hostPort?.[1] ?? trimmed, 10);
  return isClientTcpPort(n) ? String(n) : null;
}

/**
 * Originating-device public TCP source port, if the platform exposes it.
 * Vercel/edge TLS usually does not — in that case omit the header (do not send 80/443/12345).
 */
function getRequestPublicPort(request: Request): string | null {
  const fromForwardedPort = parsePortCandidate(request.headers.get("x-forwarded-port"));
  if (fromForwardedPort) return fromForwardedPort;

  const fromRealPort = parsePortCandidate(request.headers.get("x-real-port"));
  if (fromRealPort) return fromRealPort;

  const forwarded = request.headers.get("forwarded");
  if (forwarded) {
    const forMatch = forwarded.match(/for=(?:"?\[?[^\];,"]+\]?)(?::(\d{2,5}))?/i);
    const n = forMatch?.[1] ? Number.parseInt(forMatch[1], 10) : NaN;
    if (isClientTcpPort(n)) return String(n);
  }

  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim() ?? "";
    const fromXff = parsePortCandidate(first.includes("]:") || first.match(/^\d+\.\d+\.\d+\.\d+:\d+$/) ? first : null);
    if (fromXff) return fromXff;
  }

  return null;
}

export async function buildHmrcFraudPreventionHeaders(input: {
  request: Request;
  userId: string;
  userLoginId?: string | null;
  fraudContext?: HmrcFraudClientContext | null;
}): Promise<Record<string, string>> {
  const clientIp = getRequestIp(input.request);
  const now = new Date();
  const ctx = input.fraudContext;
  const clientPublicIp = clientIp !== "unknown" ? clientIp : "198.51.100.0";
  const clientPublicPort = getRequestPublicPort(input.request);
  const vendorPublicIp = await getVendorPublicIp();
  const vendorForwarded = `by=${encodeURIComponent(vendorPublicIp)}&for=${encodeURIComponent(clientPublicIp)}`;
  const licenceSeed = input.userId.trim() || input.userLoginId?.trim() || "anonymous";

  const headers: Record<string, string> = {
    "Gov-Client-Connection-Method": "WEB_APP_VIA_SERVER",
    "Gov-Vendor-Product-Name": percentEncode(PRODUCT_NAME),
    "Gov-Vendor-Version": VENDOR_VERSION,
    // Per-customer hashed SelfSubmit licence (browser has no local vendor licence file).
    "Gov-Vendor-License-IDs": `selfsubmit=${hashLicenseId(licenceSeed)}`,
    "Gov-Client-Public-IP": clientPublicIp,
    "Gov-Client-Public-IP-Timestamp": formatUtcTimestamp(now),
    "Gov-Vendor-Public-IP": vendorPublicIp,
    "Gov-Vendor-Forwarded": vendorForwarded,
  };

  if (clientPublicPort) {
    headers["Gov-Client-Public-Port"] = clientPublicPort;
  }

  if (ctx?.browserJsUserAgent) {
    headers["Gov-Client-Browser-JS-User-Agent"] = ctx.browserJsUserAgent;
  } else {
    const ua = input.request.headers.get("user-agent");
    if (ua) headers["Gov-Client-Browser-JS-User-Agent"] = ua;
  }

  // Always send Device-ID — HMRC marks requests INVALID if this header is absent.
  headers["Gov-Client-Device-ID"] = ctx?.deviceId?.trim() || stableDeviceIdFromUserId(input.userId);

  if (ctx?.screens) {
    headers["Gov-Client-Screens"] = ctx.screens;
  } else {
    headers["Gov-Client-Screens"] = "width=1920&height=1080&scaling-factor=1&colour-depth=24";
  }

  if (ctx?.windowSize) {
    headers["Gov-Client-Window-Size"] = ctx.windowSize;
  } else {
    headers["Gov-Client-Window-Size"] = "width=1280&height=800";
  }

  if (ctx?.timezone) {
    headers["Gov-Client-Timezone"] = ctx.timezone;
  } else {
    headers["Gov-Client-Timezone"] = "UTC+00:00";
  }

  const loginId = input.userLoginId?.trim() || hashUserId(input.userId);
  headers["Gov-Client-User-IDs"] = `selfsubmit=${percentEncode(loginId)}`;

  const mfaTimestamp = formatUtcTimestamp(now).replace(".000Z", "Z");
  headers["Gov-Client-Multi-Factor"] =
    `type=OTHER&timestamp=${encodeURIComponent(mfaTimestamp)}&unique-reference=${hashUserId(input.userId)}`;

  return headers;
}
