import type { LucideIcon } from "lucide-react";

import { EXPENSE_TEMPLATES, PROFESSION_TO_TEMPLATE } from "@/data/expenseCategories";
import { SELF_EMPLOYED_PROFESSIONS } from "@/data/selfEmployedProfessions";
import { DEFAULT_PROFESSION_ICON, getTemplateIcon, PROFESSION_ICONS } from "@/data/tradeIcons";

const TEMPLATE_ORDER = [
  "transport_driving",
  "trades",
  "personal_services",
  "teaching_training",
  "domestic_cleaning",
  "freelancers",
  "online_sellers",
  "property_income",
] as const;

export type SupportedBusinessGroup = {
  id: string;
  title: string;
  icon: LucideIcon;
  professions: { name: string; icon: LucideIcon }[];
};

export const SUPPORTED_BUSINESS_GROUPS: SupportedBusinessGroup[] = TEMPLATE_ORDER.map((templateId) => {
  const template = EXPENSE_TEMPLATES[templateId];
  return {
    id: templateId,
    title: template.title,
    icon: getTemplateIcon(templateId),
    professions: SELF_EMPLOYED_PROFESSIONS.filter(
      (name) => (PROFESSION_TO_TEMPLATE[name] ?? "freelancers") === templateId,
    ).map((name) => ({
      name,
      icon: PROFESSION_ICONS[name] ?? DEFAULT_PROFESSION_ICON,
    })),
  };
});
