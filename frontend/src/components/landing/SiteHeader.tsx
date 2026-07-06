"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { HeaderAuth } from "@/components/auth/HeaderAuth";
import { SelfSubmitLogo } from "@/components/brand/SelfSubmitLogo";

const linkClass =
  "rounded-lg px-3 py-2 text-[15px] font-medium text-brand-grey no-underline transition hover:bg-brand-mint hover:text-brand-green";

const mobileLinkClass =
  "block rounded-xl px-4 py-3 text-base font-semibold text-brand-black no-underline transition hover:bg-brand-mint";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white shadow-sm supports-[padding:max(0px)]:pt-[max(0px,env(safe-area-inset-top))]">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <HeaderAuth />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-brand-black transition hover:bg-slate-50 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-site-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-site-nav"
          className="border-t border-slate-100 bg-white px-3 py-3 md:hidden supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          aria-label="Primary mobile"
        >
          <ul className="space-y-1">
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={mobileLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex min-w-0 shrink items-center outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-green/50"
      aria-label="SelfSubmit home"
    >
      <SelfSubmitLogo variant="dark" compact />
    </Link>
  );
}
