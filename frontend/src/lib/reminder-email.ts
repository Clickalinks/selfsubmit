export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.REMINDER_FROM_EMAIL?.trim());
}

/** Send transactional email via Resend REST API. */
export async function sendReminderEmail(
  to: string,
  subject: string,
  html: string,
  text: string,
  options?: { replyTo?: string },
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.REMINDER_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    return { ok: false, error: "Resend is not configured." };
  }

  const replyTo = options?.replyTo?.trim();
  const body: Record<string, unknown> = {
    from,
    to: [to.trim()],
    subject,
    html,
    text,
  };
  if (replyTo) {
    body.reply_to = replyTo;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => null)) as { id?: string; message?: string } | null;
  if (!response.ok) {
    return { ok: false, error: payload?.message ?? `Resend error (${response.status})` };
  }

  return { ok: true, id: payload?.id ?? "unknown" };
}
