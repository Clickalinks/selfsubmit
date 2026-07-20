import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const path = join(dirname(fileURLToPath(import.meta.url)), "../src/data/mtdCategoryContent.ts");
let s = readFileSync(path, "utf8");

const STEP =
  "https://www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-businesses-step-by-step";
const ELIG =
  "https://www.gov.uk/guidance/find-out-if-and-when-you-need-to-use-making-tax-digital-for-income-tax";
const SOFT =
  "https://www.gov.uk/guidance/choose-the-right-software-for-making-tax-digital-for-income-tax";

// Fix remaining wrong collection URL without -for-businesses-step-by-step
s = s.replace(
  /https:\/\/www\.gov\.uk\/government\/collections\/making-tax-digital-for-income-tax(?!-for-businesses)/g,
  STEP,
);

// Fix software finder if old path
s = s.replace(
  "https://www.gov.uk/guidance/find-software-thats-compatible-with-making-tax-digital-for-income-tax",
  SOFT,
);

// Collapse duplicate hub links in first entry to overview + eligibility
s = s.replace(
  `hmrcLinks: [
      { label: "Overview — MTD for Income Tax", url: "${STEP}" },
      { label: "Who must follow the rules", url: "${STEP}" },
    ]`,
  `hmrcLinks: [
      { label: "GOV.UK — Making Tax Digital for Income Tax", url: "${STEP}" },
      { label: "Check if and when you need to use MTD", url: "${ELIG}" },
    ]`,
);

// Replace any remaining label pairs that both point to STEP with a single link
s = s.replace(
  /hmrcLinks: \[\s*\{ label: "[^"]+", url: "https:\/\/www\.gov\.uk\/government\/collections\/making-tax-digital-for-income-tax-for-businesses-step-by-step" \},\s*\{ label: "[^"]+", url: "https:\/\/www\.gov\.uk\/government\/collections\/making-tax-digital-for-income-tax-for-businesses-step-by-step" \},\s*\]/g,
  `hmrcLinks: [
      { label: "GOV.UK — Making Tax Digital for Income Tax", url: "${STEP}" },
    ]`,
);

// Single-link STEP entries: normalize label
s = s.replace(
  /\{ label: "[^"]+", url: "https:\/\/www\.gov\.uk\/government\/collections\/making-tax-digital-for-income-tax-for-businesses-step-by-step" \}/g,
  `{ label: "GOV.UK — Making Tax Digital for Income Tax", url: "${STEP}" }`,
);

writeFileSync(path, s);
console.log("Deduped / normalized hmrcLinks");
