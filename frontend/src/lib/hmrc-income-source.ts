import { professionHasTag } from "@/data/professionTags";

export type HmrcIncomeSource = "self-employment" | "uk-property";

export function isUkPropertyProfession(category: string): boolean {
  return professionHasTag(category, "landlord") || professionHasTag(category, "short_term_let");
}

export function expectedHmrcTypeOfBusiness(category: string): HmrcIncomeSource {
  return isUkPropertyProfession(category) ? "uk-property" : "self-employment";
}

export function isHmrcUkPropertyType(typeOfBusiness: string | null | undefined): boolean {
  const t = (typeOfBusiness ?? "").trim().toLowerCase();
  return t === "uk-property" || t === "uk property";
}

export function isHmrcSelfEmploymentType(typeOfBusiness: string | null | undefined): boolean {
  return (typeOfBusiness ?? "").trim().toLowerCase() === "self-employment";
}

export function isHmrcForeignPropertyType(typeOfBusiness: string | null | undefined): boolean {
  const t = (typeOfBusiness ?? "").trim().toLowerCase();
  return t === "foreign-property" || t === "foreign property";
}

export function formatHmrcTypeOfBusiness(typeOfBusiness: string | null | undefined): string {
  const t = (typeOfBusiness ?? "").trim();
  if (!t) return "Unknown";
  return t.replace(/-/g, " ");
}

export function resolveHmrcIncomeSource(input: {
  category: string;
  hmrcTypeOfBusiness?: string | null;
}): HmrcIncomeSource {
  if (isHmrcForeignPropertyType(input.hmrcTypeOfBusiness)) {
    throw new Error("Foreign property HMRC filing is not available yet.");
  }
  if (isHmrcUkPropertyType(input.hmrcTypeOfBusiness)) return "uk-property";
  if (isHmrcSelfEmploymentType(input.hmrcTypeOfBusiness)) return "self-employment";
  return expectedHmrcTypeOfBusiness(input.category);
}

export function assertHmrcLinkCompatible(category: string, typeOfBusiness: string | null | undefined): void {
  if (!typeOfBusiness?.trim()) return;
  if (isHmrcForeignPropertyType(typeOfBusiness)) {
    throw new Error("Foreign property HMRC filing is not available yet.");
  }
  const expected = expectedHmrcTypeOfBusiness(category);
  if (isHmrcUkPropertyType(typeOfBusiness) && expected !== "uk-property") {
    throw new Error("Link a self-employment HMRC income source to this business, not UK property.");
  }
  if (isHmrcSelfEmploymentType(typeOfBusiness) && expected !== "self-employment") {
    throw new Error("Link a UK property HMRC income source to this landlord business, not self-employment.");
  }
}

export function hmrcIncomeSourceLabel(source: HmrcIncomeSource): string {
  return source === "uk-property" ? "UK property" : "Self-employment";
}
