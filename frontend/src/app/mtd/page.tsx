import type { Metadata } from "next";
import Link from "next/link";

import { HmrcSourceNotice } from "@/components/mtd/HmrcSourceNotice";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { MTD_CATEGORY_CONTENT } from "@/data/mtdCategoryContent";

export const metadata: Metadata = {
  title: "MTD categories — HMRC-aligned guides | SelfSubmit",
  description:
    "Browse all Making Tax Digital topics with summaries and links to official GOV.UK guidance.",
};

export default function MtdCategoriesIndexPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <Link
            href="/#mtd-categories"
            className="text-sm font-semibold text-brand-green hover:text-brand-green-dark"
          >
            ← Back to homepage
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-brand-black sm:text-4xl">MTD categories</h1>
          <p className="mt-3 max-w-2xl text-base text-brand-muted">
            Plain-English summaries of Making Tax Digital topics, with official HMRC links on each page.
          </p>

          <div className="mt-8">
            <HmrcSourceNotice />
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MTD_CATEGORY_CONTENT.map((category) => {
              const Icon = category.icon;
              return (
                <li key={category.slug}>
                  <Link
                    href={`/mtd/${category.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-green/30 hover:shadow-card-hover"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-mint">
                        <Icon className="h-6 w-6 text-brand-green" strokeWidth={1.75} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-brand-muted">Category {category.id}</p>
                        <h2 className="mt-0.5 text-base font-bold text-brand-black group-hover:text-brand-green">
                          {category.title}
                        </h2>
                      </div>
                    </div>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-muted">{category.summary}</p>
                    <span className="mt-4 text-sm font-semibold text-brand-green">Read guide →</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
