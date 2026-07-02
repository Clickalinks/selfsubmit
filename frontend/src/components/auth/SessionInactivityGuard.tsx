"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { sessionInactivityMs, sessionWarnMs } from "@/lib/session-config";

const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart", "click"] as const;
const ACTIVITY_THROTTLE_MS = 1_000;

/**
 * Signs the user out after a period without mouse/keyboard/touch activity.
 * Shows a short warning before logout so active readers are not surprised.
 */
export function SessionInactivityGuard() {
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();

  const idleMs = sessionInactivityMs();
  const warnMs = sessionWarnMs(idleMs);

  const lastActivityRef = useRef(Date.now());
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signingOutRef = useRef(false);

  const [showWarning, setShowWarning] = useState(false);
  const [minutesUntilLogout, setMinutesUntilLogout] = useState(0);

  const clearTimers = useCallback(() => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    logoutTimerRef.current = null;
    warnTimerRef.current = null;
  }, []);

  const logout = useCallback(async () => {
    if (signingOutRef.current) return;
    signingOutRef.current = true;
    clearTimers();
    setShowWarning(false);
    try {
      await signOut();
    } finally {
      router.replace("/sign-in?reason=inactive");
    }
  }, [clearTimers, router, signOut]);

  const scheduleTimers = useCallback(() => {
    clearTimers();
    setShowWarning(false);

    const elapsed = Date.now() - lastActivityRef.current;
    const remaining = idleMs - elapsed;

    if (remaining <= 0) {
      void logout();
      return;
    }

    const warnIn = remaining - warnMs;
    if (warnIn <= 0) {
      setMinutesUntilLogout(Math.max(1, Math.ceil(remaining / 60_000)));
      setShowWarning(true);
    } else {
      warnTimerRef.current = setTimeout(() => {
        setMinutesUntilLogout(Math.max(1, Math.ceil(warnMs / 60_000)));
        setShowWarning(true);
      }, warnIn);
    }

    logoutTimerRef.current = setTimeout(() => {
      void logout();
    }, remaining);
  }, [clearTimers, idleMs, logout, warnMs]);

  const staySignedIn = useCallback(() => {
    lastActivityRef.current = Date.now();
    scheduleTimers();
  }, [scheduleTimers]);

  useEffect(() => {
    if (!isSignedIn) {
      clearTimers();
      setShowWarning(false);
      signingOutRef.current = false;
      return;
    }

    lastActivityRef.current = Date.now();
    scheduleTimers();

    let lastThrottle = 0;
    const onActivity = () => {
      const now = Date.now();
      if (now - lastThrottle < ACTIVITY_THROTTLE_MS) return;
      lastThrottle = now;
      lastActivityRef.current = now;
      scheduleTimers();
    };

    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= idleMs) {
        void logout();
      } else {
        scheduleTimers();
      }
    };

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, onActivity, { passive: true });
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearTimers();
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, onActivity);
      }
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [clearTimers, idleMs, isSignedIn, logout, scheduleTimers]);

  if (!isSignedIn || !showWarning) return null;

  return (
    <div
      role="alertdialog"
      aria-labelledby="session-timeout-title"
      aria-describedby="session-timeout-desc"
      className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-lg shadow-amber-900/10 sm:inset-x-auto sm:right-6 sm:bottom-6"
    >
      <p id="session-timeout-title" className="text-sm font-semibold text-amber-950">
        Still there?
      </p>
      <p id="session-timeout-desc" className="mt-1 text-sm text-amber-900/90">
        You will be signed out in about {minutesUntilLogout} minute{minutesUntilLogout === 1 ? "" : "s"} due to
        inactivity.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={staySignedIn}
          className="rounded-xl bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:bg-brand-green-dark"
        >
          Stay signed in
        </button>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-100"
        >
          Sign out now
        </button>
      </div>
    </div>
  );
}
