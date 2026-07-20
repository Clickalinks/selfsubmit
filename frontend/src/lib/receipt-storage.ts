import { mkdir, readdir, readFile, rm, unlink, writeFile } from "fs/promises";
import path from "path";
import { del, get, head, list, put } from "@vercel/blob";

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

function blobToken(): string | undefined {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || undefined;
}

/** True when receipt files should use Vercel Blob (never local disk on Vercel). */
export function isBlobStorageConfigured(): boolean {
  if (blobToken()) return true;
  // Linked Blob stores on Vercel can authenticate via OIDC at runtime.
  if (process.env.VERCEL === "1") {
    return Boolean(process.env.BLOB_STORE_ID?.trim() || process.env.VERCEL_OIDC_TOKEN?.trim());
  }
  return false;
}

function blobOptions() {
  const token = blobToken();
  return token ? { token } : {};
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

export class ReceiptStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReceiptStorageError";
  }
}

export async function saveReceiptFile(
  userId: string,
  storageKey: string,
  buffer: Buffer,
  mimeType?: string,
): Promise<void> {
  if (isBlobStorageConfigured()) {
    try {
      await put(receiptBlobPath(userId, storageKey), buffer, {
        access: "private",
        contentType: mimeType,
        ...blobOptions(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Blob upload failed.";
      throw new ReceiptStorageError(message);
    }
    return;
  }

  if (process.env.VERCEL === "1") {
    throw new ReceiptStorageError(
      "Receipt storage is not configured. Connect cloud file storage to this project.",
    );
  }

  const dir = receiptUploadDir(userId);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, storageKey), buffer);
}

export async function deleteReceiptFile(userId: string, storageKey: string): Promise<void> {
  if (isBlobStorageConfigured()) {
    const pathname = receiptBlobPath(userId, storageKey);
    try {
      await del(pathname, blobOptions());
    } catch {
      // File may already be missing
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
      const result = await list({ prefix, cursor, limit: 1000, ...blobOptions() });
      if (result.blobs.length > 0) {
        await del(
          result.blobs.map((b) => b.url),
          blobOptions(),
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

  try {
    const metadata = await head(receiptBlobPath(userId, storageKey), blobOptions());
    return metadata.downloadUrl || metadata.url;
  } catch {
    return null;
  }
}

export async function readReceiptFileBuffer(userId: string, storageKey: string): Promise<Buffer | null> {
  if (isBlobStorageConfigured()) {
    try {
      const result = await get(receiptBlobPath(userId, storageKey), {
        access: "private",
        ...blobOptions(),
      });
      if (!result || result.statusCode !== 200 || !result.stream) return null;
      const data = await new Response(result.stream).arrayBuffer();
      return Buffer.from(data);
    } catch {
      return null;
    }
  }

  try {
    return await readFile(receiptFilePath(userId, storageKey));
  } catch {
    return null;
  }
}
