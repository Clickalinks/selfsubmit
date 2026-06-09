"use client";

import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";

const clerkUserButtonAppearance = {
  elements: {
    avatarBox: "h-9 w-9 ring-2 ring-brand-green/25",
  },
} as const;

const signInBtnClass =
  "inline-flex items-center justify-center rounded-xl border-2 border-brand-green bg-white px-4 py-2 text-sm font-semibold text-brand-green transition hover:bg-brand-mint";

const signUpBtnClass =
  "inline-flex items-center justify-center rounded-xl bg-brand-green px-4 py-2 text-sm font-semibold text-white shadow-btn-green transition hover:bg-brand-green-dark";

const dashboardLinkClass =
  "hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-brand-black transition hover:bg-brand-mint min-[480px]:inline-flex";

export function HeaderAuth() {
  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
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
