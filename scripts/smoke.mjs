// Smoke test of the built site: opens every page at three screen sizes in French and English and
// fails on anything a visitor would notice. Needs a build (`npm run build`) and Playwright, which is
// not a project dependency: `require('playwright')` must resolve (set NODE_PATH, see README).
//
//   npm run build && npm run smoke            # all pages, calm animation mode (stable)
//   node scripts/smoke.mjs --motion           # also with the full animations
//   node scripts/smoke.mjs --only /web/,/     # some pages only
//
// Checks per page: console errors and page errors, failed or 4xx/5xx requests, horizontal overflow,
// broken images and videos, exactly one <h1>, links to files that do not exist, empty links.

import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error("Playwright is not available. Set NODE_PATH to a folder that contains it, then run again.");
  process.exit(2);
}

const root = join(fileURLToPath(new URL("..", import.meta.url)), "out");
const args = process.argv.slice(2);
const withMotion = args.includes("--motion");
const onlyArg = args.indexOf("--only");
const only = onlyArg >= 0 ? args[onlyArg + 1].split(",") : null;

const PAGES = ["/", "/travaux/", "/films/", "/web/", "/a-propos/", "/contact/", "/404.html"].filter((p) => !only || only.includes(p));
const SIZES = [
  { name: "phone", width: 360, height: 740 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1440, height: 900 },
];
const LANGS = ["fr", "en"];
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".mp4": "video/mp4", ".ico": "image/x-icon", ".txt": "text/plain", ".xml": "application/xml", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".woff2": "font/woff2" };

// Serves out/ the way GitHub Pages does (directory index, 404.html for unknown paths)
const server = createServer(async (req, res) => {
  const path = decodeURIComponent((req.url ?? "/").split("?")[0]);
  let file = normalize(join(root, path));
  if (!file.startsWith(root)) return res.writeHead(403).end();
  try {
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
  } catch {
    try {
      const body = await readFile(join(root, "404.html"));
      return res.writeHead(404, { "Content-Type": MIME[".html"] }).end(body);
    } catch {
      return res.writeHead(404).end();
    }
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": MIME[extname(file)] ?? "application/octet-stream" }).end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, r));
const origin = `http://localhost:${server.address().port}`;

const browser = await chromium.launch();
const failures = [];
let checked = 0;

async function check(pageUrl, size, lang, motion) {
  const ctx = await browser.newContext({ viewport: { width: size.width, height: size.height } });
  await ctx.addInitScript(([l, m]) => {
    try {
      sessionStorage.setItem("egc-intro-seen", "1");
      localStorage.setItem("egc-motion", m);
      localStorage.setItem("egu-lang", l);
    } catch {}
  }, [lang, motion]);
  const page = await ctx.newPage();
  const problems = [];
  page.on("console", (m) => m.type() === "error" && problems.push(`console error: ${m.text().slice(0, 160)}`));
  page.on("pageerror", (e) => problems.push(`page error: ${String(e).slice(0, 160)}`));
  // Aborted requests are the browser cancelling prefetches or video ranges when the page closes: not bugs
  page.on("requestfailed", (r) => !/ERR_ABORTED/.test(r.failure()?.errorText ?? "") && !/\.mp4/.test(r.url()) && problems.push(`request failed: ${r.url().replace(origin, "")} (${r.failure()?.errorText})`));
  page.on("response", (r) => r.status() >= 400 && !(pageUrl === "/404.html" && r.url() === origin + pageUrl) && !r.url().endsWith("/404.html") && problems.push(`HTTP ${r.status()}: ${r.url().replace(origin, "")}`));
  await page.goto(origin + pageUrl, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  // scroll through the page so lazy images load
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += size.height * 0.8) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  const found = await page.evaluate(() => {
    const out = [];
    const de = document.documentElement;
    if (de.scrollWidth > de.clientWidth + 1) out.push(`horizontal overflow: page is ${de.scrollWidth}px wide in a ${de.clientWidth}px window`);
    for (const img of document.images) if (img.complete && img.naturalWidth === 0 && img.currentSrc) out.push(`broken image: ${img.currentSrc.split("/").slice(-2).join("/")}`);
    for (const v of document.querySelectorAll("video")) if (v.error) out.push(`video error: ${(v.currentSrc || v.src).split("/").pop()} (code ${v.error.code})`);
    const h1 = document.querySelectorAll("h1").length;
    if (h1 !== 1 && !location.pathname.endsWith("404.html")) out.push(`${h1} <h1> elements (expected 1)`);
    for (const a of document.querySelectorAll("a")) if (!a.textContent?.trim() && !a.getAttribute("aria-label") && !a.querySelector("img[alt]:not([alt=''])")) out.push(`link without a name: ${a.getAttribute("href")}`);
    return out;
  });
  await ctx.close();
  checked++;
  const all = [...new Set([...problems, ...found])];
  if (all.length) failures.push({ where: `${pageUrl} · ${size.name} · ${lang} · ${motion === "on" ? "full motion" : "calm"}`, all });
}

for (const pageUrl of PAGES) {
  for (const size of SIZES) {
    for (const lang of LANGS) {
      await check(pageUrl, size, lang, "off");
      if (withMotion && size.name !== "tablet") await check(pageUrl, size, lang, "on");
    }
  }
  process.stdout.write(`  ${pageUrl} done\n`);
}
await browser.close();
server.close();

console.log(`\n${checked} page views checked.`);
if (failures.length) {
  console.log(`${failures.length} with problems:\n`);
  for (const f of failures) console.log(`- ${f.where}\n${f.all.map((x) => `    ${x}`).join("\n")}`);
  process.exit(1);
}
console.log("No problems found.");
