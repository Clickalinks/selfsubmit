import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { CalendarClock, TrendingDown, TrendingUp } from "lucide-react";

import {
  DashboardPrimaryActions,
  DashboardStat,
  MtdStatusBadge,
  WhatDoINeedTodayCard,
} from "@/components/dashboard/DashboardHomeSections";
import { BusinessSwitcher } from "@/components/dashboard/BusinessSwitcher";
import { DashboardSetupWizard } from "@/components/dashboard/DashboardSetupWizard";
import { HmrcSandboxStatusCard } from "@/components/dashboard/HmrcSandboxStatusCard";
import { isEncryptionConfigured } from "@/lib/field-encryption";
import { isHmrcOAuthConfigured } from "@/lib/hmrc-config";
import { isHmrcSandboxFilingEnabled } from "@/lib/hmrc-filing-status";
import { emptyMtdDashboardSnapshot, formatGbp, getMtdDashboardSnapshot } from "@/lib/mtd-dashboard";
import { getClientProfile } from "@/lib/profile-server";
import { SubscriptionAccessBanner } from "@/components/dashboard/SubscriptionAccessBanner";
import { getSubscriptionState } from "@/lib/billing-server";
import { getSubscriptionAccess } from "@/lib/subscription-access";
import { PLAN_DISPLAY_NAMES, type PlanId } from "@/lib/plan-config";
import { isSetupComplete } from "@/lib/setup-progress";

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
  let plan: PlanId | null = null;
  let access = getSubscriptionAccess({
    plan: null,
    active: false,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripeSubscriptionStatus: null,
    stripeCurrentPeriodEnd: null,
    stripeCancelAtPeriodEnd: false,
    subscriptionAccessEndedAt: null,
  });

  try {
    const [snapshotResult, subscription] = await Promise.all([
      getMtdDashboardSnapshot(userId, businessId),
      getSubscriptionState(userId),
    ]);
    snapshot = snapshotResult;
    plan = subscription.plan;
    access = getSubscriptionAccess(subscription);
  } catch (err) {
    console.error("[dashboard/page] snapshot load failed", err);
  }

  const setupComplete = isSetupComplete(snapshot);
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
      <SubscriptionAccessBanner access={access} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Welcome, {profile.firstName}</p>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">MTD dashboard</h2>
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
          <div className="text-sm text-slate-500">
            <p>
              Plan:{" "}
              <span className="font-semibold text-brand-green">{PLAN_DISPLAY_NAMES[plan]}</span>
              {!snapshot.hasBusiness ? (
                <>
                  {" "}
                  ·{" "}
                  <Link href="/dashboard#setup-wizard" className="font-semibold text-brand-green hover:underline">
                    Add business
                  </Link>
                </>
              ) : null}
            </p>
            {access.phase === "ending" && access.periodEnd ? (
              <p className="mt-1 font-bold text-red-600">
                Access ends {access.periodEnd.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            ) : null}
          </div>
        ) : !setupComplete || access.phase === "grace" || access.phase === "lapsed" ? (
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-xl bg-brand-green px-4 py-2 text-sm font-bold text-white hover:bg-brand-green-dark"
          >
            {access.phase === "grace" || access.phase === "lapsed" ? "Resubscribe" : "Choose a plan"}
          </Link>
        ) : null}
      </div>

      {!setupComplete ? (
        <Suspense fallback={null}>
          <DashboardSetupWizard
            hasPlan={snapshot.hasPlan}
            hasBusiness={snapshot.hasBusiness}
            hasTaxIds={snapshot.hasTaxIds}
            hmrcConnected={snapshot.hmrcConnected}
            activeBusinessHmrcId={snapshot.activeBusinessHmrcId}
            activeBusinessId={snapshot.activeBusinessId}
            activeBusinessName={snapshot.activeBusinessName}
            hmrcOAuthConfigured={isHmrcOAuthConfigured()}
            encryptionConfigured={isEncryptionConfigured()}
            submitHref={submitHref}
          />
        </Suspense>
      ) : null}

      <WhatDoINeedTodayCard
        message={snapshot.todayMessage}
        tone={snapshot.todayTone}
        hasPlan={snapshot.hasPlan}
        hasBusiness={snapshot.hasBusiness}
        hasTaxIds={snapshot.hasTaxIds}
        hmrcSandboxReady={snapshot.hmrcSandboxReady}
        submitHref={submitHref}
      />

      <section className="rounded-2xl border border-sky-200/80 bg-sky-50/80 p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-sky-800/80">Guidance</p>
        <h2 className="mt-2 text-lg font-bold text-sky-950 sm:text-xl">Viewing tax due (HMRC)</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-sky-950/90 sm:text-base">
          SelfSubmit supports records and MTD update submissions. HMRC’s official tax calculation and balance to pay are
          shown in your HMRC Personal Tax Account. SelfSubmit does not currently display that calculation.
        </p>
        <Link
          href="/how-tax-due-works"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-green-dark"
        >
          How tax due works
        </Link>
      </section>

      {setupComplete && (snapshot.hmrcConnected || snapshot.anyBusinessHmrcLinked) ? (
        <HmrcSandboxStatusCard
          hmrcConnected={snapshot.hmrcConnected}
          hmrcSandboxReady={snapshot.hmrcSandboxReady}
          sandboxFilingEnabled={isHmrcSandboxFilingEnabled()}
          activeBusinessId={snapshot.activeBusinessId}
          activeBusinessName={snapshot.activeBusinessName}
          activeBusinessHmrcId={snapshot.activeBusinessHmrcId}
          anyBusinessHmrcLinked={snapshot.anyBusinessHmrcLinked}
        />
      ) : null}

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
          hmrcSandboxReady={snapshot.hmrcSandboxReady}
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
