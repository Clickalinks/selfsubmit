import archiver from "archiver";

/** Build a ZIP archive in memory — reliable on Vercel serverless (no streaming race). */
export async function buildZipBuffer(
  append: (archive: archiver.Archiver) => void | Promise<void>,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const archive = archiver("zip", { zlib: { level: 6 } });

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
