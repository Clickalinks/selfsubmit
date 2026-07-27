import { adminExpenses, defineForm, line } from "@/data/professionForms/shared";
import type { TradeFormTemplate } from "@/data/professionForms/types";

export const BEAUTY_FORMS: Record<string, TradeFormTemplate> = {
  Barber: defineForm(
    "barber",
    "Barber",
    [
      line("income_cuts_styling", "Haircuts, beard trims & shaves"),
      line("income_packages", "Packages & block bookings", "0 if none"),
      line("income_retail", "Product sales (wax, shampoo, etc.)", "0 if none"),
      line("income_tips", "Tips (declared)"),
      line("income_other", "Other barber income"),
    ],
    [
      line("chair_rent", "Chair / salon rent", "0 if you own the shop"),
      line("utilities", "Utilities — business share", "0 if included in rent"),
      line("stock", "Stock & consumables (blades, wax, shampoo)"),
      line("tools", "Clippers, scissors & tools"),
      line("waste_disposal", "Waste disposal"),
      line("laundry", "Towels & laundry"),
      line("uniform", "Uniforms & aprons", "0 if not applicable"),
      line("training", "Training & CPD", "0 if not applicable"),
      line("software", "Booking / till software", "0 if not applicable"),
      ...adminExpenses({
        phoneId: "phone",
        insuranceLabel: "Public liability & treatment-risk insurance",
      }),
    ],
  ),

  Hairdresser: defineForm(
    "hairdresser",
    "Hairdresser",
    [
      line("income_cuts_styling", "Cuts, blow-drys & styling"),
      line("income_colour_treatments", "Colour, highlights, perms & treatments"),
      line("income_bridal_corporate_home", "Bridal, events & home visits", "0 if none"),
      line("income_packages", "Packages & memberships", "0 if none"),
      line("income_retail", "Retail product sales", "0 if none"),
      line("income_tips", "Tips (declared)"),
      line("income_other", "Other hairdressing income"),
    ],
    [
      line("chair_rent", "Salon / chair rent", "0 if you own the salon"),
      line("utilities", "Utilities — business share", "0 if included in rent"),
      line("stock", "Colour, developer, shampoo & consumables"),
      line("tools", "Dryers, tongs, scissors & equipment"),
      line("waste_disposal", "Chemical & hair waste disposal"),
      line("laundry", "Towels, gowns & laundry"),
      line("uniform", "Uniforms & aprons", "0 if not applicable"),
      line("training", "Training & CPD", "0 if not applicable"),
      line("software", "Booking software", "0 if not applicable"),
      ...adminExpenses({
        phoneId: "phone",
        insuranceLabel: "Public liability & treatment-risk insurance",
      }),
    ],
  ),

  Beautician: defineForm(
    "beautician",
    "Beautician",
    [
      line("income_nails_lashes_brows", "Beauty treatments (facials, waxing, lashes, brows)"),
      line("income_packages", "Packages & courses of treatment", "0 if none"),
      line("income_retail", "Retail product sales", "0 if none"),
      line("income_bridal_corporate_home", "Bridal, events & home visits", "0 if none"),
      line("income_tips", "Tips (declared)"),
      line("income_other", "Other beauty income"),
    ],
    [
      line("chair_rent", "Treatment room / salon rent", "0 if mobile / home-based"),
      line("stock", "Products, wax, adhesives & consumables"),
      line("tools", "Lamps, beds & beauty equipment"),
      line("waste_disposal", "Waste & PPE disposal"),
      line("laundry", "Couch roll, towels & laundry"),
      line("uniform", "Uniforms & PPE", "0 if not applicable"),
      line("training", "Training & certificates", "0 if not applicable"),
      line("software", "Booking software", "0 if not applicable"),
      ...adminExpenses({
        phoneId: "phone",
        insuranceLabel: "Public liability & treatment-risk insurance",
      }),
    ],
  ),

  "Nail Technician": defineForm(
    "nail_technician",
    "Nail Technician",
    [
      line("income_nails_lashes_brows", "Nail services (gel, acrylic, manicure, pedicure)"),
      line("income_packages", "Packages & refill courses", "0 if none"),
      line("income_retail", "Retail nail products", "0 if none"),
      line("income_tips", "Tips (declared)"),
      line("income_other", "Other nail income"),
    ],
    [
      line("chair_rent", "Desk / salon rent", "0 if mobile / home-based"),
      line("stock", "Gels, acrylics, tips, files & consumables"),
      line("tools", "UV/LED lamps, drill & nail desk kit"),
      line("waste_disposal", "Waste disposal"),
      line("laundry", "Towels & couch roll", "0 if not applicable"),
      line("training", "Training & CPD", "0 if not applicable"),
      line("software", "Booking software", "0 if not applicable"),
      ...adminExpenses({
        phoneId: "phone",
        insuranceLabel: "Public liability & treatment-risk insurance",
      }),
    ],
  ),

  "Massage Therapist": defineForm(
    "massage_therapist",
    "Massage Therapist",
    [
      line("income_massage_body", "Massage & body treatment fees"),
      line("income_packages", "Packages & memberships", "0 if none"),
      line("income_retail", "Oils & product sales", "0 if none"),
      line("income_bridal_corporate_home", "Home / corporate / event visits", "0 if none"),
      line("income_tips", "Tips (declared)"),
      line("income_other", "Other therapy income"),
    ],
    [
      line("chair_rent", "Therapy room rent", "0 if mobile / home-based"),
      line("stock", "Oils, creams & consumables"),
      line("tools", "Massage table, bolsters & equipment"),
      line("laundry", "Towels, couch roll & laundry"),
      line("uniform", "Uniforms & PPE", "0 if not applicable"),
      line("training", "Training & CPD", "0 if not applicable"),
      line("dbs", "DBS checks", "0 if not required"),
      line("travel", "Travel to clients", "0 if salon-only"),
      line("software", "Booking software", "0 if not applicable"),
      ...adminExpenses({
        phoneId: "phone",
        insuranceLabel: "Public liability & professional indemnity",
      }),
    ],
  ),
};
