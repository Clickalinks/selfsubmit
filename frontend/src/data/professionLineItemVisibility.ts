import type { ProfessionTag } from "@/data/professionTags";

/** Line id → profession tags required to show the line (at least one match). Omitted ids = all professions in template. */
export type LineVisibilityMap = Record<string, readonly ProfessionTag[]>;

/** Only profession-specific optional lines are restricted — core template lines stay visible to all. */
export const INCOME_LINE_VISIBILITY: Record<string, LineVisibilityMap> = {
  transport_driving: {
    income_meter_card: ["taxi_phv"],
    income_waiting: ["taxi_phv", "phv_app"],
    income_courier_extras: ["courier"],
  },
  personal_services: {
    income_colour_treatments: ["hairdresser", "beauty"],
    income_nails_lashes_brows: ["beauty", "nails"],
    income_massage_body: ["massage"],
    income_bridal_corporate_home: ["hairdresser", "beauty", "massage", "barber"],
  },
  trades: {
    income_testing_cert: ["electrician", "plumber", "gas_heating"],
    income_boiler_servicing: ["plumber", "gas_heating"],
    income_decorating_finishes: ["painter"],
  },
  teaching_training: {
    income_tests: ["driving_instructor"],
    income_motorway_intensive: ["driving_instructor"],
    income_tutor_exam_online: ["tutor", "music"],
    income_pt_online_nutrition: ["fitness"],
    income_gym_studio_pass_through: ["fitness"],
  },
  freelancers: {
    income_hosting_domain_resale: ["web_dev"],
    income_maintenance_support: ["web_dev", "consulting", "bookkeeping"],
    income_content_ads_social: ["social_content", "creative_design"],
    income_photo_video_extras: ["photo_video"],
    income_licensing: ["photo_video", "creative_design", "social_content"],
  },
  online_sellers: {
    income_wholesale_b2b: ["online_seller", "market_trader"],
    income_affiliate: ["online_seller", "social_content"],
  },
  property_income: {
    income_short_term_lets: ["short_term_let"],
    income_service_charges: ["landlord", "short_term_let"],
    income_deposits_forfeited: ["landlord", "short_term_let"],
  },
};

export const EXPENSE_LINE_VISIBILITY: Record<string, LineVisibilityMap> = {
  transport_driving: {
    radio_dispatch: ["taxi_phv"],
    courier_kit: ["delivery", "courier"],
    parcel_app_fees: ["delivery", "courier"],
    uniform_required: ["taxi_phv", "phv_app", "delivery", "courier"],
  },
  personal_services: {
    waste_disposal: ["barber", "hairdresser", "beauty", "nails"],
    laundry: ["barber", "hairdresser", "beauty", "nails", "massage"],
  },
  trades: {
    trade_gas_registration: ["electrician", "plumber", "gas_heating"],
    calibration: ["electrician"],
    decorating_consumables: ["painter"],
    ladders_scaffolding: ["builder_trade", "painter", "window_clean", "electrician"],
    workshop_storage: ["automotive_garage", "automotive"],
    parts_supplies: ["automotive", "automotive_garage"],
    diagnostic_tools: ["automotive", "automotive_garage"],
    premises_rent_rates: ["automotive_garage"],
    hoist_equipment: ["automotive_garage"],
    waste_oil_disposal: ["automotive_garage"],
    plants_seeds_materials: ["gardener", "landscaping"],
    garden_waste_disposal: ["gardener", "landscaping"],
    ladder_access_equipment: ["window_clean"],
  },
  teaching_training: {
    car_lease: ["driving_instructor"],
    vehicle_costs: ["driving_instructor"],
    dual_controls: ["driving_instructor"],
    adi_registration: ["driving_instructor"],
    franchise_fees: ["driving_instructor"],
    learner_insurance: ["driving_instructor"],
    gym_studio_rent: ["fitness"],
    equipment_pt: ["fitness"],
    first_aid: ["fitness", "childcare"],
    dbs: ["tutor", "childcare", "driving_instructor", "music"],
    childcare_registration: ["childcare"],
    music_instruments: ["music"],
  },
  freelancers: {
    monitors_peripherals: ["web_dev", "creative_design", "bookkeeping", "consulting"],
    scheduling_marketing_tools: ["social_content", "consulting", "bookkeeping"],
    stock_assets: ["creative_design", "photo_video", "social_content"],
    api_dev_tools: ["web_dev"],
    editing_storage_media: ["photo_video"],
    studio_props: ["photo_video"],
    equipment_insurance: ["photo_video"],
    drone_registration: ["photo_video"],
    pet_insurance: ["pet_care"],
    pet_supplies: ["pet_care"],
    food_ingredients: ["catering"],
    kitchen_equipment: ["catering"],
    food_hygiene_training: ["catering"],
    professional_bodies: ["bookkeeping", "consulting"],
  },
  online_sellers: {
    storage_fulfilment: ["online_seller"],
    market_stall_fees: ["market_trader"],
    market_equipment: ["market_trader"],
  },
  property_income: {
    cleaning_linen: ["short_term_let"],
  },
};

export function lineVisibleForProfession(
  templateId: string,
  lineId: string,
  professionTags: Set<ProfessionTag>,
  visibilityMaps: Record<string, LineVisibilityMap>,
): boolean {
  const rules = visibilityMaps[templateId]?.[lineId];
  if (!rules || rules.length === 0) return true;
  return rules.some((tag) => professionTags.has(tag));
}
