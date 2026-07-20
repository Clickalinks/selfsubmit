/**
 * Convert a markdown funding document to HTML + PDF.
 * Usage: node docs/funding/generate-funding-pdf.mjs <basename>
 * Example: node docs/funding/generate-funding-pdf.mjs business-plan
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const base = process.argv[2];
if (!base) {
  console.error("Usage: node generate-funding-pdf.mjs <basename>");
  process.exit(1);
}

const mdPath = join(__dirname, `${base}.md`);
const htmlPath = join(__dirname, `${base}.html`);
const pdfPath = join(__dirname, `${base}.pdf`);

const md = readFileSync(mdPath, "utf8");

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function resolveImageSrc(src) {
  if (/^https?:\/\//i.test(src) || src.startsWith("data:")) return src;
  const abs = resolve(__dirname, src);
  return pathToFileURL(abs).href;
}

function inlineFormat(text) {
  let t = escapeHtml(text);
  t = t.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_, alt, src) =>
      `<img src="${resolveImageSrc(src)}" alt="${escapeHtml(alt)}" style="max-height:48px;width:auto;margin:8px 0;" />`,
  );
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
  t = t.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  return t;
}

function mdToHtml(src) {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let i = 0;
  let inCode = false;
  let codeLang = "";
  let codeBuf = [];
  let inTable = false;
  let tableRows = [];
  let listType = null;

  function flushList() {
    if (!listType) return;
    out.push(listType === "ul" ? "</ul>" : "</ol>");
    listType = null;
  }

  function flushTable() {
    if (!inTable) return;
    out.push('<table>');
    tableRows.forEach((row, idx) => {
      const cells = row.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
      if (idx === 1 && cells.every((c) => /^:?-+:?$/.test(c))) return;
      const tag = idx === 0 ? "th" : "td";
      out.push("<tr>");
      for (const c of cells) out.push(`<${tag}>${inlineFormat(c)}</${tag}>`);
      out.push("</tr>");
    });
    out.push("</table>");
    inTable = false;
    tableRows = [];
  }

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      flushList();
      flushTable();
      if (!inCode) {
        inCode = true;
        codeLang = line.slice(3).trim();
        codeBuf = [];
      } else {
        out.push(`<pre><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
        inCode = false;
      }
      i++;
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      i++;
      continue;
    }
    if (line.trim().startsWith("|")) {
      flushList();
      if (!inTable) inTable = true;
      tableRows.push(line);
      i++;
      continue;
    }
    if (inTable) flushTable();
    if (/^---+$/.test(line.trim())) {
      flushList();
      out.push("<hr />");
      i++;
      continue;
    }
    const h = line.match(/^(#{1,6})\s+(.+)$/);
    if (h) {
      flushList();
      const level = h[1].length;
      out.push(`<h${level}>${inlineFormat(h[2])}</h${level}>`);
      i++;
      continue;
    }
    const ul = line.match(/^[-*]\s+(.+)$/);
    if (ul) {
      if (listType !== "ul") {
        flushList();
        listType = "ul";
        out.push("<ul>");
      }
      out.push(`<li>${inlineFormat(ul[1])}</li>`);
      i++;
      continue;
    }
    const ol = line.match(/^\d+\.\s+(.+)$/);
    if (ol) {
      if (listType !== "ol") {
        flushList();
        listType = "ol";
        out.push("<ol>");
      }
      out.push(`<li>${inlineFormat(ol[1])}</li>`);
      i++;
      continue;
    }
    flushList();
    if (line.trim() === "") {
      i++;
      continue;
    }
    out.push(`<p>${inlineFormat(line)}</p>`);
    i++;
  }
  flushList();
  flushTable();
  return out.join("\n");
}

const body = mdToHtml(md);
const html = `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(base)}</title>
<style>
  @page { margin: 14mm 12mm; }
  body { font-family: "Segoe UI", Calibri, Arial, sans-serif; font-size: 10pt; line-height: 1.4; color: #1a1a1a; max-width: 920px; margin: 0 auto; padding: 20px; }
  h1 { font-size: 18pt; margin: 0 0 10px; color: #0f3d2e; }
  h2 { font-size: 13pt; margin: 22px 0 8px; color: #0f3d2e; border-bottom: 2px solid #1a7a4c; padding-bottom: 3px; page-break-after: avoid; }
  h3 { font-size: 11pt; margin: 14px 0 6px; color: #145c3a; page-break-after: avoid; }
  p { margin: 0 0 7px; }
  table { border-collapse: collapse; width: 100%; margin: 8px 0 12px; font-size: 8.5pt; page-break-inside: avoid; }
  th, td { border: 1px solid #ccc; padding: 4px 6px; text-align: left; vertical-align: top; }
  th { background: #e8f5ee; font-weight: 600; }
  tr:nth-child(even) td { background: #fafafa; }
  code { font-family: Consolas, monospace; font-size: 8.5pt; background: #f0f0f0; padding: 1px 3px; }
  pre { background: #f5f5f5; border: 1px solid #ddd; padding: 8px; font-size: 8pt; page-break-inside: avoid; }
  hr { border: none; border-top: 1px solid #ccc; margin: 18px 0; }
  ul, ol { margin: 4px 0 10px; padding-left: 20px; }
  li { margin: 2px 0; }
  .footer { margin-top: 24px; font-size: 8.5pt; color: #666; }
  .warn { background: #fff8e1; border-left: 4px solid #f9a825; padding: 8px 10px; margin: 10px 0; }
</style>
</head>
<body>
${body}
<p class="footer">Clicado Media UK Ltd t/a SelfSubmit · Company no. 16904433 · Generated ${new Date().toISOString().slice(0, 10)}</p>
</body>
</html>`;

writeFileSync(htmlPath, html, "utf8");
console.log("Wrote", htmlPath);

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

const chrome = chromeCandidates.find((p) => existsSync(p));
if (!chrome) {
  console.error("Chrome/Edge not found. Open HTML and Print to PDF:", htmlPath);
  process.exit(2);
}

const fileUrl = "file:///" + htmlPath.replace(/\\/g, "/");
const result = spawnSync(
  chrome,
  ["--headless=new", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${pdfPath}`, fileUrl],
  { encoding: "utf8", timeout: 90000 },
);

if (result.status !== 0 || !existsSync(pdfPath)) {
  console.error(result.stderr || result.stdout || "PDF failed");
  process.exit(1);
}
console.log("Wrote", pdfPath);
