import { NextResponse } from "next/server";

import {
  lookupGetAddress,
  lookupGetAddressRaw,
  lookupIdealPostcodes,
  lookupPostcodeArea,
} from "@/lib/address-providers";
import { isValidUkPostcode, normalizePostcode } from "@/lib/uk-address";

export type { AddressOption } from "@/lib/address-providers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawPostcode = searchParams.get("postcode")?.trim() ?? "";

  if (!rawPostcode) {
    return NextResponse.json({ error: "Postcode is required." }, { status: 400 });
  }

  if (!isValidUkPostcode(rawPostcode)) {
    return NextResponse.json({ error: "Enter a valid UK postcode (e.g. SW1A 2AA)." }, { status: 400 });
  }

  const postcode = normalizePostcode(rawPostcode);
  const getAddressKey = process.env.GETADDRESS_API_KEY?.replace(/^['"]|['"]$/g, "").trim();
  const idealKey = process.env.IDEAL_POSTCODES_API_KEY?.replace(/^['"]|['"]$/g, "").trim();

  const area = await lookupPostcodeArea(postcode);

  if (!area) {
    return NextResponse.json({ error: "That postcode could not be found." }, { status: 404 });
  }

  const attempts: string[] = [];

  if (getAddressKey) {
    let result = await lookupGetAddress(getAddressKey, postcode);
    if (!result.ok && result.unauthorized) {
      attempts.push("getAddress: unauthorised");
    } else if (!result.ok && !result.notFound) {
      attempts.push(`getAddress: ${result.message}`);
      result = await lookupGetAddressRaw(getAddressKey, postcode);
    }

    if (result.ok) {
      return NextResponse.json({
        postcode,
        addresses: result.addresses,
        provider: result.provider,
      });
    }

    if (!result.ok && !result.unauthorized && !result.notFound) {
      attempts.push(`getAddress raw: ${result.message}`);
    }
  }

  if (idealKey) {
    const ideal = await lookupIdealPostcodes(idealKey, postcode);
    if (ideal.ok) {
      return NextResponse.json({
        postcode,
        addresses: ideal.addresses,
        provider: ideal.provider,
      });
    }
    attempts.push(`Ideal Postcodes: ${ideal.message}`);
  }

  const noKeys = !getAddressKey && !idealKey;

  return NextResponse.json({
    postcode,
    fallback: "structured",
    area,
    addresses: [],
    provider: null,
    error: noKeys
      ? "Postcode verified. Enter your street address below (address search API not configured)."
      : "Postcode verified. Your address search API key was not accepted — enter your street address below.",
    hint: noKeys
      ? "Add GETADDRESS_API_KEY or IDEAL_POSTCODES_API_KEY to .env.local"
      : attempts.length
        ? attempts.join("; ")
        : undefined,
    code: getAddressKey ? "provider_unauthorized" : "not_configured",
  });
}
