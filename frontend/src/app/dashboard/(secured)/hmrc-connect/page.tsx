import type { Metadata } from "next";
import { Suspense } from "react";

import { HmrcBusinessLinkSection } from "@/components/dashboard/HmrcBusinessLinkSection";
import { HmrcConnectionSection } from "@/components/dashboard/HmrcConnectionSection";
import { TaxIdsSection } from "@/components/dashboard/TaxIdsSection";
import { MtdInYearScopeNotice } from "@/components/mtd/MtdInYearScopeNotice";

export const metadata: Metadata = {
  title: "HMRC connect — SelfSubmit",
  description: "Connect your HMRC account, save your UTR and NI number, and link your business.",
};

export default function HmrcConnectPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">HMRC connect</h2>
        <p className="mt-2 text-sm text-slate-600">
          Connect to HMRC, save your tax details, and link your SelfSubmit business. New users complete these steps on
          the dashboard during setup — use this page to update or fix your connection later.
        </p>
      </div>

      <MtdInYearScopeNotice />

      <div id="tax-details">
        <TaxIdsSection />
      </div>

      <Suspense fallback={null}>
        <HmrcConnectionSection />
      </Suspense>

      <Suspense fallback={null}>
        <HmrcBusinessLinkSection />
      </Suspense>
    </div>
  );
}
