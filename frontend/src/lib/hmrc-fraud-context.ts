import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "hmrc_fp_ctx";
const MAX_AGE_SEC = 30 * 60;

export type HmrcFraudClientContext = {
  deviceId: string;
  browserJsUserAgent: string;
  screens: string;
  windowSize: string;
  timezone: string;
  collectedAt: string;
};

function cookieSecret(): string {
  const key = process.env.ENCRYPTION_KEY?.trim() ?? process.env.HMRC_CLIENT_SECRET?.trim();
  if (!key) throw new Error("Cannot sign HMRC fraud context.");
  return key;
}

function sign(payloadB64: string): string {
  return createHmac("sha256", cookieSecret()).update(payloadB64).digest("base64url");
}

export function createFraudContextCookie(context: HmrcFraudClientContext): {
  name: string;
  value: string;
  maxAge: number;
} {
  const payloadB64 = Buffer.from(JSON.stringify(context)).toString("base64url");
  const signature = sign(payloadB64);
  return {
    name: COOKIE_NAME,
    value: `${payloadB64}.${signature}`,
    maxAge: MAX_AGE_SEC,
  };
}

export function readFraudContextCookie(cookieValue: string | undefined): HmrcFraudClientContext | null {
  if (!cookieValue) return null;

  const [payloadB64, signature] = cookieValue.split(".");
  if (!payloadB64 || !signature) return null;

  const expected = sign(payloadB64);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as HmrcFraudClientContext;
  } catch {
    return null;
  }
}
