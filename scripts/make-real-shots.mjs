// Screenshots of the sites the studio built, for the "Réalisations" section of /web/.
// Saves public/web/real-<slug>-desk.webp (1280 × 800) and real-<slug>-phone.webp (420 wide).
// Needs Playwright with Chromium (not a project dependency: install it anywhere and point
// NODE_PATH at its node_modules). Run: node scripts/make-real-shots.mjs [slug ...]
import { createRequire } from "node:module";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

export const sites = [
  { slug: "anareka", url: "https://anarekaci.com/" },
  { slug: "bmtacademy", url: "https://xtruck149.github.io/bmtacademy/" },
  { slug: "graya", url: "https://xtruck149.github.io/GrayaHolistic/" },
  { slug: "mima", url: "https://real11-espace-mima.vercel.app/" },
  { slug: "kignon", url: "https://espace-kignon.vercel.app/" },
  { slug: "vipgarage", url: "https://real23-vip-garage.vercel.app/" },
  { slug: "sandwish", url: "https://real7-sandwish-republic.vercel.app/" },
  { slug: "agencew", url: "https://real22-agence-w.vercel.app/" },
  { slug: "dmyr", url: "https://real15-d-myr.vercel.app/" },
  { slug: "overstyle", url: "https://real12-overstyle-ci.vercel.app/" },
  { slug: "underthetree", url: "https://real9-under-the-tree.vercel.app/" },
  { slug: "missfatima", url: "https://real14-miss-fatima-wigs.vercel.app/" },
  { slug: "ebena", url: "https://real19-pharmacie-ebena.vercel.app/" },
  { slug: "boucheeroyale", url: "https://real8-bouchee-royale.vercel.app/" },
  { slug: "maisonawa", url: "https://real16-maison-awa.vercel.app/" },
  { slug: "massimmo", url: "https://real21-mass-immobilier.vercel.app/" },
  { slug: "perusia", url: "https://real18-pharmacie-perusia.vercel.app/" },
];

const only = process.argv.slice(2);
const list = only.length ? sites.filter((s) => only.includes(s.slug)) : sites;

const allShots = [
  { suffix: "desk", viewport: { width: 1280, height: 800 }, scale: 1, width: 1280, mobile: false },
  { suffix: "phone", viewport: { width: 390, height: 794 }, scale: 2, width: 420, mobile: true },
  // Sharp, taller phone capture for the home prism's Web face and the intro (SHOTS=face)
  { suffix: "face", viewport: { width: 390, height: 844 }, scale: 2, width: 780, mobile: true },
];
// SHOTS=face (or desk,phone) picks which captures to make; default: desk and phone.
const pickShots = (process.env.SHOTS ?? "desk,phone").split(",");
const shots = allShots.filter((s) => pickShots.includes(s.suffix));

// PW_CHANNEL=msedge (or chrome) uses an installed browser instead of Playwright's own Chromium.
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
for (const site of list) {
  for (const s of shots) {
    const context = await browser.newContext({
      viewport: s.viewport,
      deviceScaleFactor: s.scale,
      isMobile: s.mobile,
      hasTouch: s.mobile,
      locale: "fr-FR",
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    try {
      await page.goto(site.url, { waitUntil: "networkidle", timeout: 60000 });
    } catch {
      // Some sites keep a connection open; what has loaded is enough.
    }
    // Let preloaders and entrance animations finish, then nudge lazy images into loading.
    await page.waitForTimeout(5000);
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(2200);
    // A site with a constantly running animation can stall the capture: freeze it as a fallback.
    const png = await page
      .screenshot({ timeout: 60000 })
      .catch(() => page.screenshot({ timeout: 60000, animations: "disabled" }));
    const out = `public/web/real-${site.slug}-${s.suffix}.webp`;
    await sharp(png).resize({ width: s.width }).webp({ quality: 80 }).toFile(out);
    console.log(out);
    await context.close();
  }
}
await browser.close();
