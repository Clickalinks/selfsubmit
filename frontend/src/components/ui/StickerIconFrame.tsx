import type { ReactNode } from "react";

import type { StickerCardTone } from "@/data/stickerCardTheme";
import { stickerCardBg, stickerCardBgMuted } from "@/data/stickerCardTheme";

function cx(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

const sizeClasses = {
  sm: "h-11 w-11 min-h-[2.75rem] min-w-[2.75rem] rounded-xl border-[2.5px] [&_svg]:h-[1.35rem] [&_svg]:w-[1.35rem]",
  md: "h-[4.25rem] w-[4.25rem] min-h-[4.25rem] min-w-[4.25rem] rounded-2xl border-[2.5px] [&_svg]:h-9 [&_svg]:w-9",
  lg: "h-[5.75rem] w-[5.75rem] min-h-[5.75rem] min-w-[5.75rem] rounded-2xl border-[3px] sm:h-24 sm:w-24 sm:min-h-[6rem] sm:min-w-[6rem] [&_svg]:h-11 [&_svg]:w-11 sm:[&_svg]:h-12 sm:[&_svg]:w-12",
} as const;

export type StickerIconSize = keyof typeof sizeClasses;

type StickerIconFrameProps = {
  tone: StickerCardTone;
  size: StickerIconSize;
  /** Greyed sticker when a row is saved / inactive. */
  muted?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Rounded “sticker” frame: pastel fill + thick ink border, for category-style icons
 * (matches the flat illustrated tile look on the landing page).
 */
export function StickerIconFrame({ tone, size, muted, className, children }: StickerIconFrameProps) {
  return (
    <div
      className={cx(
        "flex shrink-0 items-center justify-center border-solid border-[#162436] shadow-[3px_4px_0_0_rgba(22,36,54,0.1)]",
        muted ? stickerCardBgMuted() : stickerCardBg(tone),
        sizeClasses[size],
        muted && "opacity-[0.88]",
        "[&_svg]:shrink-0 [&_svg]:stroke-[#162436]",
        className,
      )}
    >
      {children}
    </div>
  );
}
