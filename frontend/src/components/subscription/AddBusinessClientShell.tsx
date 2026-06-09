"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { AddBusinessForm } from "@/components/subscription/AddBusinessForm";

export function AddBusinessCheckoutConfirm() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState<"idle" | "confirming" | "done" | "error">(
    sessionId ? "confirming" : "idle",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/billing/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (cancelled) return;
        if (!res.ok) {
          setStatus("error");
          setError(data.error ?? "Could not confirm payment.");
          return;
        }
        setStatus("done");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setError("Could not confirm payment.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (status === "confirming") {
    return (
      <div className="mb-8 flex items-center gap-3 rounded-2xl border border-brand-green/20 bg-brand-mint/40 px-5 py-4 text-sm text-brand-forest">
        <Loader2 className="h-5 w-5 animate-spin" />
        Confirming your subscription…
      </div>
    );
  }

  if (status === "error") {
    return (
      <p className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
        {error} You can retry from the{" "}
        <a href="/pricing" className="font-semibold underline">
          pricing page
        </a>
        .
      </p>
    );
  }

  if (status === "done") {
    return (
      <p className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
        Payment confirmed — add your business below to continue.
      </p>
    );
  }

  return null;
}

export function AddBusinessClientShell() {
  return (
    <>
      <AddBusinessCheckoutConfirm />
      <AddBusinessForm />
    </>
  );
}
