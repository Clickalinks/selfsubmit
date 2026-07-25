import type Stripe from "stripe";

import { COMPANY } from "@/lib/company-details";
import { sendReminderEmail, isResendConfigured } from "@/lib/reminder-email";

function formatGbpFromStripeAmount(amount: number, currency: string): string {
  const value = amount / 100;
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase() || "GBP",
    }).format(value);
  } catch {
    return `£${value.toFixed(2)}`;
  }
}

function formatUkDateFromUnix(seconds: number | null | undefined): string {
  if (!seconds) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(seconds * 1000));
}

/**
 * Email the Stripe-generated invoice/receipt after a subscription charge (or £0 trial invoice).
 * Stripe creates the invoice; SelfSubmit delivers it via Resend when configured.
 */
export async function emailStripeInvoiceToCustomer(invoice: Stripe.Invoice): Promise<void> {
  if (!isResendConfigured()) {
    console.info("[billing-invoice-email] Resend not configured — skipping invoice email", invoice.id);
    return;
  }

  const email = invoice.customer_email?.trim();
  if (!email) {
    console.warn("[billing-invoice-email] No customer_email on invoice", invoice.id);
    return;
  }

  const amountDue = invoice.amount_paid ?? invoice.amount_due ?? 0;
  const currency = invoice.currency ?? "gbp";
  const amountLabel = formatGbpFromStripeAmount(amountDue, currency);
  const isZero = amountDue === 0;
  const number = invoice.number ?? invoice.id;
  const period = [
    formatUkDateFromUnix(invoice.period_start),
    formatUkDateFromUnix(invoice.period_end),
  ].join(" – ");
  const hostedUrl = invoice.hosted_invoice_url?.trim() || null;
  const pdfUrl = invoice.invoice_pdf?.trim() || null;
  const status = invoice.status ?? "paid";

  const subject = isZero
    ? `SelfSubmit — Trial / £0 invoice ${number}`
    : `SelfSubmit — Invoice ${number} (${amountLabel})`;

  const intro = isZero
    ? "Your SelfSubmit subscription invoice for this period is £0 (for example during a free trial or 100% promo). Keep this for your records."
    : "Thank you — your SelfSubmit subscription payment was successful. Here is your invoice for this billing period.";

  const linksHtml = [
    hostedUrl
      ? `<p><a href="${hostedUrl}" style="color:#0d7a3f;font-weight:600;">View invoice online</a></p>`
      : "",
    pdfUrl
      ? `<p><a href="${pdfUrl}" style="color:#0d7a3f;font-weight:600;">Download PDF invoice</a></p>`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<body style="font-family:Arial,Helvetica,sans-serif;color:#111;line-height:1.5;max-width:560px;margin:0 auto;padding:24px;">
  <h1 style="font-size:20px;margin:0 0 12px;">SelfSubmit invoice</h1>
  <p style="margin:0 0 16px;">${intro}</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px;">
    <tr><td style="padding:6px 0;color:#555;">Invoice</td><td style="padding:6px 0;text-align:right;font-weight:600;">${number}</td></tr>
    <tr><td style="padding:6px 0;color:#555;">Amount</td><td style="padding:6px 0;text-align:right;font-weight:600;">${amountLabel}</td></tr>
    <tr><td style="padding:6px 0;color:#555;">Status</td><td style="padding:6px 0;text-align:right;font-weight:600;">${status}</td></tr>
    <tr><td style="padding:6px 0;color:#555;">Period</td><td style="padding:6px 0;text-align:right;">${period}</td></tr>
  </table>
  ${linksHtml}
  <p style="margin-top:24px;font-size:12px;color:#666;">
    You can also download invoices anytime from Settings → Manage billing (Stripe customer portal).<br />
    ${COMPANY.legalName} trading as ${COMPANY.tradingAs}. ${COMPANY.supportEmail}
  </p>
</body>
</html>`;

  const text = [
    "SelfSubmit invoice",
    intro,
    `Invoice: ${number}`,
    `Amount: ${amountLabel}`,
    `Status: ${status}`,
    `Period: ${period}`,
    hostedUrl ? `View online: ${hostedUrl}` : "",
    pdfUrl ? `PDF: ${pdfUrl}` : "",
    "",
    `Manage billing in your SelfSubmit account. ${COMPANY.supportEmail}`,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await sendReminderEmail(email, subject, html, text, {
    replyTo: COMPANY.supportEmail,
  });

  if (!result.ok) {
    console.error("[billing-invoice-email] send failed", invoice.id, result.error);
  } else {
    console.info("[billing-invoice-email] sent", invoice.id, result.id);
  }
}
