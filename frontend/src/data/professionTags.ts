/**
 * Tags group professions that share the same income/expense line items.
 * Used to hide irrelevant fields (e.g. ADI badge for photographers).
 */

export type ProfessionTag =
  | "taxi_phv"
  | "phv_app"
  | "delivery"
  | "courier"
  | "hgv"
  | "automotive"
  | "automotive_garage"
  | "barber"
  | "hairdresser"
  | "beauty"
  | "nails"
  | "massage"
  | "electrician"
  | "plumber"
  | "gas_heating"
  | "carpenter"
  | "painter"
  | "builder_trade"
  | "gardener"
  | "landscaping"
  | "locksmith"
  | "window_clean"
  | "driving_instructor"
  | "tutor"
  | "music"
  | "fitness"
  | "childcare"
  | "creative_design"
  | "web_dev"
  | "photo_video"
  | "consulting"
  | "bookkeeping"
  | "social_content"
  | "cleaning"
  | "pet_care"
  | "catering"
  | "online_seller"
  | "market_trader"
  | "landlord"
  | "short_term_let";

const TAG = {
  taxi_phv: "taxi_phv",
  phv_app: "phv_app",
  delivery: "delivery",
  courier: "courier",
  hgv: "hgv",
  automotive: "automotive",
  automotive_garage: "automotive_garage",
  barber: "barber",
  hairdresser: "hairdresser",
  beauty: "beauty",
  nails: "nails",
  massage: "massage",
  electrician: "electrician",
  plumber: "plumber",
  gas_heating: "gas_heating",
  carpenter: "carpenter",
  painter: "painter",
  builder_trade: "builder_trade",
  gardener: "gardener",
  landscaping: "landscaping",
  locksmith: "locksmith",
  window_clean: "window_clean",
  driving_instructor: "driving_instructor",
  tutor: "tutor",
  music: "music",
  fitness: "fitness",
  childcare: "childcare",
  creative_design: "creative_design",
  web_dev: "web_dev",
  photo_video: "photo_video",
  consulting: "consulting",
  bookkeeping: "bookkeeping",
  social_content: "social_content",
  cleaning: "cleaning",
  pet_care: "pet_care",
  catering: "catering",
  online_seller: "online_seller",
  market_trader: "market_trader",
  landlord: "landlord",
  short_term_let: "short_term_let",
} as const satisfies Record<ProfessionTag, ProfessionTag>;

/** Canonical picker professions → tags. Legacy aliases included below. */
export const PROFESSION_TAGS: Record<string, readonly ProfessionTag[]> = {
  // Transport & driving
  "Taxi Driver": [TAG.taxi_phv],
  "Uber Driver": [TAG.phv_app],
  "Private Hire Driver (Uber/Bolt)": [TAG.phv_app],
  "Delivery Driver": [TAG.delivery],
  "Delivery Driver (Amazon, Uber Eats)": [TAG.delivery],
  "Courier / Van Driver": [TAG.courier],
  "HGV / Lorry Driver": [TAG.hgv],

  // Automotive
  "Mobile Mechanic": [TAG.automotive],
  "Car Repair Garage": [TAG.automotive_garage],

  // Hair, beauty & wellbeing
  Barber: [TAG.barber],
  Hairdresser: [TAG.hairdresser],
  Beautician: [TAG.beauty],
  "Beautician (nails, lashes, etc.)": [TAG.beauty, TAG.nails],
  "Nail Technician": [TAG.nails],
  "Massage Therapist": [TAG.massage],

  // Construction & trades
  Electrician: [TAG.electrician],
  Plumber: [TAG.plumber, TAG.gas_heating],
  Carpenter: [TAG.carpenter],
  "Painter & Decorator": [TAG.painter],
  Handyman: [TAG.builder_trade],
  Roofer: [TAG.builder_trade],
  Builder: [TAG.builder_trade],
  Bricklayer: [TAG.builder_trade],
  "Builder / Bricklayer": [TAG.builder_trade],
  Locksmith: [TAG.locksmith],
  Gardener: [TAG.gardener],
  Landscaper: [TAG.landscaping],
  "Gardener / Landscaper": [TAG.gardener, TAG.landscaping],
  "Window Cleaner": [TAG.window_clean],
  "Tradesperson (General)": [TAG.builder_trade],

  // Teaching, fitness & childcare
  "Driving Instructor": [TAG.driving_instructor],
  "Private Tutor": [TAG.tutor],
  "Tutor (academic or private)": [TAG.tutor],
  "Personal Trainer": [TAG.fitness],
  "Gym Coach": [TAG.fitness],
  "Fitness Instructor": [TAG.fitness],
  "Music Teacher": [TAG.music, TAG.tutor],
  Childminder: [TAG.childcare],

  // Creative, tech & professional
  "Graphic Designer (Freelance)": [TAG.creative_design],
  "Graphic Designer": [TAG.creative_design],
  "Web Developer (Freelance)": [TAG.web_dev],
  "Web Developer": [TAG.web_dev],
  "Cybersecurity Consultant": [TAG.consulting, TAG.web_dev],
  "Social Media Manager": [TAG.social_content],
  "Photographer (Freelance)": [TAG.photo_video],
  Videographer: [TAG.photo_video],
  "Wedding Photographer": [TAG.photo_video],
  "Photographer / Videographer": [TAG.photo_video],
  "IT Consultant": [TAG.consulting, TAG.web_dev],
  "Management Consultant": [TAG.consulting],
  "Freelance Consultant": [TAG.consulting],
  Bookkeeper: [TAG.bookkeeping],
  "Freelancer (General)": [TAG.consulting],
  "Small Sole Trader": [TAG.consulting],
  "Side-hustle Business": [TAG.consulting],

  // Online selling & content
  "Amazon Seller": [TAG.online_seller],
  "Etsy Seller": [TAG.online_seller],
  "TikTok Shop Seller": [TAG.online_seller],
  "Market Trader": [TAG.market_trader],
  "Online Seller": [TAG.online_seller],
  "Freelance Content Creator": [TAG.social_content],
  Influencer: [TAG.social_content],

  // Property
  "Landlord (Rental Income)": [TAG.landlord],
  "Airbnb Host": [TAG.short_term_let],
  "Property Income Earner": [TAG.landlord],

  // Other services
  "Cleaner (Domestic & Commercial)": [TAG.cleaning],
  "Cleaner (domestic & commercial)": [TAG.cleaning],
  "Dog Walker / Pet Sitter": [TAG.pet_care],
  "Caterer / Personal Chef": [TAG.catering],
};

const CIS_EXCLUDED_TAGS = new Set<ProfessionTag>([
  TAG.automotive,
  TAG.automotive_garage,
  TAG.gardener,
  TAG.landscaping,
  TAG.window_clean,
  TAG.locksmith,
]);

export function getProfessionTags(trade: string): Set<ProfessionTag> {
  const key = trade.trim();
  const tags = PROFESSION_TAGS[key];
  if (tags?.length) return new Set(tags);
  return new Set<ProfessionTag>();
}

export function professionHasTag(trade: string, tag: ProfessionTag): boolean {
  return getProfessionTags(trade).has(tag);
}

/** CIS applies to construction-related trades, not mechanics, gardeners, etc. */
export function isCisEligibleTrade(trade: string): boolean {
  const tags = getProfessionTags(trade);
  if (tags.size === 0) return false;
  for (const t of tags) {
    if (CIS_EXCLUDED_TAGS.has(t)) return false;
  }
  return (
    tags.has(TAG.builder_trade) ||
    tags.has(TAG.electrician) ||
    tags.has(TAG.plumber) ||
    tags.has(TAG.carpenter) ||
    tags.has(TAG.painter) ||
    tags.has(TAG.gas_heating)
  );
}
