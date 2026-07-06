import type { LucideIcon } from "lucide-react";

import { MTD_CATEGORY_CONTENT } from "@/data/mtdCategoryContent";

export type MtdCategory = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  href: string;
  icon: LucideIcon;
};

/** Landing grid cards — each links to a full HMRC-aligned guide at /mtd/[slug]. */
export const MTD_CATEGORIES: MtdCategory[] = MTD_CATEGORY_CONTENT.map((c) => ({
  id: c.id,
  title: c.title,
  slug: c.slug,
  summary: c.summary,
  href: `/mtd/${c.slug}`,
  icon: c.icon,
}));
