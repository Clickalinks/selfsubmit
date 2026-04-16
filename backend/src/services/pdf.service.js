const PDFDocument = require('pdfkit');
const { getStorage } = require('../config/firebase');

/**
 * Builds a simple A4 PDF summarising a submission (MVP layout).
 */
function buildSubmissionPdfBuffer(submission) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('SelfSubmit — Monthly submission', { underline: true });
    doc.moveDown();
    doc.fontSize(11);
    doc.text(`Business type: ${submission.businessType}`);
    doc.text(`Month: ${submission.month}`);
    doc.text(`Status: ${submission.status}`);
    doc.text(`Reference: ${submission.id}`);
    doc.moveDown();

    doc.fontSize(14).text('Totals', { underline: true });
    doc.fontSize(11);
    doc.text(`Income: £${submission.totals.income.toFixed(2)}`);
    doc.text(`Expenses: £${submission.totals.expenses.toFixed(2)}`);
    doc.text(`Profit: £${submission.totals.profit.toFixed(2)}`);
    doc.moveDown();

    doc.fontSize(14).text('Income (detail)', { underline: true });
    doc.fontSize(10);
    Object.entries(submission.income || {}).forEach(([k, v]) => {
      doc.text(`${k}: £${Number(v).toFixed(2)}`);
    });
    doc.moveDown();

    doc.fontSize(14).text('Expenses (detail)', { underline: true });
    doc.fontSize(10);
    Object.entries(submission.expenses || {}).forEach(([k, v]) => {
      doc.text(`${k}: £${Number(v).toFixed(2)}`);
    });

    doc.moveDown(2);
    doc.fontSize(9).fillColor('#666666');
    doc.text(
      'This PDF is generated for your records and your accountant. It is not an HMRC filing.',
      { align: 'left' },
    );

    doc.end();
  });
}

/**
 * Uploads PDF to Firebase Storage. Returns storage path (canonical record).
 * Signed download URLs are minted on read (see getSignedPdfUrl).
 */
async function uploadSubmissionPdf(uid, submissionId, buffer) {
  const bucket = getStorage().bucket();
  const path = `users/${uid}/submissions/${submissionId}.pdf`;
  const file = bucket.file(path);

  await file.save(buffer, {
    contentType: 'application/pdf',
    resumable: false,
    metadata: {
      cacheControl: 'private, max-age=0',
    },
  });

  return { path };
}

/**
 * Short-lived signed URL for client download (default 60 minutes).
 */
async function getSignedPdfUrl(storagePath, expiresMinutes = 60) {
  const bucket = getStorage().bucket();
  const file = bucket.file(storagePath);
  const expires = Date.now() + expiresMinutes * 60 * 1000;
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires,
  });
  return url;
}

module.exports = {
  buildSubmissionPdfBuffer,
  uploadSubmissionPdf,
  getSignedPdfUrl,
};
