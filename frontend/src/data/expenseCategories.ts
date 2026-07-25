/**
 * Income + expense line items per trade template.
 * Professions map to a template — edit lists here without changing form logic.
 * Line items are aligned with common UK self-employment declarations (taxi, trades, etc.).
 */

import { SELF_EMPLOYED_PROFESSIONS } from "@/data/selfEmployedProfessions";
import {
  EXPENSE_LINE_VISIBILITY,
  INCOME_LINE_VISIBILITY,
  lineVisibleForProfession,
  type LineVisibilityMap,
} from "@/data/professionLineItemVisibility";
import { getProfessionTags, isCisEligibleTrade } from "@/data/professionTags";

export type MoneyLineItem = {
  id: string;
  label: string;
  hint?: string;
};

/** @deprecated use MoneyLineItem */
export type ExpenseLineItem = MoneyLineItem;

export type TradeFormTemplate = {
  id: string;
  title: string;
  incomeLineItems: MoneyLineItem[];
  expenseLineItems: MoneyLineItem[];
};

/** @deprecated use TradeFormTemplate */
export type ExpenseTemplate = TradeFormTemplate;

export const EXPENSE_TEMPLATES: Record<string, TradeFormTemplate> = {
  transport_driving: {
    id: "transport_driving",
    title: "Transport & driving",
    incomeLineItems: [
      { id: "income_meter_card", label: "Fare payments — meter & card takings" },
      { id: "income_cash", label: "Fare payments — cash" },
      { id: "income_app", label: "App / platform ride bookings (Uber, Bolt, etc.)" },
      { id: "income_booking_fees", label: "Booking fees & trip payments from operators / platforms" },
      { id: "income_waiting", label: "Waiting time & standing charges" },
      { id: "income_airport_caz", label: "Airport fees, CAZ & toll supplements (passenger-paid, declared)" },
      { id: "income_delivery_fees", label: "Delivery fees per drop, route pay & job fees" },
      {
        id: "income_surge_peak",
        label: "Surge / peak pricing & platform bonuses (money paid to you)",
        hint: "Income only — not the same as vehicle mileage expenses",
      },
      { id: "income_cancellation", label: "Cancellation & no-show fees" },
      {
        id: "income_courier_extras",
        label: "Courier: contract rates, overnight / express, pallet & oversize premiums",
        hint: "0 if you only do app delivery",
      },
      { id: "income_tips", label: "Tips & gratuities (declared amount)" },
    ],
    expenseLineItems: [
      { id: "lease_finance", label: "Vehicle finance / lease / PCP" },
      { id: "fuel", label: "Fuel & electric charging", hint: "Business journeys only" },
      { id: "vehicle_insurance", label: "Vehicle insurance (including hire & reward where applicable)" },
      { id: "vehicle_tax_mot", label: "Road tax (VED) & MOT" },
      { id: "vehicle_repair", label: "Repairs & servicing" },
      { id: "cleaning", label: "Cleaning / valeting" },
      { id: "congestion_ulez", label: "Congestion, ULEZ, clean-air & toll charges" },
      { id: "parking", label: "Parking" },
      { id: "app_commission", label: "App & platform commission (e.g. Uber, Bolt, delivery apps)" },
      { id: "radio_dispatch", label: "Radio or dispatch circuit fees", hint: "0 if not applicable" },
      {
        id: "passenger_goods_insurance",
        label: "Passenger, goods-in-transit or courier top-up insurance",
        hint: "0 if fully covered in main policy",
      },
      { id: "breakdown_cover", label: "Breakdown cover" },
      { id: "licence_fees", label: "Licensing: taxi/PHV badge, PCO, operator & permit renewals" },
      { id: "dbs_checks", label: "DBS & background checks", hint: "0 if not applicable" },
      {
        id: "courier_kit",
        label: "Courier bags, insulated kit, straps & trolley",
        hint: "0 if not applicable",
      },
      {
        id: "parcel_app_fees",
        label: "Parcel protection, delivery app subscriptions & courier software",
        hint: "0 if not applicable",
      },
      { id: "uniform_required", label: "Uniform or kit required by operator", hint: "0 if not applicable" },
      { id: "phone_data", label: "Mobile phone & data (business use %)" },
      { id: "office_stationery", label: "Office stationery & postage" },
      { id: "trade_memberships", label: "Trade / operator memberships & professional subscriptions" },
      { id: "training_cpd", label: "Training courses & CPD" },
      { id: "marketing", label: "Marketing & advertising" },
      {
        id: "public_liability_pi",
        label: "Public liability / professional indemnity (non-vehicle, if applicable)",
        hint: "0 if not applicable",
      },
      { id: "accountant", label: "Accountant or bookkeeping software fees" },
      { id: "bank", label: "Bank & card payment charges (Stripe, SumUp, Square, etc.)" },
      { id: "other", label: "Other allowable expenses" },
    ],
  },
  personal_services: {
    id: "personal_services",
    title: "Personal services",
    incomeLineItems: [
      { id: "income_cuts_styling", label: "Haircuts, beard trims, shaves & general styling" },
      {
        id: "income_colour_treatments",
        label: "Colouring, highlights, perms, extensions & chemical services",
        hint: "0 if not applicable",
      },
      {
        id: "income_nails_lashes_brows",
        label: "Nails, lashes, brows, waxing & beauty treatments",
        hint: "0 if not applicable",
      },
      {
        id: "income_massage_body",
        label: "Massage & body treatments (sports, deep tissue, aromatherapy, etc.)",
        hint: "0 if not applicable",
      },
      { id: "income_retail", label: "Product sales (shampoo, wax, retail, etc.)" },
      { id: "income_packages", label: "Packages, memberships & block bookings" },
      {
        id: "income_bridal_corporate_home",
        label: "Bridal / event styling, corporate & home-visit fees",
        hint: "0 if not applicable",
      },
      { id: "income_tips", label: "Tips & gratuities (declared)" },
    ],
    expenseLineItems: [
      { id: "chair_rent", label: "Salon / therapy room / chair rent" },
      { id: "utilities", label: "Utilities (electric, water, heating) — business share" },
      {
        id: "stock",
        label: "Stock & consumables",
        hint: "Colour, developer, gels, acrylic, lash adhesive, oils, retail stock",
      },
      {
        id: "tools",
        label: "Equipment & smaller tools",
        hint: "Chairs, dryers, UV lamps, clippers, nail desk, massage table — capital vs revenue per your accountant",
      },
      { id: "insurance", label: "Professional, public liability & treatment-risk insurance" },
      { id: "waste_disposal", label: "Waste disposal (hair, chemicals, couch roll, PPE)" },
      { id: "training", label: "Training, certification & CPD" },
      { id: "uniform", label: "Uniforms, aprons & protective clothing" },
      { id: "laundry", label: "Towels, laundry & couch roll" },
      { id: "marketing", label: "Marketing & advertising (social, directories, flyers, cards)" },
      { id: "software", label: "Booking / POS / appointment software" },
      { id: "card_fees", label: "Card payment & terminal fees (Stripe, SumUp, Square, etc.)" },
      { id: "phone", label: "Phone & internet (business use %)" },
      { id: "office_stationery", label: "Office stationery & postage" },
      { id: "trade_memberships", label: "Professional subscriptions & trade memberships" },
      { id: "bank_charges", label: "Bank & business account fees" },
      { id: "accountant", label: "Accountant or bookkeeping software fees" },
      { id: "other", label: "Other allowable expenses" },
    ],
  },
  trades: {
    id: "trades",
    title: "Trades & construction",
    incomeLineItems: [
      {
        id: "income_labour",
        label: "Labour, day rates & hourly rates",
        hint: "Use gross amounts before CIS if contractors deducted tax under the Construction Industry Scheme.",
      },
      {
        id: "income_callout",
        label: "Call-out & emergency fees",
        hint: "Gross before CIS if applicable — record CIS withheld in the CIS section below.",
      },
      {
        id: "income_fixed_install",
        label: "Fixed-price jobs, installations & fitting",
        hint: "Gross before CIS if applicable.",
      },
      { id: "income_materials_resale", label: "Materials mark-up / resale charged to client" },
      {
        id: "income_testing_cert",
        label: "Testing, inspection & certification income (EICR, Part P, gas safety, etc.)",
        hint: "0 if not applicable",
      },
      {
        id: "income_boiler_servicing",
        label: "Boiler servicing & planned maintenance income",
        hint: "0 if not applicable",
      },
      {
        id: "income_decorating_finishes",
        label: "Decorating, wallpaper, spray & specialist finishes",
        hint: "0 if not applicable",
      },
      {
        id: "income_other",
        label: "Other trade income",
        hint: "Gross before CIS if your payer operated the scheme.",
      },
    ],
    expenseLineItems: [
      { id: "van_lease_finance", label: "Van lease, hire purchase or loan repayments" },
      { id: "fuel_energy", label: "Fuel & electric charging (business)" },
      { id: "vehicle_insurance", label: "Van / vehicle insurance" },
      { id: "vehicle_tax_mot", label: "Road tax (VED) & MOT" },
      { id: "vehicle_repair", label: "Repairs, servicing & vehicle cleaning" },
      {
        id: "materials",
        label: "Materials & supplies",
        hint: "Timber, pipe, cable, paint, fixings, boilers parts — job costs",
      },
      { id: "tools", label: "Hand tools & power tools" },
      { id: "tool_insurance_storage", label: "Tool insurance, storage & security" },
      { id: "ladders_scaffolding", label: "Ladders, scaffolding & access equipment (hire or purchase)" },
      { id: "waste", label: "Waste disposal & skips" },
      { id: "ppe", label: "Safety boots, PPE & workwear" },
      { id: "public_liability", label: "Public liability insurance" },
      {
        id: "trade_gas_registration",
        label: "Trade-body schemes & Gas Safe registration / renewals",
        hint: "NICEIC, ECA, Gas Safe, etc. — 0 if not applicable",
      },
      {
        id: "calibration",
        label: "Calibration of test equipment",
        hint: "0 if not applicable",
      },
      {
        id: "decorating_consumables",
        label: "Decorating consumables (brushes, fillers, wallpaper, dust sheets, masks)",
        hint: "0 if not applicable",
      },
      { id: "workshop_storage", label: "Workshop or storage unit rent", hint: "0 if not applicable" },
      {
        id: "parts_supplies",
        label: "Parts, oils, fluids & job supplies",
        hint: "Mechanic / garage stock used on jobs",
      },
      {
        id: "diagnostic_tools",
        label: "Diagnostic tools, scanners & specialist equipment",
        hint: "0 if not applicable",
      },
      {
        id: "premises_rent_rates",
        label: "Garage premises rent, rates & utilities",
        hint: "0 if mobile / no fixed premises",
      },
      {
        id: "hoist_equipment",
        label: "Ramps, hoists, lifts & garage plant (hire or purchase)",
        hint: "0 if not applicable",
      },
      {
        id: "waste_oil_disposal",
        label: "Waste oil, tyres & hazardous waste disposal",
        hint: "0 if not applicable",
      },
      {
        id: "plants_seeds_materials",
        label: "Plants, seeds, compost, turf & landscaping materials",
        hint: "0 if not applicable",
      },
      {
        id: "garden_waste_disposal",
        label: "Green waste disposal, chipper hire & skip costs",
        hint: "0 if not applicable",
      },
      {
        id: "ladder_access_equipment",
        label: "Ladders, water-fed poles & access equipment",
        hint: "0 if not applicable",
      },
      { id: "subcontractors", label: "Subcontractors" },
      { id: "phone_office", label: "Phone & office costs" },
      { id: "office_stationery", label: "Office stationery & postage" },
      { id: "trade_memberships", label: "Professional subscriptions & trade memberships" },
      { id: "training_cpd", label: "Training, certification renewals & CPD" },
      { id: "marketing", label: "Marketing, advertising & website" },
      { id: "card_fees", label: "Card & payment processing fees" },
      { id: "bank_charges", label: "Bank & business account fees" },
      { id: "accountant", label: "Accountant or bookkeeping software fees" },
      { id: "other", label: "Other allowable expenses" },
    ],
  },
  teaching_training: {
    id: "teaching_training",
    title: "Teaching & training",
    incomeLineItems: [
      { id: "income_lessons", label: "Lesson or session fees (per hour or slot)" },
      { id: "income_blocks", label: "Block bookings, courses & packages" },
      { id: "income_tests", label: "Test day, exam & pass fees (e.g. driving)" },
      {
        id: "income_motorway_intensive",
        label: "Motorway, intensive & specialist lesson fees",
        hint: "0 if not applicable",
      },
      { id: "income_group", label: "Group classes, boot camps & small-group sessions" },
      {
        id: "income_tutor_exam_online",
        label: "Tutor: exam prep, group sessions & online lesson fees",
        hint: "0 if not applicable",
      },
      { id: "income_resource_fees", label: "Resource, materials or admin fees charged to clients" },
      {
        id: "income_pt_online_nutrition",
        label: "Online coaching, nutrition plans & digital products",
        hint: "0 if not applicable",
      },
      {
        id: "income_gym_studio_pass_through",
        label: "Gym / studio hire you recharge to clients (pass-through)",
        hint: "0 if not applicable",
      },
      { id: "income_referral_bonuses", label: "Referral or sign-up bonuses", hint: "0 if not applicable" },
    ],
    expenseLineItems: [
      { id: "car_lease", label: "Dual-control car lease, finance or purchase (instructors)", hint: "0 if not applicable" },
      { id: "vehicle_costs", label: "Fuel, insurance, tax, MOT, repairs & cleaning (instruction vehicle)", hint: "0 if not applicable" },
      { id: "dual_controls", label: "Dual controls & vehicle adaptations", hint: "0 if not applicable" },
      { id: "adi_registration", label: "ADI registration, badge & renewal fees", hint: "0 if not a driving instructor" },
      { id: "franchise_fees", label: "Franchise fees (driving school franchise)", hint: "0 if not applicable" },
      { id: "learner_insurance", label: "Instructor / learner vehicle insurance (if itemised)", hint: "0 if included above" },
      { id: "materials", label: "Lesson materials, books & stationery" },
      { id: "laptop_tablet", label: "Laptop, tablet & training tech (business use)" },
      { id: "home_office", label: "Home office costs (simplified or actual %)" },
      { id: "printer_consumables", label: "Printer, ink & paper", hint: "0 if not applicable" },
      { id: "online_platforms", label: "Online lesson tools (Zoom, etc.) & platform subscriptions" },
      { id: "gym_studio_rent", label: "Gym or studio rent / hire (PT)", hint: "0 if not applicable" },
      { id: "equipment_pt", label: "Training equipment (mats, weights, bands, kettlebells)", hint: "0 if not applicable" },
      { id: "first_aid", label: "First aid certification & renewals", hint: "0 if not applicable" },
      { id: "dbs", label: "DBS & safeguarding checks" },
      {
        id: "childcare_registration",
        label: "Ofsted / childcare registration & renewal fees",
        hint: "0 if not a childminder",
      },
      {
        id: "music_instruments",
        label: "Instruments, sheet music & teaching aids",
        hint: "0 if not applicable",
      },
      { id: "professional_memberships", label: "Professional body memberships", hint: "0 if not applicable" },
      { id: "public_liability", label: "Public liability insurance" },
      {
        id: "professional_indemnity",
        label: "Professional indemnity insurance",
        hint: "0 if not applicable",
      },
      { id: "cpd", label: "CPD & training courses" },
      { id: "advertising", label: "Advertising & marketing" },
      { id: "software", label: "Booking, client management & accounts software" },
      { id: "phone", label: "Phone & internet (business use %)" },
      { id: "office_stationery", label: "Office stationery & postage" },
      { id: "bank_charges", label: "Bank & business account fees" },
      { id: "accountant", label: "Accountant or bookkeeping software fees" },
      { id: "other", label: "Other allowable expenses" },
    ],
  },
  freelancers: {
    id: "freelancers",
    title: "Freelancers & creatives",
    incomeLineItems: [
      { id: "income_projects", label: "Project fees, day rates & hourly billing" },
      { id: "income_retainer", label: "Retainers & recurring billing" },
      {
        id: "income_cleaning_jobs",
        label: "Domestic cleaning jobs (one-off & ad-hoc)",
        hint: "0 if not applicable",
      },
      {
        id: "income_cleaning_contracts",
        label: "Regular domestic cleaning contracts / weekly clients",
        hint: "0 if not applicable",
      },
      { id: "income_hosting_domain_resale", label: "Hosting, domain, plugin or licence resale to clients", hint: "0 if not applicable" },
      { id: "income_maintenance_support", label: "Maintenance, support & emergency / rush fees", hint: "0 if not applicable" },
      {
        id: "income_content_ads_social",
        label: "Content creation, paid ads management & strategy fees",
        hint: "0 if not applicable",
      },
      {
        id: "income_photo_video_extras",
        label: "Photo / video: editing, prints, licensing, drone & second-shooter fees",
        hint: "0 if not applicable",
      },
      { id: "income_licensing", label: "Licensing, usage fees & stock / asset sales" },
      { id: "income_other", label: "Other freelance income" },
    ],
    expenseLineItems: [
      { id: "equipment", label: "Computer, camera, lenses & core equipment" },
      { id: "monitors_peripherals", label: "Monitors, tablets & peripherals", hint: "0 if not applicable" },
      {
        id: "software",
        label: "Software & subscriptions",
        hint: "Adobe, Figma, JetBrains, editing suites, Canva Pro, etc.",
      },
      { id: "cloud_hosting", label: "Website hosting, cloud storage & backups" },
      { id: "scheduling_marketing_tools", label: "Scheduling, email marketing & social tools", hint: "0 if not applicable" },
      { id: "stock_assets", label: "Stock photos, fonts, icons & templates" },
      { id: "api_dev_tools", label: "API & developer tool subscriptions", hint: "0 if not applicable" },
      { id: "editing_storage_media", label: "Hard drives, memory cards, batteries & media delivery", hint: "0 if not applicable" },
      { id: "studio_props", label: "Studio rent, backdrops & props", hint: "0 if not applicable" },
      { id: "equipment_insurance", label: "Equipment & camera insurance", hint: "0 if not applicable" },
      {
        id: "drone_registration",
        label: "Drone registration, training & aviation insurance",
        hint: "0 if not applicable",
      },
      {
        id: "cleaning_supplies",
        label: "Cleaning chemicals, cloths & consumables",
        hint: "0 if not applicable",
      },
      {
        id: "cleaning_equipment",
        label: "Vacuums, mops, pressure washers & cleaning kit",
        hint: "0 if not applicable",
      },
      {
        id: "pet_insurance",
        label: "Pet business / care insurance",
        hint: "0 if not applicable",
      },
      {
        id: "pet_supplies",
        label: "Leads, harnesses, waste bags & pet care supplies",
        hint: "0 if not applicable",
      },
      {
        id: "food_ingredients",
        label: "Food ingredients & catering stock",
        hint: "0 if not applicable",
      },
      {
        id: "kitchen_equipment",
        label: "Kitchen equipment, utensils & smallwares",
        hint: "0 if not applicable",
      },
      {
        id: "food_hygiene_training",
        label: "Food hygiene, allergen & safety training",
        hint: "0 if not applicable",
      },
      {
        id: "professional_bodies",
        label: "Professional body fees (e.g. ICB, ACCA affiliate)",
        hint: "0 if not applicable",
      },
      { id: "travel", label: "Travel to clients or shoots (business)" },
      { id: "coworking", label: "Co-working or hot-desk rent", hint: "0 if not applicable" },
      { id: "home_office", label: "Home office costs (simplified or actual %)" },
      { id: "professional_insurance", label: "Professional indemnity & public liability" },
      { id: "marketing", label: "Marketing & advertising" },
      { id: "training", label: "Training courses & CPD" },
      { id: "phone_internet", label: "Phone & internet (business use %)" },
      { id: "office_stationery", label: "Office stationery & postage" },
      { id: "professional_memberships", label: "Professional subscriptions & memberships", hint: "0 if not applicable" },
      { id: "bank_charges", label: "Bank & card payment charges (Stripe, etc.)" },
      { id: "accountant", label: "Accountant or bookkeeping software fees" },
      { id: "other", label: "Other allowable expenses" },
    ],
  },
  online_sellers: {
    id: "online_sellers",
    title: "Online selling & market trading",
    incomeLineItems: [
      { id: "income_product_sales", label: "Product sales (gross turnover before fees)" },
      { id: "income_shipping_charged", label: "Shipping / delivery charged to buyers", hint: "0 if not applicable" },
      { id: "income_platform_bonuses", label: "Platform incentives, vouchers & promotional credits (taxable)", hint: "0 if not applicable" },
      { id: "income_wholesale_b2b", label: "Wholesale or trade sales", hint: "0 if not applicable" },
      { id: "income_affiliate", label: "Affiliate, referral & collaboration income", hint: "0 if not applicable" },
      { id: "income_other", label: "Other online selling income" },
    ],
    expenseLineItems: [
      { id: "cost_of_goods", label: "Cost of goods sold (stock, materials, wholesale purchases)" },
      { id: "platform_fees", label: "Marketplace & platform fees (Amazon, Etsy, eBay, TikTok Shop, etc.)" },
      { id: "payment_processing", label: "Payment processing fees (PayPal, Stripe, etc.)" },
      { id: "postage_courier", label: "Postage, courier & delivery costs" },
      { id: "packaging", label: "Packaging, labels & consumables" },
      { id: "storage_fulfilment", label: "Storage, FBA / fulfilment & warehouse fees", hint: "0 if not applicable" },
      { id: "returns_refunds", label: "Returns, refunds & write-offs", hint: "0 if not applicable" },
      { id: "advertising", label: "Advertising, PPC & promoted listings" },
      { id: "software", label: "Seller tools, inventory & listing software" },
      { id: "equipment", label: "Equipment (printer, scales, photography kit)", hint: "0 if not applicable" },
      {
        id: "market_stall_fees",
        label: "Market stall, pitch & fair fees",
        hint: "0 if not applicable",
      },
      {
        id: "market_equipment",
        label: "Stall equipment, gazebo, tables & display kit",
        hint: "0 if not applicable",
      },
      { id: "travel", label: "Travel to suppliers, markets or post office (business)" },
      { id: "home_office", label: "Home office costs (simplified or actual %)" },
      { id: "professional_insurance", label: "Public / product liability insurance", hint: "0 if not applicable" },
      { id: "phone_internet", label: "Phone & internet (business use %)" },
      { id: "accountant", label: "Accountant or bookkeeping software fees" },
      { id: "other", label: "Other allowable expenses" },
    ],
  },
  property_income: {
    id: "property_income",
    title: "Property & rental income",
    incomeLineItems: [
      { id: "income_rent", label: "Rent received from tenants" },
      { id: "income_short_term_lets", label: "Short-term / holiday let income (Airbnb, etc.)" },
      { id: "income_service_charges", label: "Service charges & ground rent recovered from tenants", hint: "0 if not applicable" },
      { id: "income_deposits_forfeited", label: "Deposits or premiums (taxable portion)", hint: "0 if not applicable" },
      { id: "income_other", label: "Other property income" },
    ],
    expenseLineItems: [
      { id: "repairs_maintenance", label: "Repairs & maintenance (not improvements)" },
      { id: "letting_agent", label: "Letting agent, management & platform fees" },
      { id: "insurance", label: "Landlord / buildings / contents insurance" },
      { id: "safety_certificates", label: "Gas safety, EICR, EPC & compliance certificates" },
      { id: "cleaning_linen", label: "Cleaning, laundry & turnover costs (short-term lets)", hint: "0 if not applicable" },
      { id: "utilities_council", label: "Utilities & council tax (if you pay them)", hint: "0 if tenant pays" },
      { id: "mortgage_interest", label: "Finance costs (mortgage interest — enter allowable amount)", hint: "Rules differ for residential lets" },
      { id: "travel", label: "Travel to properties (business)" },
      { id: "accountant", label: "Accountant or bookkeeping software fees" },
      { id: "legal_professional", label: "Legal & professional fees (letting, not purchase)", hint: "0 if not applicable" },
      { id: "other", label: "Other allowable expenses" },
    ],
  },
};

export const PROFESSION_TO_TEMPLATE: Record<string, keyof typeof EXPENSE_TEMPLATES> = {
  // Transport & driving
  "Taxi Driver": "transport_driving",
  "Uber Driver": "transport_driving",
  "Private Hire Driver (Uber/Bolt)": "transport_driving",
  "Delivery Driver": "transport_driving",
  "Delivery Driver (Amazon, Uber Eats)": "transport_driving",
  "Courier / Van Driver": "transport_driving",
  "HGV / Lorry Driver": "transport_driving",

  // Automotive
  "Mobile Mechanic": "trades",
  "Car Repair Garage": "trades",

  // Hair, beauty & wellbeing
  Barber: "personal_services",
  Hairdresser: "personal_services",
  Beautician: "personal_services",
  "Beautician (nails, lashes, etc.)": "personal_services",
  "Nail Technician": "personal_services",
  "Massage Therapist": "personal_services",

  // Construction & trades
  Electrician: "trades",
  Plumber: "trades",
  Carpenter: "trades",
  "Painter & Decorator": "trades",
  Handyman: "trades",
  Roofer: "trades",
  Builder: "trades",
  Bricklayer: "trades",
  "Builder / Bricklayer": "trades",
  Locksmith: "trades",
  Gardener: "trades",
  Landscaper: "trades",
  "Gardener / Landscaper": "trades",
  "Window Cleaner": "trades",

  // Teaching, fitness & childcare
  "Driving Instructor": "teaching_training",
  "Private Tutor": "teaching_training",
  "Tutor (academic or private)": "teaching_training",
  "Personal Trainer": "teaching_training",
  "Gym Coach": "teaching_training",
  "Fitness Instructor": "teaching_training",
  "Music Teacher": "teaching_training",
  Childminder: "teaching_training",

  // Creative, tech & professional
  "Graphic Designer (Freelance)": "freelancers",
  "Web Developer (Freelance)": "freelancers",
  "Graphic Designer": "freelancers",
  "Web Developer": "freelancers",
  "Cybersecurity Consultant": "freelancers",
  "Social Media Manager": "freelancers",
  "Photographer (Freelance)": "freelancers",
  Videographer: "freelancers",
  "Wedding Photographer": "freelancers",
  "Photographer / Videographer": "freelancers",
  "IT Consultant": "freelancers",
  "Management Consultant": "freelancers",
  "Freelance Consultant": "freelancers",
  Bookkeeper: "freelancers",
  "Freelancer (General)": "freelancers",
  "Tradesperson (General)": "trades",
  "Small Sole Trader": "freelancers",
  "Side-hustle Business": "freelancers",

  // Online selling & content
  "Amazon Seller": "online_sellers",
  "Etsy Seller": "online_sellers",
  "TikTok Shop Seller": "online_sellers",
  "Market Trader": "online_sellers",
  "Online Seller": "online_sellers",
  "Freelance Content Creator": "freelancers",
  Influencer: "freelancers",

  // Property income
  "Landlord (Rental Income)": "property_income",
  "Airbnb Host": "property_income",
  "Property Income Earner": "property_income",

  // Other services
  "Domestic Cleaner": "freelancers",
  "Cleaner (Domestic & Commercial)": "freelancers",
  "Cleaner (domestic & commercial)": "freelancers",
  "Dog Walker / Pet Sitter": "freelancers",
  "Caterer / Personal Chef": "freelancers",
};

export const DEFAULT_TEMPLATE_ID = "freelancers" as const;

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
  const key = trade.trim();
  const tid = PROFESSION_TO_TEMPLATE[key] ?? DEFAULT_TEMPLATE_ID;
  return EXPENSE_TEMPLATES[tid];
}

export function getTemplateIdForProfession(trade: string): string {
  const key = trade.trim();
  return PROFESSION_TO_TEMPLATE[key] ?? DEFAULT_TEMPLATE_ID;
}

/** Template id for trades that typically register for CIS as subcontractors (construction-related). */
export const CIS_CONSTRUCTION_TEMPLATE_ID = "trades" as const;

/** Electrician, plumber, carpenter, etc. — CIS may apply; not mechanics or gardeners. */
export function isCisConstructionTrade(trade: string): boolean {
  return isCisEligibleTrade(trade);
}

/** How vehicle running costs are claimed for this return (when the trade uses a business vehicle). */
export type VehicleCostMethod = "actual" | "simplified";

const VEHICLE_BUSINESS_TEMPLATE_IDS = new Set<string>(["transport_driving", "trades", "teaching_training"]);

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

export function usesBusinessVehicleTemplate(templateId: string): boolean {
  return VEHICLE_BUSINESS_TEMPLATE_IDS.has(templateId);
}

function filterLineItemsForProfession(
  items: MoneyLineItem[],
  templateId: string,
  trade: string,
  visibilityMaps: Record<string, LineVisibilityMap>,
): MoneyLineItem[] {
  const tags = getProfessionTags(trade);
  return items.filter((item) => lineVisibleForProfession(templateId, item.id, tags, visibilityMaps));
}

/**
 * HMRC car simplified mileage does not apply to dual-control cars used only for driving instruction.
 * Those vehicles should use the full (actual) cost method.
 */
export function vehicleSimplifiedMileageAllowed(trade: string, templateId: string): boolean {
  if (!usesBusinessVehicleTemplate(templateId)) return false;
  if (templateId === "teaching_training") {
    return !trade.toLowerCase().includes("driving instructor");
  }
  return true;
}

/** Income lines relevant to this profession within its template. */
export function getVisibleIncomeLineItems(template: TradeFormTemplate, trade: string): MoneyLineItem[] {
  return filterLineItemsForProfession(template.incomeLineItems, template.id, trade, INCOME_LINE_VISIBILITY);
}

/**
 * Expense lines shown in the form. Filters by profession, then applies simplified mileage rules.
 */
export function getVisibleExpenseLineItems(
  template: TradeFormTemplate,
  method: VehicleCostMethod,
  trade: string,
): MoneyLineItem[] {
  const professionFiltered = filterLineItemsForProfession(
    template.expenseLineItems,
    template.id,
    trade,
    EXPENSE_LINE_VISIBILITY,
  );
  const tid = template.id;
  if (!usesBusinessVehicleTemplate(tid) || method !== "simplified" || !vehicleSimplifiedMileageAllowed(trade, tid)) {
    return professionFiltered;
  }

  let omit: Set<string> = new Set();
  if (tid === "transport_driving") omit = TRANSPORT_ACTUAL_VEHICLE_COST_IDS;
  else if (tid === "trades") omit = TRADES_ACTUAL_VEHICLE_COST_IDS;
  else if (tid === "teaching_training") omit = TEACHING_ACTUAL_VEHICLE_COST_IDS;

  const rest = professionFiltered.filter((li) => !omit.has(li.id));
  return [VEHICLE_SIMPLIFIED_MILEAGE_EXPENSE, ...rest];
}
