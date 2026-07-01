/** Normalise UK phone numbers to E.164 for Twilio (+44…). */
export function formatUkPhoneE164(raw: string): string | null {
  const digits = raw.replace(/[\s().-]/g, "");
  if (!digits) return null;

  let normalized = digits;
  if (normalized.startsWith("+")) {
    normalized = normalized.slice(1);
  }
  if (normalized.startsWith("00")) {
    normalized = normalized.slice(2);
  }
  if (normalized.startsWith("0")) {
    normalized = `44${normalized.slice(1)}`;
  }
  if (!normalized.startsWith("44")) {
    return null;
  }

  const national = normalized.slice(2);
  if (!/^\d{9,10}$/.test(national)) {
    return null;
  }

  return `+44${national}`;
}
