"use client";

import { useSignIn } from "@clerk/nextjs/legacy";
import { ShieldAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ProtectionResponse = {
  allowed: boolean;
  message?: string | null;
  lockedUntil?: string | null;
};

async function postProtection(
  path: "check" | "failure",
  body: Record<string, string>,
): Promise<ProtectionResponse> {
  const res = await fetch(`/api/auth/login-protection/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as ProtectionResponse & { error?: string };
  return {
    allowed: res.ok && data.allowed !== false,
    message: data.message ?? data.error ?? null,
    lockedUntil: data.lockedUntil ?? null,
  };
}

export function LoginProtectionGuard({ children }: { children: React.ReactNode }) {
  const { signIn, isLoaded } = useSignIn();
  const [blockMessage, setBlockMessage] = useState<string | null>(null);
  const lastIdentifier = useRef<string | null>(null);
  const recordedFailureKeys = useRef<Set<string>>(new Set());

  const identifier = signIn?.identifier?.trim() || null;
  const verificationStatus = signIn?.firstFactorVerification?.status;
  const verificationError = signIn?.firstFactorVerification?.error?.message;

  useEffect(() => {
    if (!isLoaded || !identifier) return;

    if (identifier !== lastIdentifier.current) {
      lastIdentifier.current = identifier;
      void postProtection("check", { email: identifier }).then((result) => {
        setBlockMessage(result.allowed ? null : (result.message ?? "Sign-in is temporarily blocked."));
      });
    }
  }, [isLoaded, identifier]);

  useEffect(() => {
    if (!isLoaded || !identifier) return;
    if (verificationStatus !== "failed" && !verificationError) return;

    const errorMessage = verificationError ?? "Sign-in failed";
    const failureKey = `${identifier}:${errorMessage}`;
    if (recordedFailureKeys.current.has(failureKey)) return;
    recordedFailureKeys.current.add(failureKey);

    void postProtection("failure", { email: identifier, reason: errorMessage }).then((result) => {
      if (!result.allowed && result.message) {
        setBlockMessage(result.message);
      }
    });
  }, [isLoaded, identifier, verificationStatus, verificationError]);

  return (
    <div>
      <div className="mb-4 flex items-start gap-2 rounded-xl border border-brand-mint bg-brand-mint/80 px-4 py-3 text-xs text-brand-forest sm:text-sm">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
        <p>
          Login protection is active: rate limiting, temporary lockouts after failed attempts, suspicious sign-in
          detection, and security alerts on your dashboard.
        </p>
      </div>

      {blockMessage ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {blockMessage}
        </p>
      ) : null}

      {children}
    </div>
  );
}
