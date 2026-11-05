// Builds public/og.png, the link preview for WhatsApp, Facebook and X shares.
// The site has one URL per page for both languages, and share previews only read the
// static HTML, so the image carries French and English side by side.
// Run: node scripts/make-og.mjs   (needs Playwright with Chromium)

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

// require() so a globally installed Playwright works too (NODE_PATH="$(npm root -g)").
const { chromium } = createRequire(import.meta.url)("playwright");

const root = new URL("..", import.meta.url);
const font = readFileSync(new URL("node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf", root)).toString("base64");

const html = `<!doctype html><html><head><style>
@font-face { font-family: Geist; src: url(data:font/ttf;base64,${font}); }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #ffc400; color: #0e0e0e; font-family: Geist;
  padding: 72px; display: flex; flex-direction: column; justify-content: space-between; }
.egc { font-size: 120px; color: #fff; margin: 0 0 -40px 8px; line-height: 1.2; }
.studio { font-size: 200px; letter-spacing: -8px; line-height: 1.2; }
.row { display: flex; justify-content: space-between; font-size: 34px; }
.row > span:last-child { text-align: right; }
.lang { display: block; font-size: 20px; letter-spacing: 2px; opacity: .55; margin-bottom: 6px; }
</style></head><body>
  <div><div class="egc">egc</div><div class="studio">studio.</div></div>
  <div class="row">
    <span><span class="lang">FR</span>Photo, vidéo, design et web</span>
    <span><span class="lang">EN</span>Photo, video, design and web</span>
  </div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: fileURLToPath(new URL("public/og.png", root)) });
await browser.close();
console.log("public/og.png written");
