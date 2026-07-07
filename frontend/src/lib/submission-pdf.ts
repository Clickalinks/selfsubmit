import PDFDocument from "pdfkit";

import type { SubmissionExport } from "@/lib/account-export-format";

type PdfDoc = InstanceType<typeof PDFDocument>;

const BRAND_GREEN = "#0f6b3f";
const BRAND_MINT = "#e8f5ee";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6b7280";
const BORDER = "#e5e7eb";

function formatUkDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatMoney(n: number): string {
  return `£${n.toFixed(2)}`;
}

function formatAmount(amount: string): string {
  if (!amount || amount === "0" || amount === "0.00") return "—";
  return amount.startsWith("£") ? amount : `£${amount}`;
}

function activeLines(items: SubmissionExport["income"]) {
  return items.filter((item) => item.amount && item.amount !== "0.00" && item.amount !== "0");
}

function ensureSpace(doc: PdfDoc, height: number) {
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (doc.y + height > bottom) {
    doc.addPage();
  }
}

function drawLineTable(doc: PdfDoc, title: string, items: SubmissionExport["income"]) {
  const lines = activeLines(items);
  ensureSpace(doc, 56);

  doc.font("Helvetica-Bold").fontSize(12).fillColor(TEXT_DARK).text(title, doc.page.margins.left, doc.y);
  doc.moveDown(0.6);

  const tableTop = doc.y;
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const amountWidth = 72;
  const labelWidth = right - left - amountWidth;

  doc.rect(left, tableTop, right - left, 22).fill(BRAND_MINT);
  doc.font("Helvetica-Bold").fontSize(9).fillColor(TEXT_MUTED);
  doc.text("LINE ITEM", left + 10, tableTop + 7, { width: labelWidth });
  doc.text("AMOUNT", left + labelWidth, tableTop + 7, { width: amountWidth - 10, align: "right" });

  let rowY = tableTop + 22;
  if (lines.length === 0) {
    doc.font("Helvetica").fontSize(10).fillColor(TEXT_MUTED);
    doc.text("No lines recorded.", left + 10, rowY + 8);
    doc.y = rowY + 30;
    return;
  }

  for (const [index, item] of lines.entries()) {
    doc.font("Helvetica").fontSize(10);
    const labelHeight = doc.heightOfString(item.label, { width: labelWidth - 20 });
    const rowHeight = Math.max(28, labelHeight + 14);

    if (rowY + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      rowY = doc.page.margins.top;
    }

    if (index % 2 === 1) {
      doc.rect(left, rowY, right - left, rowHeight).fill("#f9fafb");
    }

    doc.font("Helvetica").fontSize(10).fillColor(TEXT_DARK);
    doc.text(item.label, left + 10, rowY + 8, { width: labelWidth - 20 });
    doc.font("Helvetica-Bold").text(formatAmount(item.amount), left + labelWidth, rowY + 8, {
      width: amountWidth - 10,
      align: "right",
    });

    doc
      .strokeColor(BORDER)
      .moveTo(left, rowY + rowHeight)
      .lineTo(right, rowY + rowHeight)
      .stroke();

    rowY += rowHeight;
  }

  doc.y = rowY + 12;
}

function drawSummaryCard(
  doc: PdfDoc,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string,
  accent: boolean,
) {
  const height = 58;
  doc.roundedRect(x, y, width, height, 8).lineWidth(1).strokeColor(accent ? "#86efac" : BORDER);
  if (accent) {
    doc.fillAndStroke(BRAND_MINT, "#86efac");
  } else {
    doc.fillAndStroke("#ffffff", BORDER);
  }

  doc.font("Helvetica-Bold").fontSize(8).fillColor(TEXT_MUTED).text(label.toUpperCase(), x + 12, y + 12, {
    width: width - 24,
  });
  doc.font("Helvetica-Bold").fontSize(16).fillColor(accent ? BRAND_GREEN : TEXT_DARK).text(value, x + 12, y + 28, {
    width: width - 24,
  });
}

/** Server-side PDF for a filed monthly return (account export ZIP). */
export function buildSubmissionPdfBuffer(submission: SubmissionExport): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - doc.page.margins.left - doc.page.margins.right;

    doc.rect(0, 0, pageWidth, 88).fill(BRAND_GREEN);
    doc.font("Helvetica-Bold").fontSize(22).fillColor("#ffffff").text("SelfSubmit", 48, 28);
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#d1fae5").text("MONTHLY RETURN", 48, 56);

    doc.y = 108;
    doc.font("Helvetica-Bold").fontSize(20).fillColor(TEXT_DARK).text(submission.trade);
    doc.moveDown(0.35);
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(TEXT_MUTED)
      .text(
        `Period ${formatUkDate(submission.periodFrom)} – ${formatUkDate(submission.periodTo)} · Submitted ${new Date(
          submission.submittedAt,
        ).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`,
      );

    if (submission.hmrcReference) {
      doc.moveDown(0.5);
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(BRAND_GREEN)
        .text(`${(submission.hmrcStatus ?? "sent").toUpperCase()} · ${submission.hmrcReference}`);
    }

    doc.moveDown(1.2);
    const cardY = doc.y;
    const gap = 12;
    const cardWidth = (contentWidth - gap * 2) / 3;
    drawSummaryCard(
      doc,
      doc.page.margins.left,
      cardY,
      cardWidth,
      "Total income",
      formatMoney(submission.totalIncomeGbp),
      false,
    );
    drawSummaryCard(
      doc,
      doc.page.margins.left + cardWidth + gap,
      cardY,
      cardWidth,
      "Total expenses",
      formatMoney(submission.totalExpensesGbp),
      false,
    );
    drawSummaryCard(
      doc,
      doc.page.margins.left + (cardWidth + gap) * 2,
      cardY,
      cardWidth,
      "Net profit",
      formatMoney(submission.netProfitGbp),
      true,
    );

    doc.y = cardY + 72;
    drawLineTable(doc, "Income", submission.income);
    drawLineTable(doc, "Expenses", submission.expenses);

    ensureSpace(doc, 40);
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(TEXT_MUTED)
      .text(
        `Generated by SelfSubmit on ${new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}. This document is a copy of your filed return for your records.`,
        doc.page.margins.left,
        doc.y,
        { align: "center", width: contentWidth },
      );

    doc.end();
  });
}
