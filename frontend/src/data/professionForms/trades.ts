import { adminExpenses, defineForm, line } from "@/data/professionForms/shared";
import type { TradeFormTemplate } from "@/data/professionForms/types";

const vanCosts = [
  line("van_lease_finance", "Van lease, hire purchase or loan", "0 if none"),
  line("fuel_energy", "Fuel & charging (business)"),
  line("vehicle_insurance", "Van / vehicle insurance"),
  line("vehicle_tax_mot", "Road tax (VED) & MOT"),
  line("vehicle_repair", "Repairs, servicing & cleaning"),
];

const tradeAdmin = () =>
  adminExpenses({
    phoneId: "phone_office",
    insuranceLabel: "Public liability insurance",
  });

export const TRADE_FORMS: Record<string, TradeFormTemplate> = {
  Electrician: defineForm(
    "electrician",
    "Electrician",
    [
      line("income_labour", "Labour, day & hourly rates", "Gross before CIS if deducted"),
      line("income_callout", "Call-out & emergency fees"),
      line("income_fixed_install", "Fixed-price jobs & installations"),
      line("income_materials_resale", "Materials charged to clients"),
      line("income_testing_cert", "Testing & certification (EICR, Part P, etc.)"),
      line("income_other", "Other electrical income"),
    ],
    [
      ...vanCosts,
      line("materials", "Cable, fittings, boards & job materials"),
      line("tools", "Hand tools, power tools & test equipment"),
      line("calibration", "Test equipment calibration"),
      line("ppe", "PPE & workwear"),
      line("trade_gas_registration", "NICEIC / registration & scheme fees"),
      line("waste", "Waste disposal", "0 if none"),
      line("subcontractors", "Subcontractors", "0 if none"),
      line("training_cpd", "Training & CPD"),
      ...tradeAdmin(),
    ],
  ),

  Plumber: defineForm(
    "plumber",
    "Plumber",
    [
      line("income_labour", "Labour, day & hourly rates", "Gross before CIS if deducted"),
      line("income_callout", "Call-out & emergency fees"),
      line("income_fixed_install", "Installations & fixed-price jobs"),
      line("income_boiler_servicing", "Boiler servicing & maintenance"),
      line("income_materials_resale", "Materials charged to clients"),
      line("income_testing_cert", "Gas safety & certification income", "0 if not Gas Safe work"),
      line("income_other", "Other plumbing income"),
    ],
    [
      ...vanCosts,
      line("materials", "Pipe, fittings, boilers parts & job materials"),
      line("tools", "Tools & equipment"),
      line("ppe", "PPE & workwear"),
      line("trade_gas_registration", "Gas Safe / trade scheme renewals"),
      line("waste", "Waste disposal", "0 if none"),
      line("subcontractors", "Subcontractors", "0 if none"),
      line("training_cpd", "Training & CPD"),
      ...tradeAdmin(),
    ],
  ),

  Carpenter: defineForm(
    "carpenter",
    "Carpenter",
    [
      line("income_labour", "Labour, day & hourly rates", "Gross before CIS if deducted"),
      line("income_fixed_install", "Fitted jobs, kitchens, doors & joinery"),
      line("income_materials_resale", "Timber & materials charged to clients"),
      line("income_other", "Other carpentry income"),
    ],
    [
      ...vanCosts,
      line("materials", "Timber, fixings & job materials"),
      line("tools", "Hand & power tools"),
      line("ppe", "PPE & workwear"),
      line("waste", "Waste & skips", "0 if none"),
      line("workshop_storage", "Workshop or storage rent", "0 if none"),
      line("subcontractors", "Subcontractors", "0 if none"),
      ...tradeAdmin(),
    ],
  ),

  "Painter & Decorator": defineForm(
    "painter_decorator",
    "Painter & Decorator",
    [
      line("income_labour", "Labour & day rates", "Gross before CIS if deducted"),
      line("income_decorating_finishes", "Decorating, wallpaper & finishes"),
      line("income_materials_resale", "Paint & materials charged to clients"),
      line("income_other", "Other decorating income"),
    ],
    [
      ...vanCosts,
      line("materials", "Paint, wallpaper & job materials"),
      line("decorating_consumables", "Brushes, rollers, fillers, sheets & tape"),
      line("tools", "Ladders & decorating tools"),
      line("ppe", "PPE & workwear"),
      line("waste", "Waste disposal", "0 if none"),
      ...tradeAdmin(),
    ],
  ),

  Handyman: defineForm(
    "handyman",
    "Handyman",
    [
      line("income_labour", "Labour & job fees"),
      line("income_callout", "Call-out fees", "0 if none"),
      line("income_materials_resale", "Materials charged to clients"),
      line("income_other", "Other handyman income"),
    ],
    [
      ...vanCosts,
      line("materials", "Fixings & job materials"),
      line("tools", "Tools"),
      line("ppe", "PPE & workwear"),
      line("waste", "Waste disposal", "0 if none"),
      ...tradeAdmin(),
    ],
  ),

  Roofer: defineForm(
    "roofer",
    "Roofer",
    [
      line("income_labour", "Labour & roofing jobs", "Gross before CIS if deducted"),
      line("income_callout", "Emergency call-outs", "0 if none"),
      line("income_materials_resale", "Materials charged to clients"),
      line("income_other", "Other roofing income"),
    ],
    [
      ...vanCosts,
      line("materials", "Tiles, felt, lead & roofing materials"),
      line("tools", "Tools"),
      line("ladders_scaffolding", "Ladders, scaffolding & access (hire or buy)"),
      line("ppe", "PPE & workwear"),
      line("waste", "Waste & skips"),
      line("subcontractors", "Subcontractors", "0 if none"),
      ...tradeAdmin(),
    ],
  ),

  Builder: defineForm(
    "builder",
    "Builder",
    [
      line("income_labour", "Labour & build work", "Gross before CIS if deducted"),
      line("income_fixed_install", "Fixed-price contracts"),
      line("income_materials_resale", "Materials charged to clients"),
      line("income_other", "Other building income"),
    ],
    [
      ...vanCosts,
      line("materials", "Building materials"),
      line("tools", "Tools & plant"),
      line("ladders_scaffolding", "Scaffolding & access"),
      line("ppe", "PPE & workwear"),
      line("waste", "Skips & waste"),
      line("subcontractors", "Subcontractors", "0 if none"),
      ...tradeAdmin(),
    ],
  ),

  Bricklayer: defineForm(
    "bricklayer",
    "Bricklayer",
    [
      line("income_labour", "Labour & brickwork", "Gross before CIS if deducted"),
      line("income_materials_resale", "Materials charged to clients", "0 if labour-only"),
      line("income_other", "Other bricklaying income"),
    ],
    [
      ...vanCosts,
      line("materials", "Bricks, blocks, sand & cement"),
      line("tools", "Tools"),
      line("ppe", "PPE & workwear"),
      line("waste", "Waste disposal", "0 if none"),
      line("subcontractors", "Labourers / subcontractors", "0 if none"),
      ...tradeAdmin(),
    ],
  ),

  Locksmith: defineForm(
    "locksmith",
    "Locksmith",
    [
      line("income_callout", "Call-out & emergency unlock fees"),
      line("income_labour", "Labour & fitting fees"),
      line("income_materials_resale", "Locks, keys & hardware sold"),
      line("income_other", "Other locksmith income"),
    ],
    [
      ...vanCosts,
      line("materials", "Locks, cylinders, keys & hardware"),
      line("tools", "Locksmith tools & key cutting"),
      line("ppe", "PPE & workwear", "0 if not applicable"),
      line("dbs_checks", "DBS checks", "0 if not required"),
      line("training_cpd", "Training & association fees", "0 if not applicable"),
      ...tradeAdmin(),
    ],
  ),

  Gardener: defineForm(
    "gardener",
    "Gardener",
    [
      line("income_labour", "Garden maintenance fees"),
      line("income_fixed_install", "One-off garden projects"),
      line("income_materials_resale", "Plants & materials charged to clients", "0 if none"),
      line("income_other", "Other gardening income"),
    ],
    [
      ...vanCosts,
      line("plants_seeds_materials", "Plants, compost, mulch & materials"),
      line("tools", "Mowers, tools & garden equipment"),
      line("garden_waste_disposal", "Green waste & tip fees"),
      line("ppe", "PPE & workwear"),
      ...tradeAdmin(),
    ],
  ),

  Landscaper: defineForm(
    "landscaper",
    "Landscaper",
    [
      line("income_labour", "Landscaping labour"),
      line("income_fixed_install", "Landscaping projects & installs"),
      line("income_materials_resale", "Turf, stone & materials charged to clients"),
      line("income_other", "Other landscaping income"),
    ],
    [
      ...vanCosts,
      line("plants_seeds_materials", "Turf, plants, stone, soil & materials"),
      line("tools", "Tools & machinery"),
      line("garden_waste_disposal", "Waste, chipper & skips"),
      line("ppe", "PPE & workwear"),
      line("subcontractors", "Subcontractors", "0 if none"),
      ...tradeAdmin(),
    ],
  ),

  "Window Cleaner": defineForm(
    "window_cleaner",
    "Window Cleaner",
    [
      line("income_labour", "Domestic window cleaning rounds"),
      line("income_fixed_install", "Commercial / one-off cleans", "0 if domestic only"),
      line("income_other", "Other window cleaning income"),
    ],
    [
      ...vanCosts,
      line("cleaning_supplies", "Cleaning chemicals & consumables"),
      line("ladder_access_equipment", "Ladders, poles & water-fed kit"),
      line("ppe", "PPE & workwear"),
      line("waste_disposal", "Waste water / disposal fees", "0 if none"),
      ...tradeAdmin(),
    ],
  ),

  "Mobile Mechanic": defineForm(
    "mobile_mechanic",
    "Mobile Mechanic",
    [
      line("income_labour", "Labour & call-out fees"),
      line("income_materials_resale", "Parts charged to customers"),
      line("income_other", "Other mobile mechanic income"),
    ],
    [
      ...vanCosts,
      line("parts_supplies", "Parts, oils & fluids"),
      line("diagnostic_tools", "Diagnostic tools & scanners"),
      line("tools", "Hand tools & equipment"),
      line("waste_oil_disposal", "Waste oil & hazardous waste"),
      line("ppe", "PPE & workwear"),
      ...tradeAdmin(),
    ],
  ),

  "Car Repair Garage": defineForm(
    "car_repair_garage",
    "Car Repair Garage",
    [
      line("income_labour", "Labour charges"),
      line("income_materials_resale", "Parts sold to customers"),
      line("income_other", "MOT / other garage income", "0 if none"),
    ],
    [
      line("premises_rent_rates", "Garage rent, rates & utilities"),
      line("parts_supplies", "Parts, oils & fluids"),
      line("diagnostic_tools", "Diagnostic tools & scanners"),
      line("hoist_equipment", "Ramps, hoists & garage plant"),
      line("tools", "Tools"),
      line("waste_oil_disposal", "Waste oil, tyres & hazardous waste"),
      line("ppe", "PPE & workwear"),
      line("training_cpd", "Training & MOT authorisations", "0 if not applicable"),
      ...tradeAdmin(),
    ],
  ),

  "Tradesperson (General)": defineForm(
    "tradesperson_general",
    "Tradesperson (General)",
    [
      line("income_labour", "Labour & job fees"),
      line("income_materials_resale", "Materials charged to clients", "0 if none"),
      line("income_other", "Other trade income"),
    ],
    [
      ...vanCosts,
      line("materials", "Materials & supplies"),
      line("tools", "Tools"),
      line("ppe", "PPE & workwear"),
      line("waste", "Waste disposal", "0 if none"),
      ...tradeAdmin(),
    ],
  ),
};
