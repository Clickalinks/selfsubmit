import Link from "next/link";

import { PROFESSIONS_FOR_LANDING } from "@/data/expenseCategories";
import {
  DEFAULT_PROFESSION_ICON,
  PROFESSION_ICONS,
} from "@/data/tradeIcons";

export function ProfessionRow() {
  return (
    <section
      id="choose-profession"
      className="scroll-mt-24 bg-transparent px-5 pb-16 min-[900px]:px-10 min-[900px]:pb-20"
      aria-label="Choose your profession"
    >
      <h2 className="text-center text-2xl font-bold text-brand-black min-[900px]:text-3xl">Choose Your Profession.</h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-brand-muted min-[900px]:text-base">
        Click a tile to open your monthly return — we will show the matching income and expense lines for that trade.
      </p>
      <div className="mx-auto mt-10 grid w-full max-w-[1400px] grid-cols-2 gap-2.5 min-[480px]:grid-cols-3 min-[768px]:grid-cols-4 min-[900px]:mt-12 min-[900px]:gap-3 min-[1024px]:grid-cols-5 min-[1180px]:grid-cols-7">
        {PROFESSIONS_FOR_LANDING.map((label) => {
          const Icon = PROFESSION_ICONS[label] ?? DEFAULT_PROFESSION_ICON;
          return (
            <Link
              key={label}
              href={`/submit?trade=${encodeURIComponent(label)}`}
              aria-label={`Continue to monthly return as ${label}`}
              className="group flex min-h-full cursor-pointer flex-col items-center rounded-2xl border border-black/10 bg-white px-2.5 py-4 text-center no-underline shadow-card outline-offset-2 transition duration-300 hover:-translate-y-0.5 hover:border-brand-green/35 hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-green/50 min-[900px]:px-3 min-[900px]:py-5 min-[1180px]:py-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-brand-green-bright to-brand-green-dark text-white shadow-inner ring-2 ring-white min-[900px]:h-11 min-[900px]:w-11 min-[1180px]:h-10 min-[1180px]:w-10">
                <Icon className="h-5 w-5 min-[1180px]:h-[18px] min-[1180px]:w-[18px]" strokeWidth={1.75} aria-hidden />
              </div>
              <span className="mt-2 min-h-[2.5rem] text-[11px] font-bold leading-snug text-brand-black min-[900px]:min-h-0 min-[900px]:text-xs min-[1180px]:text-[11px] min-[1180px]:leading-tight">
                {label}
              </span>
              <span className="mt-2 text-[11px] font-semibold text-brand-green underline decoration-brand-green/35 underline-offset-4 transition group-hover:decoration-brand-green min-[900px]:text-xs">
                Get started →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
