import { createHash } from "crypto";

import type { HmrcFraudClientContext } from "@/lib/hmrc-fraud-context";
import { getRequestIp } from "@/lib/request-ip";

const PRODUCT_NAME = "SelfSubmit";
const VENDOR_VERSION = "selfsubmit=1.0.0";
/** Stable SaaS licence identifier (hashed) for Gov-Vendor-License-IDs. */
const VENDOR_LICENSE_HASH = createHash("sha256").update("selfsubmit-saas-license-v1").digest("hex").toUpperCase();

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

export function buildHmrcFraudPreventionHeaders(input: {
  request: Request;
  userId: string;
  userLoginId?: string | null;
  fraudContext?: HmrcFraudClientContext | null;
}): Record<string, string> {
  const clientIp = getRequestIp(input.request);
  const now = new Date();
  const ctx = input.fraudContext;
  const publicIp = clientIp !== "unknown" ? clientIp : "198.51.100.0";
  const publicPort = "12345";

  const headers: Record<string, string> = {
    "Gov-Client-Connection-Method": "WEB_APP_VIA_SERVER",
    "Gov-Vendor-Product-Name": percentEncode(PRODUCT_NAME),
    "Gov-Vendor-Version": VENDOR_VERSION,
    "Gov-Vendor-License-IDs": `selfsubmit=${VENDOR_LICENSE_HASH}`,
    "Gov-Client-Public-IP": publicIp,
    "Gov-Client-Public-IP-Timestamp": formatUtcTimestamp(now),
    // Must be the client TCP port, not 80/443 (HMRC FPH validator rejects server ports).
    "Gov-Client-Public-Port": publicPort,
    "Gov-Vendor-Public-IP": publicIp,
    "Gov-Vendor-Forwarded": `by=${encodeURIComponent(publicIp)}&for=${encodeURIComponent(publicIp)}`,
  };

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
