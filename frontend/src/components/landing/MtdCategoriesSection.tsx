import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { MTD_CATEGORIES } from "@/data/mtdCategories";

export function MtdCategoriesSection() {
  return (
    <section
      id="mtd-categories"
      className="relative flex w-full scroll-mt-28 flex-col border-b border-brand-green/15 bg-gradient-to-b from-[#0d5c36] via-[#0f6b3f] to-[#0a4d2e] md:min-h-[calc(100dvh-6.5rem)]"
      aria-labelledby="mtd-categories-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1.5px)`,
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />

      <div className="relative flex flex-1 flex-col px-3 py-6 pb-10 sm:px-8 sm:py-10 sm:pb-12 lg:px-12 lg:py-12 lg:pb-14">
        <div className="mx-auto w-full max-w-[1600px] text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-200/95 sm:text-sm">
            Making Tax Digital
          </p>
          <h1
            id="mtd-categories-heading"
            className="mt-2 text-2xl font-bold text-white sm:text-3xl lg:text-4xl"
          >
            MTD categories &amp; HMRC guides
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/85 sm:text-base">
            Pick a topic below for step-by-step guidance aligned with GOV.UK — income tax, VAT, deadlines, and more.
          </p>
        </div>

        <div className="mx-auto mt-6 grid w-full max-w-[1600px] flex-1 auto-rows-fr grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:mt-10 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-5">
          {MTD_CATEGORIES.map((item) => {
            const Icon = item.icon;
            const external = item.href.startsWith("http");
            const className =
              "group flex min-h-[6.5rem] flex-col rounded-xl border border-white/15 bg-white/95 p-3.5 shadow-lg shadow-black/10 transition active:scale-[0.99] hover:-translate-y-0.5 hover:border-white/40 hover:bg-white hover:shadow-xl sm:min-h-[8.5rem] sm:p-5 lg:min-h-[9.5rem]";

            const inner = (
              <>
                <Icon
                  className="h-8 w-8 shrink-0 text-brand-green transition group-hover:scale-105 sm:h-9 sm:w-9"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <p className="mt-3 text-left text-xs font-bold leading-snug text-brand-black sm:text-sm">
                  <span className="text-brand-muted">{item.id}.</span> {item.title}
                </p>
                <p className="mt-1.5 flex-1 text-left text-xs leading-relaxed text-brand-muted line-clamp-2 sm:line-clamp-none lg:line-clamp-2">
                  {item.summary}
                </p>
                <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-semibold text-brand-green sm:pt-3">
                  Open guide
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </>
            );

            return external ? (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {inner}
              </a>
            ) : (
              <Link key={item.id} href={item.href} className={className}>
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
