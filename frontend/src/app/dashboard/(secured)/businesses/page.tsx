import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";

import { BusinessSwitcher } from "@/components/dashboard/BusinessSwitcher";
import { getActiveBusinessContext, listBusinessesForUser } from "@/lib/active-business";
import { getUserPlan } from "@/lib/subscription-server";
import { maxBusinessesForPlan, PLAN_DISPLAY_NAMES } from "@/lib/plan-config";

export const metadata: Metadata = {
  title: "My businesses — SelfSubmit",
  description: "View and switch between your registered businesses.",
};

export default async function MyBusinessesPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const [businesses, plan, context] = await Promise.all([
    listBusinessesForUser(userId),
    getUserPlan(userId),
    getActiveBusinessContext(userId),
  ]);

  const maxBusinesses = plan ? maxBusinessesForPlan(plan) : 0;
  const activeId = context.activeBusinessId;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">My businesses</h2>
        <p className="mt-1 text-sm text-slate-600">
          {plan ? (
            <>
              <span className="font-semibold">{PLAN_DISPLAY_NAMES[plan]}</span> plan — {businesses.length} of{" "}
              {maxBusinesses} businesses used.
            </>
          ) : (
            "Choose a plan to register businesses."
          )}
        </p>
      </div>

      {businesses.length > 1 ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Active business</p>
          <p className="mt-1 text-sm text-slate-500">
            The dashboard and quick actions use the business you select here.
          </p>
          <div className="mt-4">
            <BusinessSwitcher basePath="/dashboard/businesses" />
          </div>
        </section>
      ) : null}

      {businesses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">You have not added a business yet.</p>
          <Link
            href="/add-business"
            className="mt-4 inline-flex rounded-xl bg-brand-green px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-green-dark"
          >
            Create your first business
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {businesses.map((b) => {
            const isActive = b.id === activeId;
            return (
              <li key={b.id}>
                <div
                  className={`rounded-2xl border px-4 py-4 sm:px-5 ${
                    isActive
                      ? "border-brand-green/40 bg-brand-mint/30 ring-1 ring-brand-green/20"
                      : "border-slate-200/80 bg-white shadow-sm"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{b.name}</p>
                      <p className="text-sm text-slate-500">{b.category}</p>
                      {isActive ? (
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand-green">
                          Active on dashboard
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {!isActive ? (
                        <Link
                          href={`/dashboard?businessId=${encodeURIComponent(b.id)}`}
                          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          View on dashboard
                        </Link>
                      ) : null}
                      <Link
                        href={`/submit?businessId=${encodeURIComponent(b.id)}`}
                        className="rounded-xl bg-brand-green px-4 py-2 text-sm font-bold text-white hover:bg-brand-green-dark"
                      >
                        Open return form
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {businesses.length < maxBusinesses ? (
        <Link
          href="/add-business"
          className="inline-flex rounded-xl border border-black/15 px-5 py-2.5 text-sm font-semibold text-brand-black hover:bg-neutral-50"
        >
          Add another business
        </Link>
      ) : plan ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
          <p className="font-semibold">
            You&apos;re using all {maxBusinesses} business{maxBusinesses === 1 ? "" : "es"} on{" "}
            {PLAN_DISPLAY_NAMES[plan]}.
          </p>
          <p className="mt-1 text-amber-900">
            Upgrade to add another business under the same UTR and National Insurance number.
          </p>
          <Link
            href="/pricing"
            className="mt-3 inline-flex rounded-xl bg-brand-green px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-green-dark"
          >
            Upgrade or switch plan
          </Link>
        </div>
      ) : null}
    </div>
  );
}
