"use client";

import Link from "next/link";

import { SelfSubmitLogo } from "@/components/brand/SelfSubmitLogo";
import { HeaderAuth } from "@/components/auth/HeaderAuth";

const linkClass =
  "rounded-lg px-3 py-2 text-[15px] font-medium text-brand-grey no-underline transition hover:text-brand-green";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white shadow-sm">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          <Link href="/how-it-works" className={linkClass}>
            How it works
          </Link>
          <Link href="/#mtd-categories" className={linkClass}>
            MTD for You
          </Link>
          <Link href="/contact" className={linkClass}>
            Contact us
          </Link>
          <Link href="/how-it-works#faq" className={linkClass}>
            FAQ
          </Link>
        </nav>
        <HeaderAuth />
      </div>
      <nav className="flex flex-wrap justify-center gap-1 border-t border-slate-100 px-3 pb-3 pt-2 md:hidden" aria-label="Primary mobile">
        <Link href="/how-it-works" className={`${linkClass} text-sm`}>
          How it works
        </Link>
        <Link href="/#mtd-categories" className={`${linkClass} text-sm`}>
          MTD for You
        </Link>
        <Link href="/contact" className={`${linkClass} text-sm`}>
          Contact us
        </Link>
        <Link href="/how-it-works#faq" className={`${linkClass} text-sm`}>
          FAQ
        </Link>
      </nav>
    </header>
  );
}

function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex shrink-0 items-center outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-green/50"
      aria-label="SelfSubmit home"
    >
      <SelfSubmitLogo variant="dark" />
    </Link>
  );
}
