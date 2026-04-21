export type StickerCardTone = "cream" | "sky" | "mint";

/** Navy outline used across sticker-style category tiles. */
export const STICKER_INK = "#162436";

export function stickerCardBg(tone: StickerCardTone): string {
  switch (tone) {
    case "cream":
      return "bg-[#FFF9E6]";
    case "sky":
      return "bg-[#E8F4FC]";
    case "mint":
      return "bg-[#E8F8EF]";
    default:
      return "bg-[#FFF9E6]";
  }
}

export function stickerCardBgMuted(): string {
  return "bg-neutral-200/95";
}

const TONES: StickerCardTone[] = ["cream", "sky", "mint"];

export function stickerToneFromString(seed: string): StickerCardTone {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h + seed.charCodeAt(i) * (i + 1)) % 1_009;
  }
  return TONES[h % 3];
}

export function stickerToneForLedgerLine(
  kind: "income" | "expense",
  lineId: string,
  index: number,
): StickerCardTone {
  let h = 0;
  for (let i = 0; i < lineId.length; i++) {
    h += lineId.charCodeAt(i) * (i + 3);
  }
  const n = (h + index * 7 + (kind === "expense" ? 2 : 0)) % 3;
  return TONES[n];
}
