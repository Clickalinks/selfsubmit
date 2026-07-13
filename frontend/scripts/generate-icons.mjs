import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "public", "brand", "selfsubmit-logo.png");
const publicDir = path.join(root, "public");

const sizes = [
  { name: "favicon-32.png", size: 32 },
  { name: "favicon-48.png", size: 48 },
  { name: "favicon.png", size: 32 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
];

await mkdir(publicDir, { recursive: true });

for (const { name, size } of sizes) {
  await sharp(source)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, name));
  console.log(`Wrote public/${name} (${size}x${size})`);
}

await sharp(source)
  .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(root, "src", "app", "icon.png"));
console.log("Updated src/app/icon.png (512x512)");

await sharp(source)
  .resize(180, 180, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(root, "src", "app", "apple-icon.png"));
console.log("Updated src/app/apple-icon.png (180x180)");
