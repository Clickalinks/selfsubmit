import { Client } from "getaddress-api";

import {
  formatAddressFromExpanded,
  formatAddressFromGetAddressLine,
  normalizePostcode,
} from "@/lib/uk-address";

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
  provider: "getaddress" | "ideal-postcodes";
  addresses: AddressOption[];
};

type ProviderFailure = {
  ok: false;
  unauthorized?: boolean;
  notFound?: boolean;
  message: string;
};

function sanitizeApiKey(key: string): string {
  return key.replace(/^['"]|['"]$/g, "").trim();
}

export async function lookupGetAddress(apiKey: string, postcode: string): Promise<ProviderSuccess | ProviderFailure> {
  const compact = postcode.replace(/\s+/g, "");
  const key = sanitizeApiKey(apiKey);

  try {
    const client = new Client(key);
    const result = await client.find(compact);

    if (!result.isSuccess) {
      const failed = result.toFailed();
      const lower = failed.message.toLowerCase();
      return {
        ok: false,
        unauthorized:
          failed.status === 401 || lower.includes("unauthorized") || lower.includes("unauthorised"),
        notFound: failed.status === 404,
        message: failed.message,
      };
    }

    const found = result.toSuccess();
    const addresses: AddressOption[] = (found.addresses.addresses ?? []).map((entry, index) => {
      const formatted = formatAddressFromExpanded({
        line_1: entry.line_1,
        line_2: entry.line_2,
        line_3: entry.line_3,
        town_or_city: entry.town_or_city,
        county: entry.county,
        postcode: found.addresses.postcode ?? postcode,
      });
      const labelParts = [entry.line_1, entry.line_2, entry.town_or_city, found.addresses.postcode ?? postcode]
        .map((part) => part?.trim())
        .filter(Boolean);

      return {
        id: String(index),
        label: labelParts.join(", ") || formatted.replace(/\n/g, ", "),
        formatted,
      };
    });

    if (addresses.length === 0) {
      return { ok: false, notFound: true, message: "No addresses found for this postcode." };
    }

    return { ok: true, provider: "getaddress", addresses };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "getAddress lookup failed",
    };
  }
}

/** Raw find without expand — some plans behave better with the legacy response shape. */
export async function lookupGetAddressRaw(apiKey: string, postcode: string): Promise<ProviderSuccess | ProviderFailure> {
  const compact = postcode.replace(/\s+/g, "").toUpperCase();
  const key = sanitizeApiKey(apiKey);

  try {
    const res = await fetch(`https://api.getAddress.io/find/${compact}?api-key=${encodeURIComponent(key)}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      let message = "Could not look up postcode";
      try {
        const json = (await res.json()) as { Message?: string };
        if (json.Message) message = json.Message;
      } catch {
        // empty body
      }
      const lower = message.toLowerCase();
      return {
        ok: false,
        unauthorized:
          res.status === 401 || lower.includes("unauthorized") || lower.includes("unauthorised"),
        notFound: res.status === 404,
        message,
      };
    }

    const data = (await res.json()) as { addresses?: string[]; postcode?: string };
    const addresses: AddressOption[] = (data.addresses ?? []).map((line, index) => {
      const formatted = formatAddressFromGetAddressLine(line, data.postcode ?? postcode);
      return {
        id: String(index),
        label: formatted.replace(/\n/g, ", "),
        formatted,
      };
    });

    if (addresses.length === 0) {
      return { ok: false, notFound: true, message: "No addresses found for this postcode." };
    }

    return { ok: true, provider: "getaddress", addresses };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "getAddress lookup failed",
    };
  }
}

export async function lookupIdealPostcodes(
  apiKey: string,
  postcode: string,
): Promise<ProviderSuccess | ProviderFailure> {
  const key = sanitizeApiKey(apiKey);
  const normalized = normalizePostcode(postcode);

  try {
    const url = `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodeURIComponent(normalized)}?api_key=${encodeURIComponent(key)}`;
    const res = await fetch(url, { cache: "no-store" });
    const data = (await res.json()) as {
      code?: number;
      message?: string;
      result?: Array<{
        line_1?: string;
        line_2?: string;
        line_3?: string;
        post_town?: string;
        county?: string;
        postcode?: string;
      }>;
    };

    if (!res.ok) {
      const lower = (data.message ?? "").toLowerCase();
      return {
        ok: false,
        unauthorized: res.status === 401 || res.status === 402,
        notFound: res.status === 404,
        message: data.message ?? "Ideal Postcodes lookup failed",
      };
    }

    const addresses: AddressOption[] = (data.result ?? []).map((entry, index) => {
      const formatted = formatAddressFromExpanded({
        line_1: entry.line_1,
        line_2: entry.line_2,
        line_3: entry.line_3,
        town_or_city: entry.post_town,
        county: entry.county,
        postcode: entry.postcode ?? normalized,
      });
      const labelParts = [entry.line_1, entry.line_2, entry.post_town, entry.postcode ?? normalized]
        .map((p) => p?.trim())
        .filter(Boolean);
      return {
        id: String(index),
        label: labelParts.join(", ") || formatted.replace(/\n/g, ", "),
        formatted,
      };
    });

    if (addresses.length === 0) {
      return { ok: false, notFound: true, message: "No addresses found for this postcode." };
    }

    return { ok: true, provider: "ideal-postcodes", addresses };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Ideal Postcodes lookup failed",
    };
  }
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
