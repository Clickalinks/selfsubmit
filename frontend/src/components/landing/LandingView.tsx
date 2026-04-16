"use client";

import { useCallback, useEffect, useState } from "react";

import { FeaturesRow } from "@/components/landing/FeaturesRow";
import { HeroSection } from "@/components/landing/HeroSection";
import { PricingBanner } from "@/components/landing/PricingBanner";
import { ProfessionRow } from "@/components/landing/ProfessionRow";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";

/** Never put a DOM/React event object into toast state (renders as "[object Event]"). */
function toToastMessage(input: unknown): string {
  if (typeof input === "string") {
    return input;
  }
  return "Action recorded";
}

export function LandingView() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: unknown) => {
    setToast(toToastMessage(message));
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.replace(/^#/, "");
      if (!id) return;
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return (
    <>
      <div className="min-h-screen">
        <SiteHeader onSignIn={() => showToast("Sign In — coming next")} />
        <HeroSection />
        <ProfessionRow />
        <FeaturesRow />
        <PricingBanner />
        <SiteFooter />
      </div>
      {toast ? (
        <div
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-black/10 bg-white/90 px-5 py-3 text-sm text-brand-black shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-white/80"
          role="status"
        >
          {toast}
        </div>
      ) : null}
    </>
  );
}
