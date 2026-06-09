"use client";

import { useEffect } from "react";

import { MtdCategoriesSection } from "@/components/landing/MtdCategoriesSection";
import { MtdCtaBanner } from "@/components/landing/MtdCtaBanner";
import { MtdInsightsSection } from "@/components/landing/MtdInsightsSection";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";

export function LandingView() {
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
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white">
      <SiteHeader />
      <MtdCategoriesSection />
      <MtdInsightsSection />
      <MtdCtaBanner />
      <SiteFooter />
    </div>
  );
}
