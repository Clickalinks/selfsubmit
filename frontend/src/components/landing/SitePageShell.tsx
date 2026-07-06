import type { ReactNode } from "react";

import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";

type SitePageShellProps = {
  children: ReactNode;
};

export function SitePageShell({ children }: SitePageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

type SitePageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SitePageHero({ eyebrow, title, description }: SitePageHeroProps) {
  return (
    <div className="border-b border-slate-200/80 bg-gradient-to-b from-slate-50 to-white px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-green sm:text-sm">{eyebrow}</p>
        ) : null}
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-brand-black sm:text-4xl lg:text-5xl">{title}</h1>
        {description ? (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-brand-muted sm:text-lg">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
