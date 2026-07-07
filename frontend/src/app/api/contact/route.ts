import { API_RATE_LIMITS, checkApiRateLimit, rateLimitKey } from "@/lib/api-rate-limit";
import { COMPANY } from "@/lib/company-details";
import { getRequestIp } from "@/lib/request-ip";
import { sendReminderEmail } from "@/lib/reminder-email";

const SUBJECT_LABELS: Record<string, string> = {
  support: "General support",
  billing: "Account & billing",
  partnership: "Partnership enquiry",
  privacy: "Data protection request",
  other: "Other",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  const ip = getRequestIp(request) ?? "unknown";
  const limited = await checkApiRateLimit({
    key: rateLimitKey("contact-form", ip),
    ...API_RATE_LIMITS.contact,
  });
  if (!limited.allowed) {
    return Response.json(
      { error: "Too many messages sent. Please wait and try again, or email us directly." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  let body: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    website?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.website?.trim()) {
    return Response.json({ ok: true });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const subjectKey = body.subject?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || name.length < 2) {
    return Response.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!SUBJECT_LABELS[subjectKey]) {
    return Response.json({ error: "Please choose a subject." }, { status: 400 });
  }
  if (!message || message.length < 10) {
    return Response.json({ error: "Please enter a message (at least 10 characters)." }, { status: 400 });
  }
  if (message.length > 5000) {
    return Response.json({ error: "Message is too long (max 5,000 characters)." }, { status: 400 });
  }

  const subjectLabel = SUBJECT_LABELS[subjectKey];
  const emailSubject = `SelfSubmit contact: ${subjectLabel} — ${name}`;
  const text = [
    `New contact form message`,
    ``,
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subjectLabel}`,
    ``,
    message,
    ``,
    `—`,
    `Sent from selfsubmit.co.uk/contact`,
    `IP: ${ip}`,
  ].join("\n");

  const html = `
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
    <p><strong>Subject:</strong> ${escapeHtml(subjectLabel)}</p>
    <hr />
    <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
  `;

  const result = await sendReminderEmail(COMPANY.supportEmail, emailSubject, html, text, {
    replyTo: email,
  });
  if (!result.ok) {
    console.error("[contact]", result.error);
    return Response.json(
      {
        error: `We could not send your message right now. Please email ${COMPANY.supportEmail} directly.`,
      },
      { status: 503 },
    );
  }

  return Response.json({ ok: true });
}
