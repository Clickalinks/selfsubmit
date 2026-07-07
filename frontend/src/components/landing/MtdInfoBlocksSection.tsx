import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import { MTD_INFO_BLOCKS } from "@/data/mtdInfoBlocks";

export function MtdInfoBlocksSection() {
  return (
    <section
      id="mtd-info-blocks"
      className="relative flex w-full scroll-mt-28 flex-col border-b border-brand-green/15 bg-gradient-to-b from-[#0d5c36] via-[#0f6b3f] to-[#0a4d2e]"
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

      <div className="relative px-3 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
        <div className="mx-auto w-full max-w-[1600px] text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-200/95 sm:text-sm">
            Making Tax Digital
          </p>
          <h1
            id="mtd-info-blocks-heading"
            className="mt-2 text-2xl font-bold text-white sm:text-3xl lg:text-4xl"
          >
            MTD information blocks
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-white/85 sm:text-base">
            Twenty plain-English guides aligned with GOV.UK — income tax, VAT, deadlines, record-keeping, and more.
            Each block links to a full article with HMRC sources.
          </p>
        </div>

        <div className="mx-auto mt-8 grid w-full max-w-[1600px] grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {MTD_INFO_BLOCKS.map((block) => {
            const Icon = block.icon;
            return (
              <Link
                key={block.id}
                href={block.href}
                className="group flex h-full flex-col rounded-2xl border border-white/15 bg-white p-5 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-white/40 hover:shadow-xl sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-mint">
                    <Icon className="h-6 w-6 text-brand-green" strokeWidth={1.75} aria-hidden />
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Info block {block.id}
                  </span>
                </div>

                <h2 className="mt-4 text-left text-base font-bold leading-snug text-brand-black sm:text-lg">
                  {block.title}
                </h2>

                <p className="mt-2 flex-1 text-left text-sm leading-relaxed text-brand-muted">{block.cardIntro}</p>

                <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                  {block.highlights.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-left text-xs leading-relaxed text-slate-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" aria-hidden />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-green">
                  <BookOpen className="h-4 w-4" aria-hidden />
                  Read full guide
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
