import { mkdir, readdir, rm, unlink, writeFile } from "fs/promises";
import path from "path";

import { UPLOAD_ALLOWED_MIME, UPLOAD_MAX_BYTES } from "@/lib/file-validation";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads", "receipts");

export const RECEIPT_MAX_BYTES = UPLOAD_MAX_BYTES;
export const RECEIPT_ALLOWED_MIME = UPLOAD_ALLOWED_MIME;

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "application/pdf": ".pdf",
  "text/csv": ".csv",
  "application/csv": ".csv",
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

export async function deleteAllReceiptFiles(userId: string): Promise<void> {
  const dir = receiptUploadDir(userId);
  try {
    await readdir(dir);
    await rm(dir, { recursive: true, force: true });
  } catch {
    // Directory may not exist
  }
}
