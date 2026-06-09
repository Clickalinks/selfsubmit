import type { LucideIcon } from "lucide-react";

import { DEFAULT_PROFESSION_ICON, PROFESSION_ICONS } from "@/data/tradeIcons";

export type LandingBusiness = {
  id: string;
  title: string;
  description: string;
  trade: string;
  icon: LucideIcon;
};

/** Featured on homepage full-width slider (24+). */
export const LANDING_BUSINESSES: LandingBusiness[] = [
  {
    id: "taxi",
    title: "Taxi Driver",
    trade: "Taxi Driver",
    description: "Track fares, fuel, licensing, and vehicle costs ready for MTD.",
    icon: PROFESSION_ICONS["Taxi Driver"] ?? DEFAULT_PROFESSION_ICON,
  },
  {
    id: "uber",
    title: "Uber Driver",
    trade: "Uber Driver",
    description: "Platform income, commission, and mileage in one monthly return.",
    icon: PROFESSION_ICONS["Uber Driver"] ?? DEFAULT_PROFESSION_ICON,
  },
  {
    id: "delivery",
    title: "Delivery Driver",
    trade: "Delivery Driver",
    description: "App fees, fuel, and per-drop income lines built for couriers.",
    icon: PROFESSION_ICONS["Delivery Driver"] ?? DEFAULT_PROFESSION_ICON,
  },
  {
    id: "electrician",
    title: "Electrician",
    trade: "Electrician",
    description: "Labour, materials, tools, and CIS-friendly expense categories.",
    icon: PROFESSION_ICONS.Electrician ?? DEFAULT_PROFESSION_ICON,
  },
  {
    id: "plumber",
    title: "Plumber",
    trade: "Plumber",
    description: "Call-outs, installs, parts resale, and trade insurance records.",
    icon: PROFESSION_ICONS.Plumber ?? DEFAULT_PROFESSION_ICON,
  },
  {
    id: "barber",
    title: "Barber",
    trade: "Barber",
    description: "Chair rent, stock, card fees, and daily takings made simple.",
    icon: PROFESSION_ICONS.Barber ?? DEFAULT_PROFESSION_ICON,
  },
  {
    id: "hairdresser",
    title: "Hairdresser",
    trade: "Hairdresser",
    description: "Colouring, retail, and freelance chair income in one form.",
    icon: PROFESSION_ICONS.Hairdresser ?? DEFAULT_PROFESSION_ICON,
  },
  {
    id: "beautician",
    title: "Beautician",
    trade: "Beautician",
    description: "Nails, lashes, treatments, and product sales for beauty pros.",
    icon: PROFESSION_ICONS.Beautician ?? DEFAULT_PROFESSION_ICON,
  },
  {
    id: "mobile-mechanic",
    title: "Mobile Mechanic",
    trade: "Mobile Mechanic",
    description: "Parts, tools, van costs, and job income on the road.",
    icon: PROFESSION_ICONS["Mobile Mechanic"] ?? DEFAULT_PROFESSION_ICON,
  },
  {
    id: "garage",
    title: "Car Repair Garage",
    trade: "Car Repair Garage",
    description: "Workshop rent, labour, parts, and MOT-related expenses.",
    icon: PROFESSION_ICONS["Car Repair Garage"] ?? DEFAULT_PROFESSION_ICON,
  },
  {
    id: "builder",
    title: "Builder",
    trade: "Builder",
    description: "Materials, subcontractors, and site costs for construction work.",
    icon: PROFESSION_ICONS.Builder ?? DEFAULT_PROFESSION_ICON,
  },
  {
    id: "painter",
    title: "Painter & Decorator",
    trade: "Painter & Decorator",
    description: "Decorating supplies, ladders, and project income tracking.",
    icon: PROFESSION_ICONS["Painter & Decorator"] ?? DEFAULT_PROFESSION_ICON,
  },
  {
    id: "gardener",
    title: "Gardener",
    trade: "Gardener",
    description: "Tools, green waste, fuel, and seasonal contract income.",
    icon: PROFESSION_ICONS.Gardener ?? DEFAULT_PROFESSION_ICON,
  },
  {
    id: "driving-instructor",
    title: "Driving Instructor",
    trade: "Driving Instructor",
    description: "Lessons, ADI fees, dual-control car, and learner insurance.",
    icon: PROFESSION_ICONS["Driving Instructor"] ?? DEFAULT_PROFESSION_ICON,
  },
  {
    id: "personal-trainer",
    title: "Personal Trainer",
    trade: "Personal Trainer",
    description: "Sessions, online coaching, gym hire, and equipment costs.",
    icon: PROFESSION_ICONS["Personal Trainer"] ?? DEFAULT_PROFESSION_ICON,
  },
  {
    id: "photographer",
    title: "Photographer",
    trade: "Photographer (Freelance)",
    description: "Shoots, editing, prints, licensing, and kit insurance.",
    icon: PROFESSION_ICONS["Photographer (Freelance)"] ?? DEFAULT_PROFESSION_ICON,
  },
  {
    id: "web-dev",
    title: "Web Developer",
    trade: "Web Developer (Freelance)",
    description: "Projects, hosting resale, software subs, and home office.",
    icon: PROFESSION_ICONS["Web Developer (Freelance)"] ?? DEFAULT_PROFESSION_ICON,
  },
  {
    id: "amazon",
    title: "Amazon Seller",
    trade: "Amazon Seller",
    description: "COGS, FBA fees, platform charges, and marketplace sales.",
    icon: PROFESSION_ICONS["Amazon Seller"] ?? DEFAULT_PROFESSION_ICON,
  },
  {
    id: "etsy",
    title: "Etsy Seller",
    trade: "Etsy Seller",
    description: "Handmade sales, postage, packaging, and listing fees.",
    icon: PROFESSION_ICONS["Etsy Seller"] ?? DEFAULT_PROFESSION_ICON,
  },
  {
    id: "landlord",
    title: "Landlord",
    trade: "Landlord (Rental Income)",
    description: "Rent, repairs, letting agents, and compliance certificates.",
    icon: PROFESSION_ICONS["Landlord (Rental Income)"] ?? DEFAULT_PROFESSION_ICON,
  },
  {
    id: "airbnb",
    title: "Airbnb Host",
    trade: "Airbnb Host",
    description: "Short-term lets, cleaning, platform fees, and utilities.",
    icon: PROFESSION_ICONS["Airbnb Host"] ?? DEFAULT_PROFESSION_ICON,
  },
  {
    id: "cleaner",
    title: "Cleaner",
    trade: "Cleaner (Domestic & Commercial)",
    description: "Supplies, travel, insurance, and contract cleaning income.",
    icon: PROFESSION_ICONS["Cleaner (Domestic & Commercial)"] ?? DEFAULT_PROFESSION_ICON,
  },
  {
    id: "influencer",
    title: "Influencer",
    trade: "Influencer",
    description: "Brand deals, affiliate income, content kit, and subscriptions.",
    icon: PROFESSION_ICONS.Influencer ?? DEFAULT_PROFESSION_ICON,
  },
  {
    id: "consultant",
    title: "Freelance Consultant",
    trade: "Freelance Consultant",
    description: "Day rates, retainers, PI insurance, and professional CPD.",
    icon: PROFESSION_ICONS["Freelance Consultant"] ?? DEFAULT_PROFESSION_ICON,
  },
  {
    id: "childminder",
    title: "Childminder",
    trade: "Childminder",
    description: "Fees, food, toys, DBS, and safeguarding for childcare.",
    icon: PROFESSION_ICONS.Childminder ?? DEFAULT_PROFESSION_ICON,
  },
];
