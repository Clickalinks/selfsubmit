import type { Metadata } from "next";
import Link from "next/link";

import { SitePageHero, SitePageShell } from "@/components/landing/SitePageShell";
import { COMPANY } from "@/lib/company-details";

export const metadata: Metadata = {
  title: "System status — SelfSubmit",
  description: "Current operational status for SelfSubmit services including sign-in, submissions, and reminders.",
};

type StatusLevel = "operational" | "degraded" | "maintenance" | "testing";

const STATUS_STYLES: Record<StatusLevel, { label: string; dot: string; text: string }> = {
  operational: { label: "Operational", dot: "bg-emerald-500", text: "text-emerald-700" },
  degraded: { label: "Degraded", dot: "bg-amber-500", text: "text-amber-700" },
  maintenance: { label: "Maintenance", dot: "bg-slate-400", text: "text-slate-600" },
  testing: { label: "In testing", dot: "bg-sky-500", text: "text-sky-700" },
};

const SERVICES: { name: string; description: string; status: StatusLevel }[] = [
  { name: "Website & dashboard", description: "selfsubmit.co.uk and signed-in areas", status: "operational" },
  { name: "Sign-in & accounts", description: "Registration, login, and profile", status: "operational" },
  { name: "Subscriptions & billing", description: "Stripe checkout and billing portal", status: "operational" },
  { name: "Record keeping", description: "Monthly income and expense forms", status: "operational" },
  { name: "Receipt uploads", description: "Document storage for expense evidence", status: "operational" },
  { name: "Email reminders", description: "Quarterly deadline notifications", status: "operational" },
  { name: "SMS reminders", description: "Optional UK mobile reminders", status: "operational" },
  {
    name: "HMRC quarterly updates",
    description: "Preview and submit cumulative quarterly updates when your HMRC account is connected",
    status: "operational",
  },
];

function StatusBadge({ status }: { status: StatusLevel }) {
  const style = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-2 text-sm font-semibold ${style.text}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} aria-hidden />
      {style.label}
    </span>
  );
}

export default function StatusPage() {
  const hasIssues = SERVICES.some((s) => s.status !== "operational");

  return (
    <SitePageShell>
      <SitePageHero
        eyebrow="Status"
        title="System status"
        description={
          hasIssues
            ? "Some services may be limited. We will post updates here during incidents."
            : "All core services are running normally."
        }
      />

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
          <ul className="divide-y divide-slate-200/80">
            {SERVICES.map((service) => (
              <li key={service.name} className="flex flex-col gap-2 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <p className="font-semibold text-brand-black">{service.name}</p>
                  <p className="mt-0.5 text-sm text-brand-muted">{service.description}</p>
                </div>
                <StatusBadge status={service.status} />
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 text-sm leading-relaxed text-brand-muted">
          Last checked: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.
          If a service shows degraded or maintenance, we will post updates here and by email where appropriate.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200/80 bg-slate-50 px-5 py-6 sm:px-8">
          <h2 className="text-base font-bold text-brand-black">Report an issue</h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-muted">
            If something is not working as expected, email{" "}
            <a
              href={`mailto:${COMPANY.supportEmail}`}
              className="font-semibold text-brand-green underline underline-offset-2"
            >
              {COMPANY.supportEmail}
            </a>{" "}
            with the page you were using and any error message you saw.
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/contact" className="text-brand-green underline-offset-2 hover:underline">
              Contact page →
            </Link>
            <Link href="/infrastructure" className="text-brand-green underline-offset-2 hover:underline">
              Infrastructure guide →
            </Link>
          </div>
        </div>
      </div>
    </SitePageShell>
  );
}
