"use client";

import { ShieldAlert } from "lucide-react";

/**
 * Informational banner for login protection. Lockout checks run server-side via
 * /api/auth/login-protection and the Clerk session.created webhook — not via
 * client hooks (embedded <SignIn /> does not expose sign-in state to legacy hooks).
 */
export function LoginProtectionGuard({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-4 flex items-start gap-2 rounded-xl border border-brand-mint bg-brand-mint/80 px-4 py-3 text-xs text-brand-forest sm:text-sm">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
        <p>
          Login protection is active: rate limiting, temporary lockouts after failed attempts, suspicious sign-in
          detection, and security alerts on your dashboard.
        </p>
      </div>
      {children}
    </div>
  );
}
