"use client";

import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import { HeaderAuth } from "@/components/auth/HeaderAuth";

const linkClass =
  "rounded-full px-3 py-2 text-[15px] font-medium text-brand-black/80 no-underline transition hover:bg-brand-mint hover:text-brand-green";

function AddBusinessNavLink({ className }: { className: string }) {
  const { isLoaded, userId } = useAuth();
  if (!isLoaded || !userId) return null;
  return (
    <Link href="/add-business" className={className}>
      Add business
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200/60 bg-white/75 shadow-sm shadow-black/[0.03] backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-white/65">
      <div className="mx-auto flex max-w-content items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4 lg:px-10">
        <Logo />
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 min-[640px]:gap-3">
          <nav className="hidden min-w-0 items-center gap-0.5 md:flex" aria-label="Primary">
            <Link href="/how-it-works" className={linkClass}>
              How it works
            </Link>
            <Link href="/pricing" className={linkClass}>
              Pricing
            </Link>
            <AddBusinessNavLink className={linkClass} />
            <Link href="/tax-calculator" className={linkClass}>
              Tax calculator
            </Link>
          </nav>
          <div className="flex items-center gap-1.5 sm:gap-2 md:border-l md:border-slate-200/80 md:pl-4 lg:gap-2.5 lg:pl-5">
            <HeaderAuth />
          </div>
        </div>
      </div>
      <nav className="flex flex-wrap justify-center gap-1 border-t border-slate-100 px-3 pb-3 pt-1 md:hidden" aria-label="Primary mobile">
        <Link href="/how-it-works" className={`${linkClass} text-sm`}>
          How it works
        </Link>
        <Link href="/pricing" className={`${linkClass} text-sm`}>
          Pricing
        </Link>
        <AddBusinessNavLink className={`${linkClass} text-sm`} />
        <Link href="/tax-calculator" className={`${linkClass} text-sm`}>
          Tax calculator
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
      <span className="inline-flex">
        <Image
          src="/brand/selfsubmit-logo.png"
          alt="SelfSubmit"
          width={632}
          height={204}
          priority
          sizes="(max-width: 639px) 260px, (max-width: 1023px) 300px, 360px"
          className="h-12 w-auto max-w-[min(300px,78vw)] object-contain object-left min-[900px]:h-14 min-[900px]:max-w-[min(380px,42vw)] min-[1280px]:h-16 min-[1280px]:max-w-[400px]"
        />
      </span>
    </Link>
  );
}
