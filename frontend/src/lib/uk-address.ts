/** UK postcode helpers and address formatting for lookup UIs. */

const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

export function normalizePostcode(input: string): string {
  const compact = input.replace(/\s+/g, "").toUpperCase();
  if (compact.length < 5) return compact;
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
}

export function isValidUkPostcode(input: string): boolean {
  return UK_POSTCODE_RE.test(input.trim());
}

/** Format getAddress.io comma-separated line into a multi-line address. */
export function formatAddressFromGetAddressLine(raw: string, postcode: string): string {
  const parts = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const formattedPostcode = normalizePostcode(postcode);
  const hasPostcode = parts.some(
    (part) => part.replace(/\s+/g, "").toUpperCase() === formattedPostcode.replace(/\s+/g, ""),
  );

  if (!hasPostcode) parts.push(formattedPostcode);
  return parts.join("\n");
}

export type ParsedUkAddress = {
  line1: string;
  line2: string;
  line3: string;
  town: string;
  county: string;
  postcode: string;
};

export function formatAddressFromExpanded(entry: {
  line_1?: string;
  line_2?: string;
  line_3?: string;
  town_or_city?: string;
  county?: string;
  postcode?: string;
}): string {
  const lines = [entry.line_1, entry.line_2, entry.line_3, entry.town_or_city, entry.county]
    .map((line) => line?.trim())
    .filter((line): line is string => Boolean(line));

  const postcode = entry.postcode ? normalizePostcode(entry.postcode) : "";
  if (postcode && !lines.some((l) => l.replace(/\s+/g, "").toUpperCase() === postcode.replace(/\s+/g, ""))) {
    lines.push(postcode);
  }

  return lines.join("\n");
}

export function isPlausibleUkAddress(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 10) return false;
  const lines = trimmed.split(/\n|,/).map((l) => l.trim()).filter(Boolean);
  return lines.length >= 2;
}
