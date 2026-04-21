import type { StickerCardTone } from "@/data/stickerCardTheme";
import { stickerToneFromString } from "@/data/stickerCardTheme";

export const TEMPLATE_STICKER_TONE: Record<string, StickerCardTone> = {
  transport_driving: "sky",
  personal_services: "mint",
  trades: "cream",
  teaching_training: "mint",
  freelancers: "sky",
};

export function getTemplateStickerTone(templateId: string): StickerCardTone {
  return TEMPLATE_STICKER_TONE[templateId] ?? stickerToneFromString(templateId);
}

/**
 * Pastel “tile” tone per profession — aligned with the illustrated category style
 * (cream / sky / mint rotation, with sensible matches to the reference art).
 */
export const PROFESSION_STICKER_TONE: Record<string, StickerCardTone> = {
  "Taxi Driver": "cream",
  "Private Hire Driver (Uber/Bolt)": "cream",
  "Delivery Driver (Amazon, Uber Eats)": "sky",
  "Courier / Van Driver": "mint",
  Barber: "sky",
  Hairdresser: "sky",
  "Beautician (nails, lashes, etc.)": "mint",
  "Massage Therapist": "mint",
  Electrician: "cream",
  Plumber: "sky",
  Carpenter: "mint",
  "Painter & Decorator": "sky",
  Handyman: "cream",
  "Driving Instructor": "mint",
  "Tutor (academic or private)": "sky",
  "Personal Trainer": "mint",
  "Graphic Designer": "cream",
  "Web Developer": "sky",
  "Social Media Manager": "mint",
  "Photographer / Videographer": "sky",
};

export function getProfessionStickerTone(profession: string): StickerCardTone {
  const key = profession.trim();
  return PROFESSION_STICKER_TONE[key] ?? stickerToneFromString(key);
}
