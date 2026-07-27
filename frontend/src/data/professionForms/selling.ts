import { adminExpenses, defineForm, line } from "@/data/professionForms/shared";
import type { TradeFormTemplate } from "@/data/professionForms/types";

export const SELLING_FORMS: Record<string, TradeFormTemplate> = {
  "Amazon Seller": defineForm(
    "amazon_seller",
    "Amazon Seller",
    [
      line("income_product_sales", "Product sales (gross before fees)"),
      line("income_shipping_charged", "Shipping charged to buyers", "0 if none"),
      line("income_platform_bonuses", "Amazon incentives / credits", "0 if none"),
      line("income_other", "Other Amazon income"),
    ],
    [
      line("cost_of_goods", "Cost of goods / stock"),
      line("platform_fees", "Amazon fees & referrals"),
      line("storage_fulfilment", "FBA / storage & fulfilment"),
      line("postage_courier", "Postage (if you fulfil)", "0 if FBA only"),
      line("packaging", "Packaging & labels", "0 if FBA only"),
      line("returns_refunds", "Returns & write-offs", "0 if none"),
      line("advertising", "Sponsored ads & PPC"),
      line("software", "Seller tools & inventory software", "0 if none"),
      ...adminExpenses({ includeMarketing: false }),
    ],
  ),

  "Etsy Seller": defineForm(
    "etsy_seller",
    "Etsy Seller",
    [
      line("income_product_sales", "Product sales (gross before fees)"),
      line("income_shipping_charged", "Shipping charged to buyers"),
      line("income_other", "Other Etsy income"),
    ],
    [
      line("cost_of_goods", "Materials & cost of goods"),
      line("platform_fees", "Etsy fees & listings"),
      line("postage_courier", "Postage & courier"),
      line("packaging", "Packaging & labels"),
      line("advertising", "Etsy ads & promotion", "0 if none"),
      line("equipment", "Craft / packing equipment", "0 if none"),
      line("home_office", "Home workspace costs"),
      ...adminExpenses({ includeMarketing: false }),
    ],
  ),

  "TikTok Shop Seller": defineForm(
    "tiktok_shop_seller",
    "TikTok Shop Seller",
    [
      line("income_product_sales", "Shop sales (gross before fees)"),
      line("income_affiliate", "Creator / affiliate income", "0 if none"),
      line("income_other", "Other TikTok Shop income"),
    ],
    [
      line("cost_of_goods", "Cost of goods / stock"),
      line("platform_fees", "TikTok Shop fees"),
      line("postage_courier", "Postage & fulfilment"),
      line("packaging", "Packaging"),
      line("advertising", "Ads & promotion"),
      line("software", "Seller tools", "0 if none"),
      ...adminExpenses({ includeMarketing: false }),
    ],
  ),

  "Market Trader": defineForm(
    "market_trader",
    "Market Trader",
    [
      line("income_product_sales", "Stall sales"),
      line("income_wholesale_b2b", "Wholesale / trade sales", "0 if none"),
      line("income_other", "Other market income"),
    ],
    [
      line("cost_of_goods", "Stock & cost of goods"),
      line("market_stall_fees", "Pitch / stall fees"),
      line("market_equipment", "Gazebo, tables & display kit"),
      line("travel", "Travel to markets"),
      line("parking_congestion", "Parking & tolls", "0 if none"),
      line("packaging", "Bags & packaging", "0 if none"),
      ...adminExpenses(),
    ],
  ),

  "Online Seller": defineForm(
    "online_seller",
    "Online Seller",
    [
      line("income_product_sales", "Online sales (gross before fees)"),
      line("income_shipping_charged", "Shipping charged to buyers", "0 if none"),
      line("income_wholesale_b2b", "Wholesale sales", "0 if none"),
      line("income_other", "Other online selling income"),
    ],
    [
      line("cost_of_goods", "Cost of goods / stock"),
      line("platform_fees", "Marketplace & website fees"),
      line("payment_processing", "PayPal / Stripe fees"),
      line("postage_courier", "Postage & courier"),
      line("packaging", "Packaging"),
      line("advertising", "Ads & promotion", "0 if none"),
      line("software", "Seller tools", "0 if none"),
      line("home_office", "Home office / storage costs"),
      ...adminExpenses({ includeMarketing: false }),
    ],
  ),
};

export const PROPERTY_FORMS: Record<string, TradeFormTemplate> = {
  "Landlord (Rental Income)": defineForm(
    "landlord_rental_income",
    "Landlord (Rental Income)",
    [
      line("income_rent", "Rent received"),
      line("income_service_charges", "Service charges recovered", "0 if none"),
      line("income_deposits_forfeited", "Taxable deposits / premiums", "0 if none"),
      line("income_other", "Other rental income"),
    ],
    [
      line("repairs_maintenance", "Repairs & maintenance (not improvements)"),
      line("letting_agent", "Letting agent fees"),
      line("insurance", "Landlord insurance"),
      line("safety_certificates", "Gas safety, EICR, EPC & certificates"),
      line("utilities_council", "Utilities & council tax (if you pay)", "0 if tenant pays"),
      line("mortgage_interest", "Finance costs (allowable mortgage interest)"),
      line("travel", "Travel to properties"),
      line("legal_professional", "Legal & professional fees", "0 if none"),
      ...adminExpenses({ includeInsurance: false, includeMarketing: false }),
    ],
  ),

  "Airbnb Host": defineForm(
    "airbnb_host",
    "Airbnb Host",
    [
      line("income_short_term_lets", "Short-term let income (Airbnb, etc.)"),
      line("income_other", "Other hosting income"),
    ],
    [
      line("letting_agent", "Platform / management fees"),
      line("cleaning_linen", "Cleaning, laundry & turnover"),
      line("repairs_maintenance", "Repairs & maintenance"),
      line("insurance", "Holiday let / landlord insurance"),
      line("utilities_council", "Utilities & council tax"),
      line("safety_certificates", "Safety certificates", "0 if none this period"),
      line("travel", "Travel to the property"),
      line("mortgage_interest", "Finance costs (allowable amount)", "0 if none"),
      ...adminExpenses({ includeInsurance: false, includeMarketing: false }),
    ],
  ),

  "Property Income Earner": defineForm(
    "property_income_earner",
    "Property Income Earner",
    [
      line("income_rent", "Rent / property income received"),
      line("income_short_term_lets", "Short-term let income", "0 if none"),
      line("income_other", "Other property income"),
    ],
    [
      line("repairs_maintenance", "Repairs & maintenance"),
      line("letting_agent", "Agent / platform fees", "0 if none"),
      line("insurance", "Property insurance"),
      line("safety_certificates", "Compliance certificates", "0 if none"),
      line("utilities_council", "Utilities & council tax (if you pay)", "0 if none"),
      line("mortgage_interest", "Finance costs (allowable amount)"),
      line("travel", "Travel to properties", "0 if none"),
      ...adminExpenses({ includeInsurance: false, includeMarketing: false }),
    ],
  ),
};

export const SERVICE_FORMS: Record<string, TradeFormTemplate> = {
  "Domestic Cleaner": defineForm(
    "domestic_cleaner",
    "Domestic Cleaner",
    [
      line("income_cleaning_jobs", "One-off & ad-hoc cleans"),
      line("income_cleaning_contracts", "Regular weekly / fortnightly clients"),
      line("income_end_of_tenancy", "End-of-tenancy cleans", "0 if none"),
      line("income_ironing_laundry", "Ironing & laundry extras", "0 if none"),
      line("income_tips", "Tips (declared)", "0 if none"),
      line("income_other", "Other cleaning income"),
    ],
    [
      line("cleaning_supplies", "Cleaning chemicals, cloths & consumables"),
      line("cleaning_equipment", "Vacuums, mops & cleaning kit"),
      line("ppe_uniform", "Gloves, masks, aprons & PPE"),
      line("equipment_repair", "Equipment repair & replacement", "0 if none"),
      line("travel", "Travel between clients"),
      line("parking_congestion", "Parking, congestion & ULEZ", "0 if none"),
      line("dbs_checks", "DBS checks", "0 if not required"),
      line("training", "COSHH / hygiene training", "0 if none"),
      line("booking_software", "Booking apps", "0 if none"),
      line("home_office", "Home storage / admin costs"),
      line("waste_disposal", "Bin bags & waste", "0 if none"),
      ...adminExpenses({ insuranceLabel: "Public liability insurance" }),
    ],
  ),

  "Cleaner (Domestic & Commercial)": defineForm(
    "cleaner_domestic_commercial",
    "Cleaner (Domestic & Commercial)",
    [
      line("income_cleaning_jobs", "Domestic one-off cleans"),
      line("income_cleaning_contracts", "Regular domestic clients"),
      line("income_commercial_cleaning", "Commercial / office / Airbnb cleans"),
      line("income_end_of_tenancy", "End-of-tenancy cleans", "0 if none"),
      line("income_tips", "Tips (declared)", "0 if none"),
      line("income_other", "Other cleaning income"),
    ],
    [
      line("cleaning_supplies", "Cleaning chemicals, cloths & consumables"),
      line("cleaning_equipment", "Vacuums, mops, pressure washers & kit"),
      line("ppe_uniform", "Gloves, masks, aprons & PPE"),
      line("equipment_repair", "Equipment repair & replacement", "0 if none"),
      line("travel", "Travel between jobs"),
      line("parking_congestion", "Parking, congestion & ULEZ", "0 if none"),
      line("dbs_checks", "DBS checks", "0 if not required"),
      line("training", "COSHH / hygiene training", "0 if none"),
      line("booking_software", "Booking apps", "0 if none"),
      line("home_office", "Home storage / admin costs"),
      line("waste_disposal", "Bin bags & waste", "0 if none"),
      ...adminExpenses({ insuranceLabel: "Public liability insurance" }),
    ],
  ),

  "Dog Walker / Pet Sitter": defineForm(
    "dog_walker_pet_sitter",
    "Dog Walker / Pet Sitter",
    [
      line("income_projects", "Walking / sitting fees"),
      line("income_retainer", "Regular client packages", "0 if none"),
      line("income_other", "Other pet-care income"),
    ],
    [
      line("pet_supplies", "Leads, waste bags, treats & supplies"),
      line("pet_insurance", "Pet business / care insurance"),
      line("travel", "Travel between clients"),
      line("parking_congestion", "Parking", "0 if none"),
      line("dbs_checks", "DBS checks", "0 if not required"),
      line("training", "Training & first aid for pets", "0 if none"),
      line("booking_software", "Booking apps", "0 if none"),
      ...adminExpenses({ includeInsurance: false }),
    ],
  ),

  "Caterer / Personal Chef": defineForm(
    "caterer_personal_chef",
    "Caterer / Personal Chef",
    [
      line("income_projects", "Catering / chef fees"),
      line("income_materials_recharged", "Food charged separately to clients", "0 if included"),
      line("income_other", "Other catering income"),
    ],
    [
      line("food_ingredients", "Food ingredients & stock"),
      line("kitchen_equipment", "Kitchen equipment & smallwares"),
      line("food_hygiene_training", "Food hygiene & allergen training"),
      line("travel", "Travel to events / clients"),
      line("packaging", "Packaging & disposables", "0 if none"),
      line("ppe_uniform", "Uniforms & PPE"),
      ...adminExpenses({ insuranceLabel: "Public liability / product liability" }),
    ],
  ),
};
