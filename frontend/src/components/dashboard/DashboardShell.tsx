"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Bell, Menu } from "lucide-react";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import type { ClientProfileRecord } from "@/lib/profile-server";

type Props = {
  profile: ClientProfileRecord;
  title: string;
  children: ReactNode;
};

export function DashboardShell({ profile, title, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-brand-mint/40">
      <DashboardSidebar
        profile={profile}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-0">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/80 min-[900px]:px-8">
          <button
            type="button"
            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 min-[900px]:text-xl">{title}</h1>
            <p className="hidden text-sm text-slate-500 sm:block">
              Welcome back, {profile.firstName}
            </p>
          </div>
          <button
            type="button"
            className="hidden rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 sm:inline-flex"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          <UserButton
            appearance={{
              elements: { avatarBox: "h-9 w-9 ring-2 ring-brand-green/25" },
            }}
          />
        </header>

        <main className="flex-1 px-4 py-6 min-[900px]:px-8 min-[900px]:py-8">{children}</main>
      </div>
    </div>
  );
}
