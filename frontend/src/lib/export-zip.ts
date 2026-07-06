import type { Archiver } from "archiver";
import * as archiverImport from "archiver";

function createZipArchive(): Archiver {
  const mod = archiverImport as typeof archiverImport & {
    default?: (format: string, options?: object) => Archiver;
    ZipArchive?: new (options?: object) => Archiver;
  };

  if (typeof mod.default === "function") {
    return mod.default("zip", { zlib: { level: 6 } });
  }

  if (mod.ZipArchive) {
    return new mod.ZipArchive({ zlib: { level: 6 } });
  }

  const create = (mod as { create?: (format: string, options?: object) => Archiver }).create;
  if (typeof create === "function") {
    return create("zip", { zlib: { level: 6 } });
  }

  throw new Error("archiver zip format is unavailable");
}

/** Build a ZIP archive in memory — reliable on Vercel serverless (no streaming race). */
export async function buildZipBuffer(
  append: (archive: Archiver) => void | Promise<void>,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const archive = createZipArchive();

    archive.on("data", (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    archive.on("error", reject);
    archive.on("end", () => resolve(Buffer.concat(chunks)));

    void (async () => {
      try {
        await append(archive);
        await archive.finalize();
      } catch (err) {
        reject(err);
      }
    })();
  });
}
