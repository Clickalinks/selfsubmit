import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const COOKIE_NAME = "hmrc_oauth_state";
const MAX_AGE_SEC = 15 * 60;

type OAuthStatePayload = {
  userId: string;
  nonce: string;
  exp: number;
};

function stateSecret(): string {
  const key = process.env.ENCRYPTION_KEY?.trim() ?? process.env.HMRC_CLIENT_SECRET?.trim();
  if (!key) throw new Error("Cannot sign HMRC OAuth state.");
  return key;
}

function sign(payloadB64: string): string {
  return createHmac("sha256", stateSecret()).update(payloadB64).digest("base64url");
}

export function createOAuthStateCookie(userId: string): {
  name: string;
  value: string;
  maxAge: number;
  stateParam: string;
} {
  const payload: OAuthStatePayload = {
    userId,
    nonce: randomBytes(16).toString("hex"),
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SEC,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(payloadB64);
  return {
    name: COOKIE_NAME,
    value: `${payloadB64}.${signature}`,
    maxAge: MAX_AGE_SEC,
    stateParam: payload.nonce,
  };
}

export function verifyOAuthStateCookie(
  cookieValue: string | undefined,
  stateParam: string | null,
): OAuthStatePayload | null {
  if (!cookieValue || !stateParam) return null;

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

  let payload: OAuthStatePayload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as OAuthStatePayload;
  } catch {
    return null;
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  if (payload.nonce !== stateParam) return null;

  return payload;
}

export function clearOAuthStateCookie(): { name: string; value: string; maxAge: number } {
  return { name: COOKIE_NAME, value: "", maxAge: 0 };
}
