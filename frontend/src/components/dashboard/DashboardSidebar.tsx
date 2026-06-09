"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ClipboardList, CreditCard, LayoutDashboard, Receipt, Send, Settings, X } from "lucide-react";

import type { DashboardShellProfile } from "@/lib/dashboard-profile";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/pricing", label: "Choose plan", icon: CreditCard },
  { href: "/add-business", label: "Create business", icon: Building2 },
  { href: "/submit", label: "Submit to HMRC", icon: Send },
  { href: "/dashboard/receipts", label: "Receipts", icon: Receipt },
  { href: "/dashboard/submissions", label: "Submission history", icon: ClipboardList },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

type Props = {
  profile: Pick<DashboardShellProfile, "firstName" | "lastName" | "businessName">;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardSidebar({ profile, mobileOpen, onCloseMobile }: Props) {
  const pathname = usePathname();
  const displayName = `${profile.firstName} ${profile.lastName}`.trim();
  const subtitle = profile.businessName || "SelfSubmit client";

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onCloseMobile}
        aria-hidden
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(100vw,17.5rem)] flex-col bg-brand-ink transition-transform duration-300 ease-out lg:static lg:z-0 lg:w-64 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green text-sm font-bold text-white shadow-lg shadow-brand-green/30">
            SS
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold tracking-tight text-white">SelfSubmit</p>
            <p className="text-xs text-slate-400">Client dashboard</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Dashboard">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(pathname, href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={onCloseMobile}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-brand-green text-white shadow-md shadow-brand-green/30"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                    active ? "text-white" : "text-slate-400 group-hover:text-white"
                  }`}
                  strokeWidth={2}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-green-bright to-brand-green-dark text-sm font-bold text-white">
              {profile.firstName.charAt(0)}
              {profile.lastName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{displayName}</p>
              <p className="truncate text-xs text-slate-400">{subtitle}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
