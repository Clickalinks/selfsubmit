"use client";

import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";

const clerkUserButtonAppearance = {
  elements: {
    avatarBox: "h-9 w-9 ring-2 ring-brand-green/25",
  },
} as const;

const signInBtnClass =
  "inline-flex min-h-10 items-center justify-center rounded-xl border-2 border-brand-green bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-green transition hover:bg-brand-mint min-[400px]:px-3.5 sm:px-4 sm:py-2 sm:text-sm";

const signUpBtnClass =
  "inline-flex min-h-10 items-center justify-center rounded-xl bg-brand-green px-2.5 py-1.5 text-xs font-semibold text-white shadow-btn-green transition hover:bg-brand-green-dark min-[400px]:px-3.5 sm:px-4 sm:py-2 sm:text-sm";

const dashboardLinkClass =
  "hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-brand-black transition hover:bg-brand-mint min-[480px]:inline-flex";

export function HeaderAuth() {
  const { isSignedIn, isLoaded } = useAuth();

  // Show sign-in links while Clerk loads or if signed out (avoids empty header on slow/failed init).
  const showGuestLinks = !isLoaded || !isSignedIn;

  return (
    <div className="flex shrink-0 items-center gap-1 sm:gap-2 md:gap-3">
      {showGuestLinks ? (
        <>
          <Link href="/sign-in" className={signInBtnClass}>
            Sign in
          </Link>
          <Link href="/sign-up" className={signUpBtnClass}>
            Sign up
          </Link>
        </>
      ) : (
        <>
          <Link href="/dashboard" className={dashboardLinkClass}>
            Dashboard
          </Link>
          <UserButton
            appearance={clerkUserButtonAppearance}
            userProfileMode="navigation"
            userProfileUrl="/dashboard"
          />
        </>
      )}
    </div>
  );
}
