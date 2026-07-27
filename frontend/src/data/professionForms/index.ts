import { BEAUTY_FORMS } from "@/data/professionForms/beauty";
import { CREATIVE_FORMS } from "@/data/professionForms/creative";
import { SELLING_FORMS, PROPERTY_FORMS, SERVICE_FORMS } from "@/data/professionForms/selling";
import { TEACHING_FORMS } from "@/data/professionForms/teaching";
import { TRADE_FORMS } from "@/data/professionForms/trades";
import { TRANSPORT_FORMS } from "@/data/professionForms/transport";
import type { TradeFormTemplate } from "@/data/professionForms/types";

/** Every picker profession → its own simple form (no shared clutter). */
export const PROFESSION_FORMS: Record<string, TradeFormTemplate> = {
  ...TRANSPORT_FORMS,
  ...BEAUTY_FORMS,
  ...TRADE_FORMS,
  ...TEACHING_FORMS,
  ...CREATIVE_FORMS,
  ...SELLING_FORMS,
  ...PROPERTY_FORMS,
  ...SERVICE_FORMS,
};

/** Legacy / alternate labels map to a canonical profession form. */
const LEGACY_TO_CANONICAL: Record<string, string> = {
  "Private Hire Driver (Uber/Bolt)": "Uber Driver",
  "Delivery Driver (Amazon, Uber Eats)": "Delivery Driver",
  "Beautician (nails, lashes, etc.)": "Beautician",
  "Tutor (academic or private)": "Private Tutor",
  "Graphic Designer": "Graphic Designer (Freelance)",
  "Web Developer": "Web Developer (Freelance)",
  "Photographer / Videographer": "Photographer (Freelance)",
  "Wedding Photographer": "Wedding Photographer",
  "Builder / Bricklayer": "Builder",
  "Gardener / Landscaper": "Gardener",
  "Cleaner (domestic & commercial)": "Cleaner (Domestic & Commercial)",
  "Property Income Earner": "Property Income Earner",
};

export function resolveProfessionFormKey(trade: string): string {
  const key = trade.trim();
  if (PROFESSION_FORMS[key]) return key;
  const mapped = LEGACY_TO_CANONICAL[key];
  if (mapped && PROFESSION_FORMS[mapped]) return mapped;
  return "Small Sole Trader";
}

export function getProfessionForm(trade: string): TradeFormTemplate {
  return PROFESSION_FORMS[resolveProfessionFormKey(trade)];
}

/** Template id → form (for code that still keys by template id). */
export const EXPENSE_TEMPLATES: Record<string, TradeFormTemplate> = Object.fromEntries(
  Object.values(PROFESSION_FORMS).map((form) => [form.id, form]),
);

/** Profession label → form id. */
export const PROFESSION_TO_TEMPLATE: Record<string, string> = Object.fromEntries([
  ...Object.entries(PROFESSION_FORMS).map(([name, form]) => [name, form.id] as const),
  ...Object.entries(LEGACY_TO_CANONICAL).map(([legacy, canonical]) => {
    const form = PROFESSION_FORMS[canonical];
    return [legacy, form?.id ?? "small_sole_trader"] as const;
  }),
]);

/** Forms that use a business vehicle (simplified mileage option). */
export const VEHICLE_FORM_IDS = new Set<string>([
  "taxi_driver",
  "uber_driver",
  "delivery_driver",
  "courier_van_driver",
  "hgv_lorry_driver",
  "electrician",
  "plumber",
  "carpenter",
  "painter_decorator",
  "handyman",
  "roofer",
  "builder",
  "bricklayer",
  "locksmith",
  "gardener",
  "landscaper",
  "window_cleaner",
  "mobile_mechanic",
  "tradesperson_general",
  "driving_instructor",
]);
