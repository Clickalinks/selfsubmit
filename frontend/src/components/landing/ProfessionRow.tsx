import Link from "next/link";

import { PROFESSIONS_FOR_LANDING } from "@/data/expenseCategories";
import { getProfessionStickerTone } from "@/data/professionStickerTones";
import { stickerCardBg } from "@/data/stickerCardTheme";
import {
  DEFAULT_PROFESSION_ICON,
  PROFESSION_ICONS,
} from "@/data/tradeIcons";

function cx(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

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
      <div className="mx-auto mt-10 grid w-full max-w-[1400px] grid-cols-2 gap-3 min-[480px]:grid-cols-3 min-[768px]:grid-cols-4 min-[900px]:mt-12 min-[900px]:gap-4 min-[1024px]:grid-cols-5 min-[1180px]:grid-cols-7">
        {PROFESSIONS_FOR_LANDING.map((label) => {
          const Icon = PROFESSION_ICONS[label] ?? DEFAULT_PROFESSION_ICON;
          const tone = getProfessionStickerTone(label);
          return (
            <Link
              key={label}
              href={`/submit?trade=${encodeURIComponent(label)}`}
              aria-label={`Continue to monthly return as ${label}`}
              className={cx(
                "group flex min-h-full cursor-pointer flex-col items-center rounded-2xl border-[2.5px] border-solid border-[#162436] px-2.5 pb-3 pt-4 text-center no-underline shadow-[4px_5px_0_0_rgba(22,36,54,0.12)] outline-offset-2 transition duration-300 hover:-translate-y-0.5 hover:shadow-[5px_7px_0_0_rgba(22,36,54,0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#162436]/40 min-[900px]:px-3 min-[900px]:pb-4 min-[900px]:pt-5",
                stickerCardBg(tone),
              )}
            >
              <div className="flex min-h-[4.5rem] flex-1 items-center justify-center px-1 min-[900px]:min-h-[5.25rem]">
                <Icon
                  className="h-12 w-12 min-[900px]:h-14 min-[900px]:w-14"
                  strokeWidth={2.35}
                  aria-hidden
                />
              </div>
              <span className="mt-1 min-h-[2.5rem] px-0.5 text-[11px] font-extrabold leading-snug tracking-tight text-[#111827] min-[900px]:min-h-0 min-[900px]:text-xs min-[1180px]:text-[11px] min-[1180px]:leading-tight">
                {label}
              </span>
              <span className="mt-2 text-[11px] font-semibold text-[#162436] underline decoration-[#162436]/35 underline-offset-4 transition group-hover:decoration-[#162436] min-[900px]:text-xs">
                Get started →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
