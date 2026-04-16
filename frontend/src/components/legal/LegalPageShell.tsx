import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPageShell({
  title,
  description,
  lastUpdated,
  children,
}: {
  title: string;
  description?: string;
  lastUpdated?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen pb-20">
      <div className="border-b border-black/10 bg-white/80 shadow-sm shadow-black/[0.04] backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-5 py-4 min-[900px]:px-10">
          <Link href="/" className="text-sm font-semibold text-brand-green underline-offset-4 hover:underline">
            ← Home
          </Link>
        </div>
      </div>
      <article className="mx-auto max-w-prose px-5 py-10 min-[900px]:py-14">
        <h1 className="text-3xl font-bold tracking-tight text-brand-black min-[900px]:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-3 text-base leading-relaxed text-brand-muted min-[900px]:text-lg">{description}</p>
        ) : null}
        {lastUpdated ? <p className="mt-3 text-sm text-brand-muted">Last updated: {lastUpdated}</p> : null}
        <div className="mt-10">{children}</div>
      </article>
    </div>
  );
}

export function LegalH2({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      className="mt-10 scroll-mt-24 text-xl font-bold text-brand-black first:mt-0 min-[900px]:text-2xl"
    >
      {children}
    </h2>
  );
}

export function LegalP({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-[15px] leading-relaxed text-brand-muted min-[900px]:text-base">{children}</p>;
}

export function LegalUl({ children }: { children: ReactNode }) {
  return (
    <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-brand-muted min-[900px]:text-base">
      {children}
    </ul>
  );
}

export function LegalOl({ children }: { children: ReactNode }) {
  return (
    <ol className="mt-4 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-brand-muted min-[900px]:text-base">
      {children}
    </ol>
  );
}

export function LegalCallout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="mt-6 rounded-xl border border-brand-green/30 bg-brand-mint/60 px-4 py-4 min-[900px]:px-5 min-[900px]:py-5">
      <p className="text-sm font-bold text-brand-black">{title}</p>
      <div className="mt-2 text-sm leading-relaxed text-brand-black/90">{children}</div>
    </aside>
  );
}

export function LegalFooterNav() {
  const links = [
    { href: "/how-it-works", label: "How it works" },
    { href: "/about", label: "About us" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/cookies", label: "Cookies" },
    { href: "/gdpr", label: "GDPR & data" },
    { href: "/disclaimer", label: "Disclaimer & illustrations" },
    { href: "/accessibility", label: "Accessibility" },
    { href: "/tax-calculator", label: "Tax calculator" },
    { href: "/hmrc-agent", label: "HMRC agent" },
  ] as const;
  return (
    <nav
      className="mt-14 border-t border-black/10 pt-8 text-sm text-brand-muted"
      aria-label="Related pages"
    >
      <p className="font-semibold text-brand-black">Related</p>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-brand-green underline-offset-2 hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
