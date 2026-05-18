import { mkdir, readdir, rm, unlink, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads", "receipts");

export const RECEIPT_MAX_BYTES = 10 * 1024 * 1024;

export const RECEIPT_ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/heic": ".heic",
  "image/heif": ".heif",
  "application/pdf": ".pdf",
};

export function receiptUploadDir(userId: string): string {
  return path.join(UPLOAD_ROOT, userId);
}

export function receiptFilePath(userId: string, storageKey: string): string {
  return path.join(receiptUploadDir(userId), storageKey);
}

export function extensionForMime(mimeType: string): string {
  return EXT_BY_MIME[mimeType] ?? ".bin";
}

export async function saveReceiptFile(
  userId: string,
  storageKey: string,
  buffer: Buffer,
): Promise<string> {
  const dir = receiptUploadDir(userId);
  await mkdir(dir, { recursive: true });
  const fullPath = path.join(dir, storageKey);
  await writeFile(fullPath, buffer);
  return fullPath;
}

export async function deleteReceiptFile(userId: string, storageKey: string): Promise<void> {
  try {
    await unlink(receiptFilePath(userId, storageKey));
  } catch {
    // File may already be missing
  }
}

/** Remove all receipt files for a user (e.g. on account deletion). */
export async function deleteAllReceiptFiles(userId: string): Promise<void> {
  const dir = receiptUploadDir(userId);
  try {
    await readdir(dir);
    await rm(dir, { recursive: true, force: true });
  } catch {
    // Directory may not exist
  }
}
