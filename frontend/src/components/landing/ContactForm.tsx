"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";

import { COMPANY } from "@/lib/company-details";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20";
const labelClass = "block text-sm font-semibold text-slate-800";

const SUBJECTS = [
  { value: "support", label: "General support" },
  { value: "billing", label: "Account & billing" },
  { value: "partnership", label: "Partnership enquiry" },
  { value: "privacy", label: "Data protection request" },
  { value: "other", label: "Other" },
] as const;

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState<string>(SUBJECTS[0].value);
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, website: honeypot }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not send your message. Please try again.");
        return;
      }
      setSent(true);
      setName("");
      setEmail("");
      setSubject(SUBJECTS[0].value);
      setMessage("");
    } catch {
      setError("Could not send your message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-6 sm:px-8">
        <h2 className="text-lg font-bold text-emerald-900">Message sent</h2>
        <p className="mt-2 text-sm leading-relaxed text-emerald-800">
          Thank you — we have received your message and aim to reply within two working days.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-4 text-sm font-semibold text-brand-green underline-offset-2 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={labelClass}>
            Your name
          </label>
          <input
            id="contact-name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            maxLength={120}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>
            Email address
          </label>
          <input
            id="contact-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            maxLength={200}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className={labelClass}>
          Subject
        </label>
        <select
          id="contact-subject"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={inputClass}
        >
          {SUBJECTS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${inputClass} resize-y min-h-[9rem]`}
          maxLength={5000}
          placeholder="How can we help?"
        />
      </div>

      <div className="hidden" aria-hidden>
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-brand-muted">
          Or email us directly at{" "}
          <a href={`mailto:${COMPANY.supportEmail}`} className="font-semibold text-brand-green hover:underline">
            {COMPANY.supportEmail}
          </a>
        </p>
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-green px-6 py-3 text-sm font-bold text-white shadow-btn-green transition hover:bg-brand-green-dark disabled:opacity-60"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {sending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
