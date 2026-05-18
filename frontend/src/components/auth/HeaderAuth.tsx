"use client";

import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";

const clerkUserButtonAppearance = {
  elements: {
    avatarBox: "h-9 w-9 ring-2 ring-brand-green/20",
  },
} as const;

const signInBtnClass =
  "inline-flex items-center justify-center rounded-full border border-black/20 bg-white px-3 py-2 text-xs font-semibold text-brand-black shadow-sm transition hover:border-black/35 hover:bg-neutral-50 sm:px-3.5 sm:text-sm lg:px-4 lg:text-[15px]";

const signUpBtnClass =
  "inline-flex items-center justify-center rounded-full bg-gradient-to-b from-brand-green-bright to-brand-green-dark px-3 py-2 text-xs font-semibold text-white shadow-btn-green transition hover:brightness-105 sm:px-3.5 sm:text-sm lg:px-4 lg:text-[15px]";

const dashboardLinkClass =
  "hidden rounded-full border border-black/15 bg-white px-3.5 py-2 text-sm font-semibold text-brand-black transition hover:bg-neutral-50 min-[480px]:inline-flex lg:text-[15px]";

export function HeaderAuth() {
  return (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:gap-2.5">
      <Show when="signed-out">
        <Link href="/sign-in" className={signInBtnClass}>
          Sign in
        </Link>
        <Link href="/sign-up" className={signUpBtnClass}>
          Sign up
        </Link>
      </Show>
      <Show when="signed-in">
        <Link href="/dashboard" className={dashboardLinkClass}>
          Dashboard
        </Link>
        <UserButton
          appearance={clerkUserButtonAppearance}
          userProfileMode="navigation"
          userProfileUrl="/dashboard"
        />
      </Show>
    </div>
  );
}
