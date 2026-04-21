"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import { HashLink } from "@/components/landing/HashLink";

const linkClass =
  "rounded-full px-3 py-2 text-[15px] font-medium text-brand-black/80 no-underline transition hover:bg-brand-mint hover:text-brand-green";

const signInBtnClass =
  "rounded-full border border-black/20 bg-white px-4 py-2.5 text-[14px] font-semibold text-brand-black shadow-sm transition hover:border-black/35 hover:bg-neutral-50 min-[900px]:px-5 min-[900px]:text-[15px]";

function AuthActions({ compact }: { compact?: boolean }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div
        className={compact ? "h-8 w-16 animate-pulse rounded-full bg-neutral-200/90" : "h-9 w-24 animate-pulse rounded-full bg-neutral-200/90"}
        aria-hidden
      />
    );
  }

  if (isSignedIn) {
    return (
      <UserButton
        appearance={{
          elements: {
            avatarBox: "h-9 w-9 ring-2 ring-brand-green/20",
          },
        }}
      />
    );
  }

  return (
    <Link href="/sign-in" className={compact ? `${linkClass} text-sm` : signInBtnClass}>
      Sign in
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200/60 bg-white/75 shadow-sm shadow-black/[0.03] backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-white/65">
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-5 py-4 min-[900px]:px-10">
        <Logo />
        <div className="flex items-center gap-2 min-[900px]:gap-3">
          <nav className="hidden items-center gap-0.5 sm:flex" aria-label="Primary">
            <Link href="/how-it-works" className={linkClass}>
              How it works
            </Link>
            <HashLink href="/#pricing" className={linkClass}>
              Pricing
            </HashLink>
            <Link href="/tax-calculator" className={linkClass}>
              Tax calculator
            </Link>
          </nav>
          <AuthActions />
        </div>
      </div>
      <nav className="flex flex-wrap justify-center gap-1 border-t border-slate-100 px-4 pb-3 pt-1 sm:hidden" aria-label="Primary mobile">
        <Link href="/how-it-works" className={`${linkClass} text-sm`}>
          How it works
        </Link>
        <HashLink href="/#pricing" className={`${linkClass} text-sm`}>
          Pricing
        </HashLink>
        <Link href="/tax-calculator" className={`${linkClass} text-sm`}>
          Tax calculator
        </Link>
        <AuthActions compact />
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
