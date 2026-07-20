import { formatUkPhoneE164 } from "@/lib/phone-format";

export type SendSmsResult =
  | { ok: true; sid: string; to: string }
  | { ok: false; error: string };

export function isTwilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim() &&
      (process.env.TWILIO_PHONE_NUMBER?.trim() || process.env.TWILIO_MESSAGING_SERVICE_SID?.trim()),
  );
}

/** Send an SMS via Twilio REST API (no SDK — keeps the bundle smaller). */
export async function sendSms(toRaw: string, body: string): Promise<SendSmsResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const fromNumber = process.env.TWILIO_PHONE_NUMBER?.trim();
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID?.trim();

  if (!accountSid || !authToken || (!fromNumber && !messagingServiceSid)) {
    return { ok: false, error: "SMS messaging is not configured." };
  }

  const to = formatUkPhoneE164(toRaw);
  if (!to) {
    return { ok: false, error: "Invalid UK phone number." };
  }

  const params = new URLSearchParams({ To: to, Body: body });
  if (messagingServiceSid) {
    params.set("MessagingServiceSid", messagingServiceSid);
  } else if (fromNumber) {
    params.set("From", fromNumber);
  }

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const payload = (await response.json().catch(() => null)) as { sid?: string; message?: string } | null;
  if (!response.ok) {
    return { ok: false, error: payload?.message ?? `SMS provider error (${response.status})` };
  }

  return { ok: true, sid: payload?.sid ?? "unknown", to };
}
