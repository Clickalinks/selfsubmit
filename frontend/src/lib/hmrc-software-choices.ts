/**
 * SelfSubmit uses the official HMRC “MTD ready — Recognised by HMRC” mark (F2N4QK).
 * Never say approved, certified, or Kitemarked. The permitted term is “Recognised by HMRC”.
 * https://www.gov.uk/guidance/find-software-thats-compatible-with-making-tax-digital-for-income-tax
 */
export const HMRC_SOFTWARE_CHOICES_LISTED = true;

/** Exact term HMRC permits once the product is on Software Choices. */
export const HMRC_RECOGNISED_TERM = "Recognised by HMRC";

/** Public guide slug. Old /mtd/hmrc-approved-software redirects here. */
export const MTD_SOFTWARE_GUIDE_SLUG = "mtd-compatible-software";

export function mtdSoftwareGuideTitle(): string {
  return HMRC_SOFTWARE_CHOICES_LISTED ? HMRC_RECOGNISED_TERM : "MTD compatible software";
}

export function selfSubmitHmrcRecognitionCopy(): string {
  if (HMRC_SOFTWARE_CHOICES_LISTED) {
    return `SelfSubmit is ${HMRC_RECOGNISED_TERM} and appears on HMRC’s Software Choices list. It is not described as HMRC approved, certified or Kitemarked.`;
  }
  return "SelfSubmit is not described as HMRC recognised, approved or certified. We will use “Recognised by HMRC” only after the product is on the GOV.UK Software Choices list.";
}
