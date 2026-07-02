import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { CalendarClock, TrendingDown, TrendingUp } from "lucide-react";

import {
  DashboardGetStartedSteps,
  DashboardPrimaryActions,
  DashboardStat,
  MtdStatusBadge,
  WhatDoINeedTodayCard,
} from "@/components/dashboard/DashboardHomeSections";
import { BusinessSwitcher } from "@/components/dashboard/BusinessSwitcher";
import { TaxIdsSection } from "@/components/dashboard/TaxIdsSection";
import { emptyMtdDashboardSnapshot, formatGbp, getMtdDashboardSnapshot } from "@/lib/mtd-dashboard";
import { getClientProfile } from "@/lib/profile-server";
import { getUserPlan } from "@/lib/subscription-server";
import { PLAN_DISPLAY_NAMES } from "@/lib/plan-config";

export const metadata: Metadata = {
  title: "Dashboard — SelfSubmit",
  description: "Your MTD compliance dashboard — see deadlines, quarterly totals, and what to do next.",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ businessId?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) return null;

  const sp = await searchParams;
  const businessId = typeof sp.businessId === "string" ? sp.businessId : undefined;

  const profile = await getClientProfile(userId);
  if (!profile) return null;

  let snapshot = emptyMtdDashboardSnapshot();
  let plan: Awaited<ReturnType<typeof getUserPlan>> = null;

  try {
    [snapshot, plan] = await Promise.all([
      getMtdDashboardSnapshot(userId, businessId),
      getUserPlan(userId),
    ]);
  } catch (err) {
    console.error("[dashboard/page] snapshot load failed", err);
  }

  const submitHref = snapshot.activeBusinessId
    ? `/submit?businessId=${encodeURIComponent(snapshot.activeBusinessId)}`
    : "/submit";

  const deadlineDisplay =
    snapshot.daysUntilDeadline !== null && snapshot.daysUntilDeadline >= 0
      ? `${snapshot.daysUntilDeadline} day${snapshot.daysUntilDeadline === 1 ? "" : "s"}`
      : snapshot.daysUntilDeadline !== null
        ? "Overdue"
        : "—";

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Hello {profile.firstName}</p>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Your MTD dashboard</h2>
          {snapshot.activeBusinessName ? (
            <p className="mt-1 text-sm text-slate-600">
              Viewing{" "}
              <span className="font-semibold text-slate-900">{snapshot.activeBusinessName}</span>
              {snapshot.activeBusinessCategory ? (
                <span className="text-slate-500"> · {snapshot.activeBusinessCategory}</span>
              ) : null}
            </p>
          ) : null}
          <div className="mt-3 min-[900px]:hidden">
            <BusinessSwitcher basePath="/dashboard" />
          </div>
        </div>
        {plan ? (
          <p className="text-sm text-slate-500">
            Plan:{" "}
            <span className="font-semibold text-brand-green">{PLAN_DISPLAY_NAMES[plan]}</span>
            {!snapshot.hasBusiness ? (
              <>
                {" "}
                ·{" "}
                <Link href="/add-business" className="font-semibold text-brand-green hover:underline">
                  Add business
                </Link>
              </>
            ) : null}
          </p>
        ) : snapshot.hasTaxIds ? (
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-xl bg-brand-green px-4 py-2 text-sm font-bold text-white hover:bg-brand-green-dark"
          >
            Get started — choose plan
          </Link>
        ) : null}
      </div>

      <DashboardGetStartedSteps
        hasPlan={snapshot.hasPlan}
        hasBusiness={snapshot.hasBusiness}
        hasTaxIds={snapshot.hasTaxIds}
      />

      <div id="tax-details">
        <TaxIdsSection />
      </div>

      <WhatDoINeedTodayCard
        message={snapshot.todayMessage}
        tone={snapshot.todayTone}
        hasPlan={snapshot.hasPlan}
        hasBusiness={snapshot.hasBusiness}
        hasTaxIds={snapshot.hasTaxIds}
        submitHref={submitHref}
      />

      {snapshot.canSwitchBusiness ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm font-semibold text-slate-900">Your businesses</p>
          <p className="mt-1 text-sm text-slate-500">
            Switch between businesses to see separate income, expenses, and returns for each.
          </p>
          <div className="mt-4">
            <BusinessSwitcher basePath="/dashboard" />
          </div>
        </section>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5 lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">MTD status</p>
          <div className="mt-3">
            <MtdStatusBadge status={snapshot.mtdStatus} label={snapshot.mtdStatusLabel} />
          </div>
        </div>
        <DashboardStat
          label="Next deadline"
          value={deadlineDisplay}
          icon={CalendarClock}
          accent="text-sky-700"
        />
        <DashboardStat
          label={`${snapshot.currentQuarter.label} income`}
          value={formatGbp(snapshot.quarterIncomeGbp)}
          icon={TrendingUp}
        />
        <DashboardStat
          label={`${snapshot.currentQuarter.label} expenses`}
          value={formatGbp(snapshot.quarterExpensesGbp)}
          icon={TrendingDown}
          accent="text-amber-700"
        />
        <DashboardStat
          label="Estimated profit"
          value={formatGbp(snapshot.estimatedProfitGbp)}
          icon={TrendingUp}
          accent="text-emerald-700"
        />
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-slate-700">Quick actions</p>
        <DashboardPrimaryActions
          hasPlan={snapshot.hasPlan}
          hasBusiness={snapshot.hasBusiness}
          hasTaxIds={snapshot.hasTaxIds}
          submitHref={submitHref}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/submissions"
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-brand-green/30 hover:shadow-md"
        >
          <p className="text-sm font-bold text-slate-900">Submission history</p>
          <p className="mt-1 text-sm text-slate-500">View past HMRC updates and references.</p>
        </Link>
        <Link
          href="/dashboard/receipts"
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-brand-green/30 hover:shadow-md"
        >
          <p className="text-sm font-bold text-slate-900">Documents & receipts</p>
          <p className="mt-1 text-sm text-slate-500">
            {snapshot.receiptCount === 0
              ? "No documents uploaded yet."
              : `${snapshot.receiptCount} document${snapshot.receiptCount === 1 ? "" : "s"} stored securely.`}
          </p>
        </Link>
      </div>
    </div>
  );
}
