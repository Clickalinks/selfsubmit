/** HMRC Unique Taxpayer Reference — 10 digits. */
const UTR_RE = /^\d{10}$/;

/** UK National Insurance — e.g. QQ123456C, AB123456D. */
const NI_RE = /^[A-CEGHJ-PR-TW-Z]{2}\d{6}[A-D]$/i;

export function normalizeUtr(value: string): string {
  return value.replace(/\s+/g, "").trim();
}

export function normalizeNiNumber(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase().trim();
}

export function validateUtr(value: string): string | null {
  const normalized = normalizeUtr(value);
  if (!normalized) return "UTR is required.";
  if (!UTR_RE.test(normalized)) return "Enter a valid 10-digit UTR.";
  return null;
}

export function validateNiNumber(value: string): string | null {
  const normalized = normalizeNiNumber(value);
  if (!normalized) return "National Insurance number is required.";
  if (!NI_RE.test(normalized)) return "Enter a valid National Insurance number (e.g. QQ123456C).";
  return null;
}

export function maskUtr(value: string): string {
  const n = normalizeUtr(value);
  if (n.length < 4) return "••••";
  return `••••••${n.slice(-4)}`;
}

export function maskNiNumber(value: string): string {
  const n = normalizeNiNumber(value);
  if (n.length < 4) return "••••";
  return `••••••${n.slice(-2)}`;
}

/** Display NI as QQ 12 34 56 C for confirmation screens. */
export function formatNiNumberForDisplay(value: string): string {
  const n = normalizeNiNumber(value);
  if (n.length !== 9) return n;
  return `${n.slice(0, 2)} ${n.slice(2, 4)} ${n.slice(4, 6)} ${n.slice(6, 8)} ${n.slice(8)}`;
}
