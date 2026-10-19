// Automated checks for the mockup: links, routes, layout on 3 screen sizes, mobile menu,
// forms (validation errors, success, network error) and the demo WhatsApp button.
//
//   npm run build && npm run start   (in another terminal)
//   npm run verify                    (BASE_URL=http://localhost:3000 by default)
//
// Chromium path: CHROMIUM_PATH, otherwise the browser installed by Playwright.
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const OUT = "verify-output";
const VIEWPORTS = [
  { name: "mobile", width: 360, height: 780, isMobile: true, hasTouch: true },
  { name: "tablette", width: 768, height: 1024, isMobile: true, hasTouch: true },
  { name: "ordinateur", width: 1280, height: 860 },
];
mkdirSync(OUT, { recursive: true });

const failures = [];
const log = (ok, msg) => {
  console.log(`${ok ? "✔" : "✘"} ${msg}`);
  if (!ok) failures.push(msg);
};

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--no-sandbox"] });

// 1. Crawl every internal link from the home page.
const ctx = await browser.newContext();
const page = await ctx.newPage();
const seen = new Set();
const queue = ["/"];
const pages = [];
while (queue.length) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  seen.add(path);
  const res = await page.goto(BASE + path, { waitUntil: "networkidle" });
  log(res?.status() === 200, `HTTP 200 : ${path} (${res?.status()})`);
  if (res?.status() !== 200) continue;
  pages.push(path);
  const links = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
  for (const href of links) {
    if (!href || !href.startsWith("/") || href.startsWith("//")) continue;
    const clean = href.split("#")[0].split("?")[0] || "/";
    if (!seen.has(clean) && !clean.startsWith("/api")) queue.push(clean);
  }
}
for (const extra of ["/sitemap.xml", "/robots.txt"]) {
  const r = await page.request.get(BASE + extra);
  log(r.status() === 200, `HTTP 200 : ${extra}`);
}
const missing = await page.request.get(BASE + "/page-qui-n-existe-pas");
log(missing.status() === 404, "Une URL inconnue renvoie bien 404");
await ctx.close();

// 2. Layout checks on each page and screen size.
for (const vp of VIEWPORTS) {
  const c = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
  const p = await c.newPage();
  const errors = [];
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  p.on("pageerror", (e) => errors.push(String(e)));
  for (const path of pages) {
    errors.length = 0;
    await p.goto(BASE + path, { waitUntil: "networkidle" });
    const m = await p.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h1: document.querySelectorAll("h1").length,
      noAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
      unnamedButtons: [...document.querySelectorAll("button")].filter((b) => !(b.textContent.trim() || b.getAttribute("aria-label"))).length,
      lang: document.documentElement.lang,
      title: document.title,
    }));
    const tag = `[${vp.name}] ${path}`;
    log(m.overflow <= 0, `${tag} : pas de défilement horizontal (${m.overflow}px)`);
    log(m.h1 === 1, `${tag} : un seul h1 (${m.h1})`);
    log(m.noAlt === 0 && m.unnamedButtons === 0, `${tag} : images avec alt et boutons nommés`);
    log(errors.length === 0, `${tag} : aucune erreur console${errors.length ? " — " + errors[0].slice(0, 120) : ""}`);
    if (path === "/" ) log(m.lang === "fr" && m.title.length > 10, `${tag} : langue et titre définis`);
    await p.screenshot({ path: `${OUT}/${vp.name}${path === "/" ? "-accueil" : path.replace(/\//g, "-")}.png`, fullPage: true });
  }

  // 3. Mobile menu.
  if (vp.width < 1024) {
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    const toggle = p.locator('button[aria-controls="menu-mobile"]');
    log(await toggle.isVisible(), `[${vp.name}] bouton du menu mobile visible`);
    await toggle.click();
    log((await toggle.getAttribute("aria-expanded")) === "true" && (await p.locator("#menu-mobile").isVisible()), `[${vp.name}] le menu s'ouvre`);
    await p.keyboard.press("Escape");
    log((await toggle.getAttribute("aria-expanded")) === "false" && !(await p.locator("#menu-mobile").isVisible()), `[${vp.name}] Échap ferme le menu`);
    await toggle.click();
    const target = p.locator("#menu-mobile a").nth(1);
    const href = await target.getAttribute("href");
    await target.click();
    await p.waitForURL(BASE + href);
    await p.locator("#menu-mobile").waitFor({ state: "hidden", timeout: 3000 }).catch(() => {});
    log(!(await p.locator("#menu-mobile").isVisible()), `[${vp.name}] le menu se ferme après navigation vers ${href}`);
  }
  await c.close();
}

// 4. Forms: empty submit -> errors, valid submit -> success, API failure -> error message.
const fc = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const fp = await fc.newPage();
const inSevenDays = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
async function fill(form) {
  for (const field of await form.locator("input:not([type=hidden]):not([name=website]), select, textarea").all()) {
    const tag = await field.evaluate((e) => e.tagName.toLowerCase());
    const type = (await field.getAttribute("type")) || "";
    if (type === "checkbox") { await field.check(); continue; }
    if (tag === "select") {
      const values = await field.locator("option").evaluateAll((os) => os.map((o) => o.value).filter(Boolean));
      if (values.length) await field.selectOption(values[0]);
      continue;
    }
    const value = { tel: "07 00 00 00 00", email: "test@example.com", date: inSevenDays, time: "20:00", number: String((await field.getAttribute("min")) || 2) }[type];
    await field.fill(value ?? (tag === "textarea" ? "Message de test pour la vérification automatique." : "Test Démo"));
  }
}
const formPages = [];
for (const path of pages) {
  await fp.goto(BASE + path, { waitUntil: "networkidle" });
  for (const kind of await fp.$$eval("form[data-form]", (fs) => fs.map((f) => f.dataset.form))) formPages.push({ path, kind });
}
log(formPages.length > 0, `formulaires trouvés : ${formPages.map((f) => `${f.kind}@${f.path}`).join(", ")}`);
for (const { path, kind } of formPages) {
  const sel = `form[data-form="${kind}"]`;
  await fp.goto(BASE + path, { waitUntil: "networkidle" });
  await fp.locator(`${sel} button[type=submit]`).click();
  const invalid = await fp.locator(`${sel} [aria-invalid="true"]`).count();
  log(invalid > 0 && (await fp.locator(`${sel} [data-testid=error-summary]`).isVisible()), `[${kind}] envoi vide : ${invalid} champs signalés + récapitulatif`);
  log(await fp.evaluate(() => document.activeElement?.dataset?.testid === "error-summary"), `[${kind}] le focus va au récapitulatif d'erreurs`);

  await fp.route("**/api/demandes", (r) => r.fulfill({ status: 500, body: "{}" }));
  await fill(fp.locator(sel));
  await fp.locator(`${sel} button[type=submit]`).click();
  await fp.locator(`${sel} [data-testid=network-error]`).waitFor({ timeout: 5000 }).catch(() => {});
  log(await fp.locator(`${sel} [data-testid=network-error]`).isVisible(), `[${kind}] panne serveur : message d'erreur affiché, saisie conservée`);
  await fp.unroute("**/api/demandes");

  await fp.route("**/api/demandes", async (r) => { await new Promise((ok) => setTimeout(ok, 600)); await r.continue(); });
  await fp.locator(`${sel} button[type=submit]`).click();
  log((await fp.locator(`${sel} button[type=submit]`).getAttribute("aria-busy")) === "true", `[${kind}] état de chargement pendant l'envoi`);
  const success = fp.locator('[data-state="success"]');
  await success.waitFor({ timeout: 8000 }).catch(() => {});
  log(await success.isVisible(), `[${kind}] envoi valide : message de succès`);
  await fp.unroute("**/api/demandes");
}

// Server-side validation is enforced even without the browser.
const bad = await fp.request.post(BASE + "/api/demandes", { data: { kind: formPages[0]?.kind, nom: "" } });
log(bad.status() === 422, `API : données invalides refusées (HTTP ${bad.status()})`);
const unknown = await fp.request.post(BASE + "/api/demandes", { data: { kind: "inconnu" } });
log(unknown.status() === 400, `API : type de demande inconnu refusé (HTTP ${unknown.status()})`);

// 5. WhatsApp in demo mode explains instead of opening a chat.
await fp.goto(BASE + "/", { waitUntil: "networkidle" });
await fp.locator('nav[aria-label="Actions rapides"] a', { hasText: "WhatsApp" }).click();
log(await fp.locator("dialog[open]").isVisible(), "WhatsApp (démo) : fenêtre d'information au lieu d'un vrai numéro");
await fc.close();
await browser.close();

writeFileSync(`${OUT}/rapport.json`, JSON.stringify({ base: BASE, date: new Date().toISOString(), pages, failures }, null, 2));
console.log(`\n${failures.length === 0 ? "TOUT EST VERT" : `${failures.length} ÉCHEC(S)`} — captures et rapport dans ${OUT}/`);
process.exit(failures.length ? 1 : 0);
