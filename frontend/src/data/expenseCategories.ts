/**
 * Profession monthly return forms — each business type has its own clear form.
 * Definitions live in `@/data/professionForms/*`.
 */

import {
  EXPENSE_TEMPLATES,
  getProfessionForm,
  PROFESSION_TO_TEMPLATE,
  VEHICLE_FORM_IDS,
} from "@/data/professionForms";
import type { MoneyLineItem, TradeFormTemplate } from "@/data/professionForms/types";
import { SELF_EMPLOYED_PROFESSIONS } from "@/data/selfEmployedProfessions";
import { isCisEligibleTrade } from "@/data/professionTags";

export type { MoneyLineItem, TradeFormTemplate, ExpenseLineItem, ExpenseTemplate } from "@/data/professionForms/types";
export { EXPENSE_TEMPLATES, PROFESSION_TO_TEMPLATE };

export const DEFAULT_TEMPLATE_ID = "small_sole_trader" as const;

/** All self-employed types (sign-up + submit form + landing). */
export const PROFESSIONS_FOR_LANDING: readonly string[] = SELF_EMPLOYED_PROFESSIONS;

/** Profession picker options (canonical list only — legacy labels still resolve via PROFESSION_TO_TEMPLATE). */
export const ALL_PROFESSIONS: string[] = [...SELF_EMPLOYED_PROFESSIONS];

/** True if the label is in the picker list or a supported legacy alias. */
export function isKnownProfession(trade: string): boolean {
  const key = trade.trim();
  if (!key) return false;
  return (
    (SELF_EMPLOYED_PROFESSIONS as readonly string[]).includes(key) || key in PROFESSION_TO_TEMPLATE
  );
}

export function getTemplateForProfession(trade: string): TradeFormTemplate {
  return getProfessionForm(trade);
}

export function getTemplateIdForProfession(trade: string): string {
  return getProfessionForm(trade).id;
}

/** @deprecated CIS is decided by trade tags, not template id. */
export const CIS_CONSTRUCTION_TEMPLATE_ID = "builder" as const;

/** Electrician, plumber, carpenter, etc. — CIS may apply; not mechanics or gardeners. */
export function isCisConstructionTrade(trade: string): boolean {
  return isCisEligibleTrade(trade);
}

/** How vehicle running costs are claimed for this return (when the trade uses a business vehicle). */
export type VehicleCostMethod = "actual" | "simplified";

/**
 * Single expense line: total vehicle running costs for this period using HMRC simplified mileage.
 * Replaces per-item fuel, insurance, repairs, MOT, etc. for the same vehicle — do not duplicate.
 */
export const VEHICLE_SIMPLIFIED_MILEAGE_EXPENSE_ID = "vehicle_simplified_running_mileage" as const;

export const VEHICLE_SIMPLIFIED_MILEAGE_EXPENSE: MoneyLineItem = {
  id: VEHICLE_SIMPLIFIED_MILEAGE_EXPENSE_ID,
  label: "Vehicle running costs (HMRC simplified mileage — this period)",
  hint: "Use the mileage step below (after income) to calculate this from business miles, or enter £ manually after using Edit.",
};

/** HMRC simplified vehicle rates (pence per business mile) — confirm each tax year on GOV.UK. */
export const HMRC_SIMPLIFIED_VEHICLE_PENCE_PER_MILE = {
  carVanFirst10k: 45,
  carVanOver10k: 25,
  motorcycle: 24,
} as const;

export type MileageVehicleKind = "car_or_goods_vehicle" | "motorcycle";

/** Where this period’s miles sit against the tax-year 10,000-mile threshold for cars / goods vehicles. */
export type MileageAnnualBand = "within_first_10000" | "above_10000";

/** £ claim for this period from business miles × HMRC simplified pence (rounded to 2 dp). */
export function computeSimplifiedMileageClaimGbp(params: {
  businessMiles: number;
  vehicle: MileageVehicleKind;
  annualMileageBand: MileageAnnualBand;
}): number {
  const miles = params.businessMiles;
  if (!Number.isFinite(miles) || miles < 0) return 0;
  let pence: number;
  if (params.vehicle === "motorcycle") {
    pence = HMRC_SIMPLIFIED_VEHICLE_PENCE_PER_MILE.motorcycle;
  } else {
    pence =
      params.annualMileageBand === "within_first_10000"
        ? HMRC_SIMPLIFIED_VEHICLE_PENCE_PER_MILE.carVanFirst10k
        : HMRC_SIMPLIFIED_VEHICLE_PENCE_PER_MILE.carVanOver10k;
  }
  return Math.round(miles * pence) / 100;
}

const TRANSPORT_ACTUAL_VEHICLE_COST_IDS = new Set([
  "lease_finance",
  "fuel",
  "vehicle_insurance",
  "vehicle_tax_mot",
  "vehicle_repair",
  "cleaning",
  "breakdown_cover",
  "passenger_goods_insurance",
]);

const TRADES_ACTUAL_VEHICLE_COST_IDS = new Set([
  "van_lease_finance",
  "fuel_energy",
  "vehicle_insurance",
  "vehicle_tax_mot",
  "vehicle_repair",
]);

const TEACHING_ACTUAL_VEHICLE_COST_IDS = new Set([
  "car_lease",
  "vehicle_costs",
  "dual_controls",
  "learner_insurance",
]);

const TRANSPORT_FORM_IDS = new Set([
  "taxi_driver",
  "uber_driver",
  "delivery_driver",
  "courier_van_driver",
  "hgv_lorry_driver",
]);

export function usesBusinessVehicleTemplate(templateId: string): boolean {
  return VEHICLE_FORM_IDS.has(templateId);
}

/**
 * HMRC car simplified mileage does not apply to dual-control cars used only for driving instruction.
 * Those vehicles should use the full (actual) cost method.
 */
export function vehicleSimplifiedMileageAllowed(trade: string, templateId: string): boolean {
  if (!usesBusinessVehicleTemplate(templateId)) return false;
  if (templateId === "driving_instructor") return false;
  return true;
}

/** Income lines for this profession’s dedicated form. */
export function getVisibleIncomeLineItems(template: TradeFormTemplate, _trade: string): MoneyLineItem[] {
  return template.incomeLineItems;
}

/**
 * Expense lines shown in the form. Applies simplified mileage rules when relevant.
 */
export function getVisibleExpenseLineItems(
  template: TradeFormTemplate,
  method: VehicleCostMethod,
  trade: string,
): MoneyLineItem[] {
  const tid = template.id;
  const rows = template.expenseLineItems;

  if (!usesBusinessVehicleTemplate(tid) || method !== "simplified" || !vehicleSimplifiedMileageAllowed(trade, tid)) {
    return rows;
  }

  let omit: Set<string> = new Set();
  if (TRANSPORT_FORM_IDS.has(tid)) omit = TRANSPORT_ACTUAL_VEHICLE_COST_IDS;
  else if (tid === "driving_instructor") omit = TEACHING_ACTUAL_VEHICLE_COST_IDS;
  else omit = TRADES_ACTUAL_VEHICLE_COST_IDS;

  const rest = rows.filter((li) => !omit.has(li.id));
  return [VEHICLE_SIMPLIFIED_MILEAGE_EXPENSE, ...rest];
}
