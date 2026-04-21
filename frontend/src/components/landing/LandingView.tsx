"use client";

import { useEffect } from "react";

import { FeaturesRow } from "@/components/landing/FeaturesRow";
import { HeroSection } from "@/components/landing/HeroSection";
import { PricingBanner } from "@/components/landing/PricingBanner";
import { ProfessionRow } from "@/components/landing/ProfessionRow";
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
    <>
      <div className="min-h-screen">
        <SiteHeader />
        <HeroSection />
        <ProfessionRow />
        <FeaturesRow />
        <PricingBanner />
        <SiteFooter />
      </div>
    </>
  );
}
