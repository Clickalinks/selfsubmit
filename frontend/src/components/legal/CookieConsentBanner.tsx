"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  CONSENT_POLICY_VERSION,
  CONSENT_TYPES,
  COOKIE_CONSENT_STORAGE_KEY,
  type StoredCookieConsent,
} from "@/lib/consent-config";

function readStoredConsent(): StoredCookieConsent | null {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredCookieConsent;
    if (parsed?.version === CONSENT_POLICY_VERSION && parsed.granted) return parsed;
    return null;
  } catch {
    return null;
  }
}

function storeConsent() {
  const payload: StoredCookieConsent = {
    version: CONSENT_POLICY_VERSION,
    granted: true,
    recordedAt: new Date().toISOString(),
  };
  localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(payload));
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readStoredConsent() === null);
  }, []);

  const accept = async () => {
    storeConsent();
    setVisible(false);
    try {
      await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consentType: CONSENT_TYPES.COOKIE_ESSENTIAL,
          granted: true,
          policyVersion: CONSENT_POLICY_VERSION,
        }),
      });
    } catch {
      // Banner still dismissed locally; server log is best-effort.
    }
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur-sm supports-[padding:max(0px)]:pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p id="cookie-consent-title" className="text-sm font-bold text-brand-black">
            Cookies on SelfSubmit
          </p>
          <p id="cookie-consent-desc" className="mt-1 text-sm leading-relaxed text-brand-muted">
            We use <strong className="font-semibold text-brand-black">strictly necessary</strong> cookies to keep you
            signed in, protect your account, and run the service. We do not use advertising or non-essential tracking
            cookies. See our{" "}
            <Link href="/cookies" className="font-semibold text-brand-green underline underline-offset-2">
              Cookie policy
            </Link>
            .
          </p>
        </div>
        <button
          type="button"
          onClick={() => void accept()}
          className="shrink-0 rounded-xl bg-brand-green px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-green-dark"
        >
          Accept &amp; continue
        </button>
      </div>
    </div>
  );
}
