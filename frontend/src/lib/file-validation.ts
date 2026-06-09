/** File signature validation — defence in depth beyond MIME type. */

const BLOCKED_EXTENSIONS = new Set([
  ".exe",
  ".js",
  ".mjs",
  ".cjs",
  ".zip",
  ".dll",
  ".bat",
  ".cmd",
  ".msi",
  ".sh",
  ".php",
  ".html",
  ".htm",
  ".svg",
]);

export const UPLOAD_ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "text/csv",
  "application/csv",
]);

type SignatureRule = { mime: string; offset: number; bytes: number[] };

const SIGNATURES: SignatureRule[] = [
  { mime: "application/pdf", offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mime: "image/jpeg", offset: 0, bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47] },
];

function hasBytes(buffer: Buffer, offset: number, expected: number[]): boolean {
  if (buffer.length < offset + expected.length) return false;
  return expected.every((b, i) => buffer[offset + i] === b);
}

export function blockedUploadExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  for (const ext of BLOCKED_EXTENSIONS) {
    if (lower.endsWith(ext)) return true;
  }
  return false;
}

export function detectMimeFromSignature(buffer: Buffer): string | null {
  for (const rule of SIGNATURES) {
    if (hasBytes(buffer, rule.offset, rule.bytes)) return rule.mime;
  }
  // CSV: printable text with comma-separated first line
  const head = buffer.subarray(0, Math.min(buffer.length, 512)).toString("utf8");
  if (/^[\x20-\x7E\r\n\t",]+$/m.test(head) && head.includes(",")) {
    return "text/csv";
  }
  return null;
}

export function validateUploadFile(
  fileName: string,
  declaredMime: string,
  buffer: Buffer,
): { ok: true; mime: string } | { ok: false; error: string } {
  if (blockedUploadExtension(fileName)) {
    return { ok: false, error: "This file type is not allowed." };
  }

  const detected = detectMimeFromSignature(buffer);
  const mime = detected ?? declaredMime;

  if (!UPLOAD_ALLOWED_MIME.has(mime)) {
    return { ok: false, error: "Unsupported file type. Use PDF, JPG, PNG, or CSV." };
  }

  if (detected && declaredMime && detected !== declaredMime && !declaredMime.includes("csv")) {
    return { ok: false, error: "File content does not match its type." };
  }

  return { ok: true, mime };
}

export const UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
