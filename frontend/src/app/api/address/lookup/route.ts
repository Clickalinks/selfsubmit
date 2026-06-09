import { NextResponse } from "next/server";

import { lookupIdealPostcodes, lookupPostcodeArea } from "@/lib/address-providers";
import { API_RATE_LIMITS, checkApiRateLimit, rateLimitKey } from "@/lib/api-rate-limit";
import { postcodeQuerySchema } from "@/lib/api-schemas";
import { sanitizeIdealApiKey } from "@/lib/ideal-postcodes";
import { getRequestIp } from "@/lib/request-ip";
import { isValidUkPostcode, normalizePostcode } from "@/lib/uk-address";

export type { AddressOption } from "@/lib/address-providers";

export async function GET(req: Request) {
  const ip = getRequestIp(req);
  try {
    const limited = await checkApiRateLimit({
      key: rateLimitKey("address-lookup", ip),
      ...API_RATE_LIMITS.addressLookup,
    });
    if (!limited.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait and try again." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
      );
    }
  } catch {
    // Allow lookup if rate-limit store is unavailable (e.g. DB misconfigured on deploy).
  }

  const { searchParams } = new URL(req.url);
  const parsed = postcodeQuerySchema.safeParse({ postcode: searchParams.get("postcode") ?? "" });
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid UK postcode (e.g. SW1A 2AA)." }, { status: 400 });
  }

  const rawPostcode = parsed.data.postcode;
  if (!isValidUkPostcode(rawPostcode)) {
    return NextResponse.json({ error: "Enter a valid UK postcode (e.g. SW1A 2AA)." }, { status: 400 });
  }

  const postcode = normalizePostcode(rawPostcode);
  const idealKey = sanitizeIdealApiKey(process.env.IDEAL_POSTCODES_API_KEY ?? "");

  const area = await lookupPostcodeArea(postcode);
  if (!area) {
    return NextResponse.json({ error: "That postcode could not be found." }, { status: 404 });
  }

  if (!idealKey) {
    return NextResponse.json({
      postcode,
      fallback: "structured",
      area,
      addresses: [],
      provider: null,
      error: "Postcode verified. Add IDEAL_POSTCODES_API_KEY to enable address search.",
      hint: "Local: frontend/.env.local — Production: Vercel → Settings → Environment Variables. Get a key at https://ideal-postcodes.co.uk",
      code: "not_configured",
    });
  }

  const ideal = await lookupIdealPostcodes(idealKey, postcode);

  if (ideal.ok) {
    return NextResponse.json({
      postcode,
      addresses: ideal.addresses,
      provider: "ideal-postcodes",
    });
  }

  if (ideal.unauthorized) {
    return NextResponse.json(
      {
        postcode,
        fallback: "structured",
        area,
        addresses: [],
        provider: null,
        error: ideal.message,
        code: "unauthorized",
      },
      { status: 401 },
    );
  }

  if (ideal.notFound) {
    return NextResponse.json({ error: ideal.message, postcode }, { status: 404 });
  }

  return NextResponse.json({
    postcode,
    fallback: "structured",
    area,
    addresses: [],
    provider: null,
    error: ideal.message,
    hint: "You can still enter your street address manually below.",
    code: "lookup_failed",
  });
}
