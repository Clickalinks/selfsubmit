import type { LucideIcon } from "lucide-react";

import { getProfessionForm } from "@/data/professionForms";
import { SELF_EMPLOYED_PROFESSIONS } from "@/data/selfEmployedProfessions";
import { DEFAULT_PROFESSION_ICON, getTemplateIcon, PROFESSION_ICONS } from "@/data/tradeIcons";

const GROUPS: { id: string; title: string; professions: readonly string[] }[] = [
  {
    id: "transport",
    title: "Transport & driving",
    professions: ["Taxi Driver", "Uber Driver", "Delivery Driver", "Courier / Van Driver", "HGV / Lorry Driver"],
  },
  {
    id: "automotive",
    title: "Automotive",
    professions: ["Mobile Mechanic", "Car Repair Garage"],
  },
  {
    id: "beauty",
    title: "Hair, beauty & wellbeing",
    professions: ["Barber", "Hairdresser", "Beautician", "Nail Technician", "Massage Therapist"],
  },
  {
    id: "trades",
    title: "Construction & trades",
    professions: [
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
      "Tradesperson (General)",
    ],
  },
  {
    id: "teaching",
    title: "Teaching, fitness & childcare",
    professions: [
      "Driving Instructor",
      "Private Tutor",
      "Personal Trainer",
      "Gym Coach",
      "Fitness Instructor",
      "Music Teacher",
      "Childminder",
    ],
  },
  {
    id: "creative",
    title: "Creative, tech & professional",
    professions: [
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
      "Freelancer (General)",
      "Small Sole Trader",
      "Side-hustle Business",
    ],
  },
  {
    id: "selling",
    title: "Online selling & content",
    professions: [
      "Amazon Seller",
      "Etsy Seller",
      "TikTok Shop Seller",
      "Market Trader",
      "Online Seller",
      "Freelance Content Creator",
      "Influencer",
    ],
  },
  {
    id: "property",
    title: "Property income",
    professions: ["Landlord (Rental Income)", "Airbnb Host", "Property Income Earner"],
  },
  {
    id: "services",
    title: "Cleaning & other services",
    professions: [
      "Domestic Cleaner",
      "Cleaner (Domestic & Commercial)",
      "Dog Walker / Pet Sitter",
      "Caterer / Personal Chef",
    ],
  },
];

export type SupportedBusinessGroup = {
  id: string;
  title: string;
  icon: LucideIcon;
  professions: { name: string; icon: LucideIcon }[];
};

export const SUPPORTED_BUSINESS_GROUPS: SupportedBusinessGroup[] = GROUPS.map((group) => {
  const first = group.professions.find((name) =>
    (SELF_EMPLOYED_PROFESSIONS as readonly string[]).includes(name),
  );
  const sampleForm = first ? getProfessionForm(first) : null;
  return {
    id: group.id,
    title: group.title,
    icon: getTemplateIcon(sampleForm?.id ?? group.id),
    professions: group.professions
      .filter((name) => (SELF_EMPLOYED_PROFESSIONS as readonly string[]).includes(name))
      .map((name) => ({
        name,
        icon: PROFESSION_ICONS[name] ?? DEFAULT_PROFESSION_ICON,
      })),
  };
});
