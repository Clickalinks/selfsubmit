import { MTD_CATEGORY_CONTENT, type MtdCategoryContent } from "@/data/mtdCategoryContent";
import { getInfoBlockExtras, type MtdInfoBlockExtras } from "@/data/mtdInfoBlockExtras";

export type MtdInfoBlock = MtdCategoryContent &
  MtdInfoBlockExtras & {
    href: string;
  };

/** Homepage information blocks — merged HMRC guide content + enriched copy. */
export const MTD_INFO_BLOCKS: MtdInfoBlock[] = MTD_CATEGORY_CONTENT.map((block) => {
  const extras = getInfoBlockExtras(block.slug);
  const fallbackHighlights: [string, string, string] = [
    block.keyPoints[0] ?? "Read the full guide for HMRC-aligned detail.",
    block.keyPoints[1] ?? "Check GOV.UK for the latest rules and dates.",
    block.keyPoints[2] ?? "SelfSubmit helps you keep digital records organised.",
  ];

  return {
    ...block,
    href: `/mtd/${block.slug}`,
    cardIntro: extras?.cardIntro ?? block.summary,
    highlights: extras?.highlights ?? (fallbackHighlights as [string, string, string]),
    additionalDetail: extras?.additionalDetail ?? "",
    commonMistakes: extras?.commonMistakes ?? [],
    selfSubmitTip: extras?.selfSubmitTip ?? "",
  };
});

export type { MtdCategoryContent };

export function getInfoBlockBySlug(slug: string): MtdInfoBlock | undefined {
  return MTD_INFO_BLOCKS.find((b) => b.slug === slug);
}

export function getAllInfoBlockSlugs(): string[] {
  return MTD_INFO_BLOCKS.map((b) => b.slug);
}

/** @deprecated use MTD_INFO_BLOCKS */
export const MTD_CATEGORIES = MTD_INFO_BLOCKS;
