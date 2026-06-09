import { fetchIdealPostcodeAddresses } from "@/lib/ideal-postcodes";
import { normalizePostcode } from "@/lib/uk-address";

export type AddressOption = {
  id: string;
  label: string;
  formatted: string;
};

export type PostcodeArea = {
  town: string;
  county: string;
  postcode: string;
};

type ProviderSuccess = {
  ok: true;
  provider: "ideal-postcodes";
  addresses: AddressOption[];
};

type ProviderFailure = {
  ok: false;
  unauthorized?: boolean;
  notFound?: boolean;
  message: string;
};

export async function lookupIdealPostcodes(
  apiKey: string,
  postcode: string,
): Promise<ProviderSuccess | ProviderFailure> {
  const result = await fetchIdealPostcodeAddresses(apiKey, postcode);
  if (result.ok) {
    return { ok: true, provider: "ideal-postcodes", addresses: result.addresses };
  }
  return {
    ok: false,
    unauthorized: result.unauthorized,
    notFound: result.notFound,
    message: result.message,
  };
}

export async function lookupPostcodeArea(postcode: string): Promise<PostcodeArea | null> {
  const normalized = normalizePostcode(postcode);
  try {
    const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(normalized)}`, {
      cache: "no-store",
    });
    const data = (await res.json()) as {
      status: number;
      result?: {
        postcode?: string;
        admin_district?: string;
        admin_county?: string;
        parish?: string;
      };
    };
    if (data.status !== 200 || !data.result) return null;

    return {
      postcode: data.result.postcode ?? normalized,
      town: data.result.admin_district ?? data.result.parish ?? "",
      county: data.result.admin_county ?? "",
    };
  } catch {
    return null;
  }
}

export function formatStructuredAddress(parts: {
  line1: string;
  line2?: string;
  town: string;
  county?: string;
  postcode: string;
}): string {
  return [parts.line1.trim(), parts.line2?.trim(), parts.town.trim(), parts.county?.trim(), normalizePostcode(parts.postcode)]
    .filter(Boolean)
    .join("\n");
}
