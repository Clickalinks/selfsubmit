import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const path = join(root, "src/data/mtdCategoryContent.ts");
const STEP =
  "https://www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-businesses-step-by-step";

let s = readFileSync(path, "utf8");
const before = (s.match(/https:\/\/www\.gov\.uk\/guidance\/making-tax-digital-for-income-tax/g) || []).length;
s = s.replace(
  /https:\/\/www\.gov\.uk\/guidance\/making-tax-digital-for-income-tax(?:\/[A-Za-z0-9\-]+)*/g,
  STEP,
);
writeFileSync(path, s);
const after = (s.match(new RegExp(STEP.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
console.log(`Replaced ${before} old MTD guidance URLs; hub URL now appears ${after} times.`);
