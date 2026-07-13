"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import type { PlanId } from "@/lib/plan-config";

export function usePlanCheckout() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectPlan = useCallback(
    async (plan: PlanId) => {
      setError(null);

      if (!userId) {
        router.push(`/sign-in?redirect_url=${encodeURIComponent("/pricing")}`);
        return;
      }

      setPending(plan);
      try {
        const res = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          url?: string;
          mode?: "stripe" | "manual" | "upgrade";
        };
        if (!res.ok) {
          setError(data.error ?? "Could not start checkout.");
          return;
        }
        if ((data.mode === "stripe" || data.mode === "upgrade") && data.url) {
          window.location.assign(data.url);
          return;
        }
        router.push("/add-business");
        router.refresh();
      } finally {
        setPending(null);
      }
    },
    [router, userId],
  );

  return { isLoaded, userId, pending, error, selectPlan, setError };
}
