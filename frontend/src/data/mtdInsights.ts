import type { LucideIcon } from "lucide-react";
import { BookOpen, CalendarClock, ListChecks } from "lucide-react";

export type MtdInsightAccent = "emerald" | "sky" | "violet";

export type MtdInsight = {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  href: string;
  hmrcUrl: string;
  icon: LucideIcon;
  accent: MtdInsightAccent;
};

/** Insights aligned with HMRC GOV.UK guidance — each card links to a full MTD guide. */
export const MTD_INSIGHTS: MtdInsight[] = [
  {
    id: "guide-income-tax",
    category: "MTD guides",
    title: "Getting started with MTD for Income Tax",
    excerpt:
      "HMRC requires digital records, quarterly updates during the tax year, and a final declaration. From April 2026, many self-employed people and landlords with qualifying income over £50,000 must follow MTD ITSA.",
    href: "/mtd/mtd-for-income-tax",
    hmrcUrl: "https://www.gov.uk/guidance/making-tax-digital-for-income-tax",
    icon: BookOpen,
    accent: "emerald",
  },
  {
    id: "deadlines-2026",
    category: "Important dates",
    title: "Key MTD deadlines for 2026",
    excerpt:
      "Quarterly update deadlines depend on your accounting period. You must still meet Self Assessment payment dates (31 January and 31 July where applicable) and file your final declaration on time.",
    href: "/mtd/mtd-deadlines",
    hmrcUrl: "https://www.gov.uk/self-assessment-tax-returns/deadlines",
    icon: CalendarClock,
    accent: "sky",
  },
  {
    id: "submit-checklist",
    category: "Easy submission",
    title: "Your quarterly update checklist",
    excerpt:
      "Before each HMRC deadline: confirm your digital records are complete, summarise income and allowable expenses, and submit through MTD-compatible software. Quarterly updates are not your tax bill.",
    href: "/mtd/quarterly-updates",
    hmrcUrl: "https://www.gov.uk/guidance/making-tax-digital-for-income-tax/send-updates-to-hmrc",
    icon: ListChecks,
    accent: "violet",
  },
];

export const INSIGHT_ACCENT_STYLES: Record<
  MtdInsightAccent,
  { iconBg: string; iconColor: string; ring: string; category: string }
> = {
  emerald: {
    iconBg: "bg-gradient-to-br from-emerald-50 to-emerald-100/80",
    iconColor: "text-emerald-700",
    ring: "ring-emerald-200/60",
    category: "text-emerald-700",
  },
  sky: {
    iconBg: "bg-gradient-to-br from-sky-50 to-sky-100/80",
    iconColor: "text-sky-700",
    ring: "ring-sky-200/60",
    category: "text-sky-700",
  },
  violet: {
    iconBg: "bg-gradient-to-br from-violet-50 to-violet-100/80",
    iconColor: "text-violet-700",
    ring: "ring-violet-200/60",
    category: "text-violet-700",
  },
};
