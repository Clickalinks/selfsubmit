import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HOMEPAGE_MTD_INFO_BLOCKS } from "@/data/mtdInfoBlocks";

export function MtdInfoBlocksSection() {
  return (
    <section
      id="mtd-info-blocks"
      className="relative flex w-full scroll-mt-28 flex-col border-b border-brand-green/15 bg-gradient-to-b from-[#0d5c36] via-[#0f6b3f] to-[#0a4d2e] md:min-h-[calc(100dvh-6.5rem)]"
      aria-labelledby="mtd-info-blocks-heading"
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
            id="mtd-info-blocks-heading"
            className="mt-2 text-2xl font-bold text-white sm:text-3xl lg:text-4xl"
          >
            MTD information &amp; Guide
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/85 sm:text-base">
            Ten topic blocks covering income tax, VAT, deadlines, record-keeping, and more — each links to two full
            HMRC-aligned guides.
          </p>
        </div>

        <div className="mx-auto mt-6 grid w-full max-w-[1600px] flex-1 auto-rows-fr grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:mt-10 sm:gap-4 md:grid-cols-3 lg:grid-cols-5 lg:gap-5">
          {HOMEPAGE_MTD_INFO_BLOCKS.map((block) => {
            const Icon = block.icon;
            return (
              <article
                key={block.id}
                className="group flex min-h-[8rem] flex-col rounded-xl border border-white/15 bg-white/95 p-3.5 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-white/40 hover:bg-white hover:shadow-xl sm:min-h-[10rem] sm:p-5 lg:min-h-[11rem]"
              >
                <Icon
                  className="h-8 w-8 shrink-0 text-brand-green transition group-hover:scale-105 sm:h-9 sm:w-9"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <p className="mt-3 text-left text-xs font-bold leading-snug text-brand-black sm:text-sm">
                  {block.title}
                </p>
                <p className="mt-1.5 flex-1 text-left text-xs leading-relaxed text-brand-muted line-clamp-4 sm:line-clamp-5">
                  {block.summary}
                </p>
                <div className="mt-auto flex flex-col gap-1.5 pt-2 sm:pt-3">
                  {block.guides.map((guide) => (
                    <Link
                      key={guide.href}
                      href={guide.href}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-green hover:underline"
                    >
                      {guide.title}
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 transition group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
