import { mkdir, readdir, readFile, rm, unlink, writeFile } from "fs/promises";
import path from "path";
import { del, get, getDownloadUrl, list, put } from "@vercel/blob";

import { UPLOAD_ALLOWED_MIME, UPLOAD_MAX_BYTES } from "@/lib/file-validation";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads", "receipts");
const BLOB_TOKEN = () => process.env.BLOB_READ_WRITE_TOKEN?.trim();

export const RECEIPT_MAX_BYTES = UPLOAD_MAX_BYTES;
export const RECEIPT_ALLOWED_MIME = UPLOAD_ALLOWED_MIME;

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "application/pdf": ".pdf",
  "text/csv": ".csv",
  "application/csv": ".csv",
};

export function isBlobStorageConfigured(): boolean {
  return Boolean(BLOB_TOKEN());
}

export function receiptBlobPath(userId: string, storageKey: string): string {
  return `receipts/${userId}/${storageKey}`;
}

export function receiptUploadDir(userId: string): string {
  return path.join(UPLOAD_ROOT, userId);
}

/** Local dev filesystem path (not used in production when Blob is configured). */
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
  mimeType?: string,
): Promise<void> {
  if (isBlobStorageConfigured()) {
    await put(receiptBlobPath(userId, storageKey), buffer, {
      access: "private",
      contentType: mimeType,
      token: BLOB_TOKEN(),
    });
    return;
  }

  const dir = receiptUploadDir(userId);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, storageKey), buffer);
}

export async function deleteReceiptFile(userId: string, storageKey: string): Promise<void> {
  if (isBlobStorageConfigured()) {
    const pathname = receiptBlobPath(userId, storageKey);
    const { blobs } = await list({ prefix: pathname, limit: 1, token: BLOB_TOKEN() });
    if (blobs[0]) {
      await del(blobs[0].url, { token: BLOB_TOKEN() });
    }
    return;
  }

  try {
    await unlink(receiptFilePath(userId, storageKey));
  } catch {
    // File may already be missing
  }
}

export async function deleteAllReceiptFiles(userId: string): Promise<void> {
  if (isBlobStorageConfigured()) {
    const prefix = `receipts/${userId}/`;
    let cursor: string | undefined;
    do {
      const result = await list({ prefix, cursor, limit: 1000, token: BLOB_TOKEN() });
      if (result.blobs.length > 0) {
        await del(
          result.blobs.map((b) => b.url),
          { token: BLOB_TOKEN() },
        );
      }
      cursor = result.hasMore ? result.cursor : undefined;
    } while (cursor);
    return;
  }

  const dir = receiptUploadDir(userId);
  try {
    await readdir(dir);
    await rm(dir, { recursive: true, force: true });
  } catch {
    // Directory may not exist
  }
}

/** Signed download URL for private Blob objects; null when using local disk. */
export async function getReceiptDownloadUrl(userId: string, storageKey: string): Promise<string | null> {
  if (!isBlobStorageConfigured()) return null;

  const pathname = receiptBlobPath(userId, storageKey);
  const { blobs } = await list({ prefix: pathname, limit: 1, token: BLOB_TOKEN() });
  if (!blobs[0]) return null;

  return getDownloadUrl(blobs[0].url);
}

export async function readReceiptFileBuffer(userId: string, storageKey: string): Promise<Buffer | null> {
  if (isBlobStorageConfigured()) {
    const result = await get(receiptBlobPath(userId, storageKey), {
      access: "private",
      token: BLOB_TOKEN(),
    });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const data = await new Response(result.stream).arrayBuffer();
    return Buffer.from(data);
  }

  try {
    return await readFile(receiptFilePath(userId, storageKey));
  } catch {
    return null;
  }
}
