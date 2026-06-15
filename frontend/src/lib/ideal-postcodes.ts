import {
  formatAddressFromExpanded,
  normalizePostcode,
} from "@/lib/uk-address";

import type { AddressOption } from "@/lib/address-providers";

const IDEAL_API_BASE = "https://api.ideal-postcodes.co.uk/v1";

export type IdealPostcodeHit = {
  line_1?: string;
  line_2?: string;
  line_3?: string;
  post_town?: string;
  county?: string;
  postcode?: string;
  id?: string;
};

type IdealPostcodeResponse = {
  code?: number;
  message?: string;
  result?: IdealPostcodeHit[];
  total?: number;
  limit?: number;
  page?: number;
  suggestions?: string[];
};

export function sanitizeIdealApiKey(key: string): string {
  return key.replace(/^['"]|['"]$/g, "").trim();
}

function compactPostcode(postcode: string): string {
  return postcode.replace(/\s+/g, "").toUpperCase();
}

function mapHitToOption(entry: IdealPostcodeHit, index: number, fallbackPostcode: string): AddressOption {
  const pc = entry.postcode ? normalizePostcode(entry.postcode) : fallbackPostcode;
  const formatted = formatAddressFromExpanded({
    line_1: entry.line_1,
    line_2: entry.line_2,
    line_3: entry.line_3,
    town_or_city: entry.post_town,
    county: entry.county,
    postcode: pc,
  });
  const labelParts = [entry.line_1, entry.line_2, entry.line_3, entry.post_town, pc]
    .map((p) => p?.trim())
    .filter(Boolean);

  return {
    id: entry.id ?? String(index),
    label: labelParts.join(", ") || formatted.replace(/\n/g, ", "),
    formatted,
  };
}

function idealPostcodesReferer(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
    "https://www.selfsubmit.co.uk",
  ];

  for (const candidate of candidates) {
    if (!candidate?.trim()) continue;
    try {
      const url = candidate.includes("://") ? new URL(candidate) : new URL(`https://${candidate}`);
      return `${url.origin}/`;
    } catch {
      // try next candidate
    }
  }

  return "https://www.selfsubmit.co.uk/";
}

function idealPostcodesRequestHeaders(): HeadersInit {
  return {
    Accept: "application/json",
    Referer: idealPostcodesReferer(),
  };
}

export function idealPostcodeErrorMessage(data: IdealPostcodeResponse, httpStatus: number): string {
  const code = data.code;
  const msg = data.message ?? "Ideal Postcodes lookup failed";

  if (code === 4011) {
    return "Ideal Postcodes blocked this request (URL whitelist). In your Ideal Postcodes dashboard, disable Allowed URLs for server-side keys or add https://www.selfsubmit.co.uk.";
  }
  if (code === 4010) {
    return "Invalid Ideal Postcodes API key. Check IDEAL_POSTCODES_API_KEY in .env.local (dev) or Vercel env vars (production), then redeploy.";
  }
  if (code === 4020 || httpStatus === 402) {
    return "Ideal Postcodes account has no credit left. Top up at ideal-postcodes.co.uk or enter your address manually.";
  }
  if (code === 4040 || httpStatus === 404) {
    if (data.suggestions?.length) {
      return `Postcode not found. Did you mean: ${data.suggestions.slice(0, 3).join(", ")}?`;
    }
    return "Postcode not found.";
  }
  if (httpStatus === 429 || code === 4029) {
    return "Too many address lookups. Please wait a moment and try again.";
  }

  return msg;
}

/** Fetch all addresses for a UK postcode (paginates when >100 results). */
export async function fetchIdealPostcodeAddresses(
  apiKey: string,
  postcode: string,
): Promise<{ ok: true; addresses: AddressOption[] } | { ok: false; message: string; unauthorized?: boolean; notFound?: boolean }> {
  const key = sanitizeIdealApiKey(apiKey);
  const normalized = normalizePostcode(postcode);
  const compact = compactPostcode(normalized);

  const allHits: IdealPostcodeHit[] = [];
  let page = 0;
  const maxPages = 15;

  while (page < maxPages) {
    const url = new URL(`${IDEAL_API_BASE}/postcodes/${encodeURIComponent(compact)}`);
    url.searchParams.set("api_key", key);
    if (page > 0) url.searchParams.set("page", String(page));

    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: idealPostcodesRequestHeaders(),
    });

    let data: IdealPostcodeResponse = {};
    try {
      data = (await res.json()) as IdealPostcodeResponse;
    } catch {
      return { ok: false, message: "Invalid response from Ideal Postcodes." };
    }

    if (res.status !== 200 || data.code !== 2000) {
      const lower = (data.message ?? "").toLowerCase();
      return {
        ok: false,
        unauthorized: data.code === 4010 || lower.includes("invalid key"),
        notFound: res.status === 404 || data.code === 4040,
        message: idealPostcodeErrorMessage(data, res.status),
      };
    }

    const batch = data.result ?? [];
    allHits.push(...batch);

    const total = data.total ?? batch.length;
    const limit = data.limit ?? 100;
    if (allHits.length >= total || batch.length < limit) break;
    page += 1;
  }

  const addresses = allHits
    .map((hit, index) => mapHitToOption(hit, index, normalized))
    .filter((opt) => opt.formatted.trim().length > 0);

  if (addresses.length === 0) {
    return { ok: false, notFound: true, message: "No addresses found for this postcode." };
  }

  return { ok: true, addresses };
}
