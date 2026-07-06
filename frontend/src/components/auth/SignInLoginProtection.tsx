"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldAlert, ShieldX } from "lucide-react";

function findEmailInput(root: ParentNode): HTMLInputElement | null {
  return root.querySelector(
    'input[name="identifier"], input[name="emailAddress"], input[type="email"], input[inputmode="email"]',
  );
}

async function postProtection<T extends object>(url: string, body: T) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as {
    allowed?: boolean;
    message?: string | null;
    lockedUntil?: string | null;
  };
}

/**
 * Wires Clerk's embedded SignIn UI to our login-protection APIs (pre-check, failure logging, lockout banners).
 */
export function SignInLoginProtection() {
  const [lockMessage, setLockMessage] = useState<string | null>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const lastFailureAtRef = useRef(0);

  useEffect(() => {
    const root = mountRef.current?.closest(".w-full.max-w-md") ?? mountRef.current?.parentElement;
    if (!root) return;

    const checkEmail = async (email: string) => {
      if (!email.includes("@")) return;
      try {
        const data = await postProtection("/api/auth/login-protection/check", { email });
        setLockMessage(!data.allowed && data.message ? data.message : null);
      } catch {
        // Fail open — Clerk sign-in still works if our store is down.
      }
    };

    const reportFailure = async (email: string) => {
      const now = Date.now();
      if (now - lastFailureAtRef.current < 4_000) return;
      lastFailureAtRef.current = now;
      try {
        const data = await postProtection("/api/auth/login-protection/failure", {
          email,
          reason: "invalid_credentials",
        });
        if (!data.allowed && data.message) setLockMessage(data.message);
      } catch {
        // ignore
      }
    };

    const onBlur = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      const name = target.name?.toLowerCase() ?? "";
      const type = target.type?.toLowerCase() ?? "";
      if (name.includes("identifier") || name.includes("email") || type === "email") {
        void checkEmail(target.value.trim());
      }
    };

    const detectFailure = () => {
      const errorNodes = root.querySelectorAll(
        '.cl-formFieldErrorText, .cl-alertText, [class*="formFieldError"], [role="alert"]',
      );
      for (const node of errorNodes) {
        const text = (node.textContent ?? "").toLowerCase();
        if (
          text.includes("password") ||
          text.includes("incorrect") ||
          text.includes("invalid") ||
          text.includes("couldn't find") ||
          text.includes("could not find") ||
          text.includes("is incorrect")
        ) {
          const email = findEmailInput(root)?.value?.trim();
          if (email) void reportFailure(email);
          break;
        }
      }
    };

    const observer = new MutationObserver(detectFailure);
    observer.observe(root, { subtree: true, childList: true, characterData: true });
    root.addEventListener("blur", onBlur, true);

    return () => {
      observer.disconnect();
      root.removeEventListener("blur", onBlur, true);
    };
  }, []);

  if (lockMessage) {
    return (
      <div ref={mountRef} className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
        <ShieldX className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>{lockMessage}</p>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="mb-4 flex items-start gap-2 rounded-xl border border-brand-mint bg-brand-mint/80 px-4 py-3 text-xs text-brand-forest sm:text-sm"
    >
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" aria-hidden />
      <p>
        Login protection is active: rate limiting, temporary lockouts after failed attempts, suspicious sign-in detection,
        and security alerts on your dashboard.
      </p>
    </div>
  );
}
