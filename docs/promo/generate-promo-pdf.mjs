/**
 * Print promo HTML to PDF via Chrome/Edge headless.
 * Usage: node docs/promo/generate-promo-pdf.mjs [basename]
 * Default: all known promo sheets.
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaults = ["leaflet-a5-taxi", "card-a6-taxi"];
const targets = process.argv[2] ? [process.argv[2]] : defaults;

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

const chrome = chromeCandidates.find((p) => existsSync(p));
if (!chrome) {
  console.error("Chrome/Edge not found.");
  process.exit(2);
}

for (const base of targets) {
  const htmlPath = join(__dirname, `${base}.html`);
  const pdfPath = join(__dirname, `${base}.pdf`);
  if (!existsSync(htmlPath)) {
    console.error("Missing", htmlPath);
    process.exit(1);
  }
  const fileUrl = "file:///" + htmlPath.replace(/\\/g, "/");
  const result = spawnSync(
    chrome,
    ["--headless=new", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${pdfPath}`, fileUrl],
    { encoding: "utf8", timeout: 90000 },
  );
  if (result.status !== 0 || !existsSync(pdfPath)) {
    console.error(result.stderr || result.stdout || "PDF failed", base);
    process.exit(1);
  }
  console.log("Wrote", pdfPath);
}
