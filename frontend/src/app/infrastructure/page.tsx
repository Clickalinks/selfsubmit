import type { Metadata } from "next";
import Link from "next/link";

import { SitePageHero, SitePageShell } from "@/components/landing/SitePageShell";
import { COMPANY } from "@/lib/company-details";
import { INFRA_STACK, INFRASTRUCTURE_ITEMS, type InfraResponsibility } from "@/lib/infrastructure-checklist";

export const metadata: Metadata = {
  title: "Infrastructure — SelfSubmit",
  description:
    "How SelfSubmit infrastructure works on Vercel and Neon: backups, monitoring, uptime, CDN, and what you need to configure.",
};

const RESPONSIBILITY_LABEL: Record<InfraResponsibility, string> = {
  provider: "Provider-managed",
  you: "Your action",
  shared: "Shared",
  optional: "Optional",
};

const RESPONSIBILITY_STYLE: Record<InfraResponsibility, string> = {
  provider: "bg-slate-100 text-slate-700",
  you: "bg-amber-100 text-amber-900",
  shared: "bg-sky-100 text-sky-900",
  optional: "bg-violet-100 text-violet-900",
};

export default function InfrastructurePage() {
  const appliesCount = INFRASTRUCTURE_ITEMS.filter((i) => i.applies).length;

  return (
    <SitePageShell>
      <SitePageHero
        eyebrow="Operations"
        title="Infrastructure"
        description="SelfSubmit runs on managed cloud services — not your own servers. This page maps the usual enterprise checklist to what actually applies and what you should do."
      />

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="rounded-2xl border border-brand-green/25 bg-brand-mint/40 px-5 py-5 sm:px-6">
          <p className="text-sm leading-relaxed text-brand-black/90">
            <strong>{appliesCount} of 10</strong> items apply directly.{" "}
            <strong>Firewall</strong> in the traditional sense does not — Vercel + Neon + HTTPS + auth replace it. You
            do not need to buy servers or install iptables.
          </p>
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-brand-black">Your stack</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/80">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-brand-black">
                <tr>
                  <th className="px-4 py-3 font-semibold sm:px-5">Layer</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Provider</th>
                  <th className="hidden px-4 py-3 font-semibold sm:table-cell sm:px-5">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {INFRA_STACK.map((row) => (
                  <tr key={row.layer}>
                    <td className="px-4 py-3 font-medium text-brand-black sm:px-5">{row.layer}</td>
                    <td className="px-4 py-3 text-brand-muted sm:px-5">{row.provider}</td>
                    <td className="hidden px-4 py-3 text-brand-muted sm:table-cell sm:px-5">{row.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 space-y-6">
          <h2 className="text-xl font-bold text-brand-black">Checklist</h2>
          {INFRASTRUCTURE_ITEMS.map((item) => (
            <article
              key={item.id}
              className={`rounded-2xl border px-5 py-5 sm:px-6 ${
                item.applies ? "border-slate-200/80 bg-white" : "border-dashed border-slate-300 bg-slate-50"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-base font-bold text-brand-black">{item.title}</h3>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${RESPONSIBILITY_STYLE[item.responsibility]}`}
                  >
                    {RESPONSIBILITY_LABEL[item.responsibility]}
                  </span>
                  {!item.applies ? (
                    <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      N/A — different model
                    </span>
                  ) : null}
                </div>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">{item.summary}</p>
              {item.providerNote ? (
                <p className="mt-2 text-sm leading-relaxed text-brand-black/80">
                  <strong className="text-brand-black">Provider:</strong> {item.providerNote}
                </p>
              ) : null}
              {item.yourActions.length > 0 ? (
                <div className="mt-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-black">What to do</p>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-brand-muted">
                    {item.yourActions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200/80 bg-slate-50 px-5 py-6 sm:px-8">
          <h2 className="text-base font-bold text-brand-black">Recommended next steps (priority order)</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-brand-muted">
            <li>Confirm Neon backups / PITR on your plan.</li>
            <li>Bookmark Vercel Logs and Neon Monitoring; check after each production deploy.</li>
            <li>Verify Stripe + Clerk webhooks show successful deliveries in their dashboards.</li>
            <li>Once before HMRC live filing: restore Neon to a test branch and spot-check data.</li>
            <li>Write a one-page DR note (email + status page + provider status URLs) — keep it in your records.</li>
            <li>Optional: free uptime monitor on https://www.selfsubmit.co.uk and Sentry for error alerts.</li>
          </ol>
        </section>

        <div className="mt-10 flex flex-wrap gap-4 border-t border-slate-200/80 pt-8 text-sm font-semibold">
          <Link href="/status" className="text-brand-green underline-offset-2 hover:underline">
            System status
          </Link>
          <Link href="/security" className="text-brand-green underline-offset-2 hover:underline">
            Security
          </Link>
          <Link href="/data-retention" className="text-brand-green underline-offset-2 hover:underline">
            Data retention
          </Link>
          <a
            href={`mailto:${COMPANY.supportEmail}?subject=Infrastructure%20enquiry`}
            className="text-brand-green underline-offset-2 hover:underline"
          >
            Contact ops
          </a>
        </div>
      </div>
    </SitePageShell>
  );
}
