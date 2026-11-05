// Captures of this site for the "Web" craft (hero prism face, cards, /web/ page).
// Needs a built site served at http://localhost:8765/ManBlows/ and Playwright with Chromium.
// Run: node scripts/make-web-shots.mjs
import { createRequire } from "node:module";
import sharp from "sharp";

const { chromium } = createRequire(import.meta.url)("playwright");
const B = "http://localhost:8765/ManBlows/";
const shots = [
  { name: "site-work", path: "travaux/", viewport: { width: 390, height: 844 }, scroll: 0 },
  { name: "site-films", path: "films/", viewport: { width: 390, height: 844 }, scroll: 1150 },
  { name: "site-contact", path: "contact/", viewport: { width: 390, height: 844 }, scroll: 0 },
  { name: "site-desktop", path: "travaux/", viewport: { width: 1440, height: 900 }, scroll: 0 },
];

const browser = await chromium.launch();
for (const s of shots) {
  const page = await browser.newPage({ viewport: s.viewport, deviceScaleFactor: 2 });
  await page.goto(B);
  await page.evaluate(() => sessionStorage.setItem("egc-intro-seen", "1"));
  await page.goto(B + s.path);
  await page.waitForFunction(() => !document.querySelector("[data-preloader]"));
  await page.evaluate((y) => window.scrollTo(0, y), s.scroll);
  await page.waitForTimeout(2500);
  // The floating WhatsApp button is not part of the page design shown here.
  await page.addStyleTag({ content: "a.fixed[href^='https://wa.me/']{display:none!important}" });
  const png = await page.screenshot();
  await sharp(png).resize({ width: s.viewport.width * 2 > 1600 ? 1600 : s.viewport.width * 2 }).webp({ quality: 78 }).toFile(`public/web/${s.name}.webp`);
  await page.close();
  console.log("public/web/" + s.name + ".webp");
}
await browser.close();
