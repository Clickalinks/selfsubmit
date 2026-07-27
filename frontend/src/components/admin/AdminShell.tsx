import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { Shield } from "lucide-react";

type Props = {
  role: string;
  children: ReactNode;
};

export function AdminShell({ role, children }: Props) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-slate-900 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-emerald-400" aria-hidden />
            <div>
              <p className="text-sm font-bold tracking-tight">SelfSubmit Admin</p>
              <p className="text-xs text-slate-400">Role: {role}</p>
            </div>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/admin" className="text-slate-200 hover:text-white">
              Overview
            </Link>
            <Link href="/dashboard" className="text-slate-400 hover:text-white">
              Customer app
            </Link>
            <UserButton
              appearance={{
                elements: { avatarBox: "h-8 w-8 ring-2 ring-emerald-500/40" },
              }}
            />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
