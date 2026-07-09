import type { LucideIcon } from "lucide-react";

import { MTD_CATEGORY_CONTENT, type MtdCategoryContent } from "@/data/mtdCategoryContent";
import { getInfoBlockExtras, type MtdInfoBlockExtras } from "@/data/mtdInfoBlockExtras";

export type MtdInfoBlock = MtdCategoryContent &
  MtdInfoBlockExtras & {
    href: string;
  };

export type HomepageMtdInfoBlock = {
  id: string;
  title: string;
  icon: LucideIcon;
  summary: string;
  guides: { title: string; href: string }[];
};

function buildInfoBlock(block: MtdCategoryContent): MtdInfoBlock {
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
}

/** All MTD guides — used on individual article pages. */
export const MTD_INFO_BLOCKS: MtdInfoBlock[] = MTD_CATEGORY_CONTENT.map(buildInfoBlock);

const blockBySlug = new Map(MTD_INFO_BLOCKS.map((block) => [block.slug, block]));

/** Pairs of slugs merged into one homepage card (20 guides → 10 blocks). */
const HOMEPAGE_BLOCK_PAIRS: [string, string][] = [
  ["mtd-for-income-tax", "mtd-for-vat"],
  ["mtd-deadlines", "quarterly-updates"],
  ["self-employed-mtd", "landlord-mtd"],
  ["business-types", "income-sources"],
  ["record-keeping", "digital-records"],
  ["allowable-expenses", "tax-calculations"],
  ["final-declaration", "mtd-sign-up"],
  ["hmrc-approved-software", "hmrc-online-services"],
  ["mtd-exemptions", "penalties-and-fines"],
  ["agent-services", "help-and-support"],
];

function mergeHomepageBlocks(a: MtdInfoBlock, b: MtdInfoBlock): HomepageMtdInfoBlock {
  return {
    id: `${a.slug}__${b.slug}`,
    title: `${a.title} & ${b.title}`,
    icon: a.icon,
    summary: `${a.summary} ${b.summary}`,
    guides: [
      { title: a.title, href: a.href },
      { title: b.title, href: b.href },
    ],
  };
}

/** Homepage grid — 10 merged blocks covering all 20 MTD guides. */
export const HOMEPAGE_MTD_INFO_BLOCKS: HomepageMtdInfoBlock[] = HOMEPAGE_BLOCK_PAIRS.map(([slugA, slugB]) => {
  const a = blockBySlug.get(slugA);
  const b = blockBySlug.get(slugB);
  if (!a || !b) {
    throw new Error(`Homepage MTD block pair not found: ${slugA}, ${slugB}`);
  }
  return mergeHomepageBlocks(a, b);
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
