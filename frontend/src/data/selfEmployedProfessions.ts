/**
 * UK self-employed & side-income business types (52 in picker, 60+ with legacy aliases).
 * Used at sign-up and on the monthly return form.
 */

export const SELF_EMPLOYED_PROFESSIONS = [
  // Transport & driving
  "Taxi Driver",
  "Uber Driver",
  "Delivery Driver",
  "Courier / Van Driver",
  "HGV / Lorry Driver",

  // Automotive
  "Mobile Mechanic",
  "Car Repair Garage",

  // Hair, beauty & wellbeing
  "Barber",
  "Hairdresser",
  "Beautician",
  "Nail Technician",
  "Massage Therapist",

  // Construction & trades
  "Electrician",
  "Plumber",
  "Carpenter",
  "Painter & Decorator",
  "Handyman",
  "Roofer",
  "Builder",
  "Bricklayer",
  "Locksmith",
  "Gardener",
  "Landscaper",
  "Window Cleaner",

  // Teaching, fitness & childcare
  "Driving Instructor",
  "Private Tutor",
  "Personal Trainer",
  "Gym Coach",
  "Fitness Instructor",
  "Music Teacher",
  "Childminder",

  // Creative, tech & professional services
  "Graphic Designer (Freelance)",
  "Web Developer (Freelance)",
  "Cybersecurity Consultant",
  "Social Media Manager",
  "Photographer (Freelance)",
  "Videographer",
  "Wedding Photographer",
  "IT Consultant",
  "Management Consultant",
  "Freelance Consultant",
  "Bookkeeper",

  // Online selling & digital content
  "Amazon Seller",
  "Etsy Seller",
  "TikTok Shop Seller",
  "Market Trader",
  "Online Seller",
  "Freelance Content Creator",
  "Influencer",

  // Property income
  "Landlord (Rental Income)",
  "Airbnb Host",
  "Property Income Earner",

  // Other services
  "Cleaner (Domestic & Commercial)",
  "Dog Walker / Pet Sitter",
  "Caterer / Personal Chef",

  // General / catch-all (freelancers, consultants, side hustles)
  "Freelancer (General)",
  "Tradesperson (General)",
  "Small Sole Trader",
  "Side-hustle Business",
] as const;

export type SelfEmployedProfession = (typeof SELF_EMPLOYED_PROFESSIONS)[number];

/** Picker count (excludes legacy label aliases). */
export const SELF_EMPLOYED_PROFESSION_COUNT = SELF_EMPLOYED_PROFESSIONS.length;

const PROFESSION_SET = new Set<string>(SELF_EMPLOYED_PROFESSIONS);

export function isSelfEmployedProfession(value: string): boolean {
  return PROFESSION_SET.has(value.trim());
}
