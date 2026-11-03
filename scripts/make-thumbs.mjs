// Small 640px copies of the work images, for grids and card previews (full size stays for the lightbox).
import sharp from "sharp";
import { readdirSync } from "node:fs";

for (const f of readdirSync("public/work").filter((n) => n.endsWith(".webp"))) {
  await sharp(`public/work/${f}`).resize({ width: 640, withoutEnlargement: true }).webp({ quality: 74 }).toFile(`public/work/sm/${f}`);
}
