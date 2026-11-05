// Smaller copies of images, so phones download only the size they show (see src/lib/image-loader.ts).
// Work images: 640px (sm) and 400px (xs) copies; the full size stays for the lightbox.
// Film posters: a 480px (sm) copy for cards and phone screens.
// Run after adding images: node scripts/make-thumbs.mjs
import sharp from "sharp";
import { mkdirSync, readdirSync } from "node:fs";

const copies = [
  { dir: "public/work", out: "public/work/sm", width: 640, match: (n) => n.endsWith(".webp") },
  { dir: "public/work", out: "public/work/xs", width: 400, match: (n) => n.endsWith(".webp") },
  { dir: "public/films", out: "public/films/sm", width: 480, match: (n) => n.endsWith("-poster.webp") },
];

for (const { dir, out, width, match } of copies) {
  mkdirSync(out, { recursive: true });
  for (const f of readdirSync(dir).filter(match)) {
    await sharp(`${dir}/${f}`).resize({ width, withoutEnlargement: true }).webp({ quality: 74 }).toFile(`${out}/${f}`);
  }
}
console.log("thumbnails written");
