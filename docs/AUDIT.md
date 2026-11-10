# EGC Studio: front-end and back-end audit

Date: 9 November 2026. Scope: the website (Next.js 16 static export on GitHub Pages), the assistant's Cloudflare
Worker, the build and deploy pipeline, and the repository. Every finding below was measured or reproduced; where
something is an assumption or could not be tested, it says so.

## 1. Verdict

The site is in good shape: no console errors, no failed requests, no broken images or videos, no horizontal overflow,
Lighthouse accessibility 100 (96 on Contact in some runs: a timing artefact, see section 5), best practices 100, SEO 100, CLS 0 on every page. The audit found **21 issues in the
live interface (2 High, 6 Medium, 13 lower) and, while verifying them, 3 more (an accessibility problem with the reveal
animation, a sticker contrast value, and a performance regression of my own); all the real bugs are fixed in this
session** (section 3).

What is left is mostly **performance on slow phones** (the JavaScript payload and the intro's effect on first
paint), **hosting limits** that GitHub Pages imposes (no security headers, no real caching), **cost protection for the
AI assistant** (needs two one-time setup steps), and **content decisions** only the owner can make (section 4).

## 2. Method and coverage

| Area | What was done |
| --- | --- |
| Whole-site QA | An independent agent tested every page in French and English with animations on and off: console and network, layout overflow, broken media, menus, lightbox, filters, assistant flow, contact form, scrolling, intro (normal, CPU x4, Slow 4G, scripts blocked, no JavaScript), axe accessibility, SEO files, copy. The full automated scan covered 390 and 1440 px; 320, 768, 1024 and 2560 px got screenshots only (768 and 1024 had no individual layout inspection). 21 findings: 2 High, 6 Medium, 9 Low, 4 Nit. |
| Verification | The agent's evidence was used as the starting point. I reproduced the one High finding I could not explain from the code (QA-002) before touching it; the others were fixed from the evidence and each fix was re-tested in a real browser afterwards. A second accessibility sweep (axe, after the animations settle) and a before/after performance comparison on the same machine were added. The one-off browser scripts are not kept in the repository; `npm run smoke` and the Worker tests are. |
| Automated smoke test | `npm run smoke`: 7 pages x 3 sizes x 2 languages (42 views, 70 with full animations): console errors, failed requests, overflow, broken images/videos, one `<h1>`, unnamed links. Passes. |
| Lighthouse | Mobile profile (slow 4G, 4x CPU slowdown), all six pages, on a local server. |
| Worker | Code review as an attacker, 22 automated tests, `wrangler deploy --dry-run` validation. |
| Repository | Secret scan of tracked files and history, dependency audit, file weights, CI workflow review. |

Limits: the live URLs of the 17 sites shown on /web/ and GitHub Pages itself were not reachable from the sandbox; the
real Cloudflare AI was never called (no account here); no real phone (iOS Safari, Android address-bar behaviour) was
used, swipes were simulated; Lighthouse ran on a plain local server, so its "text compression" and "cache lifetime"
warnings are artefacts (GitHub Pages compresses text; see FE-04 for its real cache behaviour).

## 3. Fixed in this session

| ID | Severity | Area | Problem | Fix | Verified |
| --- | --- | --- | --- | --- | --- |
| QA-001 | High | Intro | With JavaScript off, or if the scripts fail, the opaque intro cover stayed forever and the page was invisible; Skip did nothing. | CSS-only fade-out at 7 s, hidden without JS, 9 s script cap, Escape key. | Scripts blocked: cover gone at 7.8 s; JS off: hidden at once. |
| QA-002 | High | /travaux/ | `TypeError ... reading 'end'` when switching animations from reduced to full. Cause: with `once: true`, GSAP triggers delete themselves while another refresh is looping over the list. | Play-once triggers (no self-deletion) in Reveals and Stats, plus a safe refresh helper. | Reproduced 4/4 before; 0 errors on all pages in both directions after; reveals still all appear. |
| QA-003 | Medium | Intro | Skip did nothing until the page scripts arrived (8 s on Slow 4G). | Tiny inline script: the click lifts the cover immediately and the intro honours it. | Click with scripts blocked: cover opacity 0 in 0.5 s. |
| QA-004 | Medium | Home tunnel | On phones the title block scaled to 1.35x and its text was cut at both screen edges. | Capped at 1.04x below 768 px. | 0 px overflow at 390 and 320 px. |
| QA-005 | Medium | Contact (EN) | The project-type select defaulted to "Portrait": stale option after a language change. | Select controlled by position. | Default is the first option; keeps its position after FR to EN. |
| QA-006 | Medium | Phones | WhatsApp pill covered the home tunnel. | Hidden while an immersive sequence fills the screen. | Hidden in 9/9 samples at 390 and 320 px. |
| QA-007 | Medium | 320 px | Assistant and WhatsApp pills overlapped by 16 px. | Assistant shows its icon only under 360 px. | No overlap. |
| QA-008 | Medium | Gallery (EN) | 70 captions, image descriptions and lightbox labels stayed in French in English mode. | English caption map and a helper used everywhere. | No French caption left (only event names such as "Soirée 2 Ouff"). |
| QA-009 | Low | Titles | Title before/after hydration differed ("Sites web" vs "Web"), the /web/ description was overwritten, 404 title stayed French. | One dictionary source for titles and descriptions of every page and language. | FR and EN titles and descriptions correct on all pages. |
| QA-010 | Low | Contact form | Invalid e-mail accepted, no `aria-invalid` or focus on errors, ISO date in the message, "opened" even if the tab was blocked. | Validation, flags, focus, readable date, visible fallback link. | Tested in the browser. |
| QA-011 | Low | All | Touch targets under 44 px (menu, filter chips, footer, contact links, FAQ rows, prism dots). | 44 px hit areas. | Sizes re-measured. |
| QA-012/013 | Low | Accessibility | Faint numbers on crafts (4.49:1) and filter-chip counts (4.33:1); project-card `aria-label` did not contain the visible text. | Contrast raised; labels now come from the visible content. | Lighthouse accessibility 96 to 100 on /web/. |
| QA-014 | Low | Footer | Floating button covered the last footer row. | Bottom clearance. | Visual check. |
| QA-015 | Low | SEO | Sitemap `lastmod` changed on every build. | Removed. | Built file checked. |
| QA-017/018 | Low/Nit | 404, assistant | "(page )" in the 404 WhatsApp message; assistant title cut at 320 px. | Generic message; title may wrap. | Code and screenshots. |
| QA-020 | Nit | Brief | Counts in the brief were out of date (11 photos, 8 films). | Updated (41 photos, 35 designs, 18 films). | Counts read from the data. |
| AX-1 | Medium | Accessibility | The scroll-reveal animation hid blocks with `visibility: hidden`, which also removes them from the accessibility tree: the only `<h1>` of /films/ and /travaux/ (it sits below the tunnel) did not exist for screen readers until the visitor scrolled to it, and the phone project-card row on /web/ was not keyboard-focusable until revealed. Found by running axe after the animations settle, which the first pass had not done. | Reveals fade with opacity only. | axe: 0 violations over 48 views (was 24). |
| AX-2 | Low | Accessibility | The "Looks great!" sticker (and the assistant's blue bubble) was white on `#2f6bff`: 4.49:1, needs 4.5. | Blue changed to `#2e69fa` (4.65:1). | axe. |
| PERF-1 | Medium | /travaux/ | Regression I introduced: blocking time 50-60 ms to 300-440 ms (performance 70 to 55-59) after the intro rewrite, because 82 reveal triggers were created in one long task as the intro lifted. | Triggers are created in batches of 8 per frame, on-screen ones first. | Lighthouse x3 before and after (section 5). |

Also done during this work: the intro was redesigned (camera viewfinder instead of a photo, 3.6-3.8 s instead of
4.3-4.7 s, iris animated with transform only), the Web page now shows the sites in a realistic laptop and phone
showcase (a horizontal overflow and a column that grew with the site name were found and fixed on the way), the
Worker was hardened (8 KB body cap, JSON content type required, no-store, preflight cache, localhost only in a
dev environment, hard rate limit, optional daily budget, anonymous logs), Dependabot was added, `npm audit` went from
8 to 0 vulnerabilities, 640 px copies of the site captures cut that payload from 1,016 KB to 368 KB, and the smoke
test was added.

## 4. Open findings

Severity: **High** = visibly hurts visitors or the business; **Medium** = should be done soon; **Low** = polish or
future risk. "Owner" means it needs a decision or an account only the studio has.

### 4.1 Front-end

| ID | Severity | Finding | Evidence | Recommendation | Effort |
| --- | --- | --- | --- | --- | --- |
| FE-01 | High | **Slow first paint on slow phones.** Lab LCP is 7.8-10.6 s on slow 4G. The largest element is the hero's first photo; Lighthouse splits it into 0.5 s server, 1.7 s discovery, 0.7 s download and **about 6 s render delay**, because the photo is hidden behind the intro and starts fading in only when the cover lifts. | Lighthouse LCP breakdown; QA intro timings (4.3 s fast, 12-13 s on Slow 4G x4 before the failsafe). | Shorten or skip the intro for slow connections (`navigator.connection.saveData`, `effectiveType` 2g/3g); let the hero image paint under a lighter cover; keep first-visit-only. This is a design trade-off (see FE-12). | M |
| FE-02 | Medium | **No code splitting.** Every page ships about 950-1,000 KB of JavaScript (about 310 KB gzip): React 224 KB, Next runtime 174 KB, GSAP + ScrollTrigger + Lenis 140 KB, the `motion` library 135 KB. Lighthouse flags 338 KB as unused on the home page. The Contact and About pages carry the same libraries. | Chunk sizes in `out/_next/static`; no `dynamic()`/`lazy()` anywhere in `src`. | (1) Replace the mobile menu's `motion` animation with CSS so About, Contact and Web drop 135 KB; (2) load the Assistant after idle; (3) load ScrollTrigger/Lenis only where used. Expected: roughly 40-80 KB gzip off the lighter pages. | M |
| FE-03 | Medium | **Main-thread cost.** Total Blocking Time 190-500 ms (lab, 4x CPU); the GSAP chunk alone is 2.1 s of script time at 4x slowdown; "forced reflow" flagged on home and /travaux/. | Lighthouse bootup-time and forced-reflow insights. | Defer non-visible animation setup (IntersectionObserver), batch layout reads before writes in Reveals/Hero. | M |
| FE-04 | Medium | **No real caching on GitHub Pages.** It serves everything with `max-age=600` (10 minutes), including fingerprinted assets, so returning visitors revalidate about 1.5-1.8 MB per visit. (Known GitHub Pages behaviour; not measurable from this sandbox.) | Lighthouse "cache" insight is exaggerated by the local server, but the platform limit is real. | A custom domain behind Cloudflare (free) with long-cache rules for `/_next/static`, `/work`, `/films`, `/web`. Also fixes BE-06 and BE-07. | S-M (owner: domain) |
| FE-05 | Low | Some images are larger than shown: prism "face" captures (80-126 KB), a few `/work/sm` photos. About 400 KB of savings on the home page. | Lighthouse "properly size images" and "image delivery". | Make `xs`/`sm` copies for the `-face` captures and use `sizes` that match the 26 rem prism. | S |
| FE-06 | Low | **/travaux/ DOM size: 1,079 elements** (all 76 items rendered at once). | Lighthouse dom-size. | Render the first 24 and load more on scroll or button. | S-M |
| FE-07 | Low | About 43 KB of legacy polyfills (`Array.prototype.at/flat/flatMap`, `Object.fromEntries`) in the React chunk. | Lighthouse legacy-javascript. | Set a modern `browserslist` (the site already needs CSS container queries and `:has`). | S |
| FE-08 | Low | Ultrawide (2560 px): small type and big empty bands; /travaux/ is 28,000 px tall. | QA screenshots. | A max container width and a larger type scale above 1920 px. | S |
| FE-09 | Low | axe `region`: the WhatsApp pill and the intro's status text sit outside landmarks. | QA axe runs (best-practice rule, not part of Lighthouse). | Wrap floating UI in a labelled complementary region. | S |
| FE-10 | Medium (owner) | **Content honesty.** The Web page says "17 sites conçus" while 14 of them are unsolicited concepts and 3 were delivered to clients. The new sticker ("Site livré" / "Maquette") and the intro paragraph make this clear on the page, but the number alone can read as 17 client projects. | `dict.ts` `concept: true` flags. | Owner decision: e.g. "17 sites conçus, dont 3 livrés". | S |
| FE-11 | Low | The 17 live site URLs and the social profiles could not be checked from the sandbox. | QA-016. | Click through once from a phone; a monthly link check would catch dead demos (Vercel previews can expire). | S |
| FE-12 | Info | The intro is a deliberate design choice that costs first paint (FE-01). It already plays once per visit, can be skipped, and takes 3.6-3.8 s on a normal connection. | | Keep, but see FE-01 for slow connections. | |

### 4.2 Back-end (Worker, pipeline, hosting, repository)

| ID | Severity | Finding | Evidence | Recommendation | Effort |
| --- | --- | --- | --- | --- | --- |
| BE-01 | Medium | **The `Origin` check is not authentication.** Anyone outside a browser can send any `Origin`. The remaining protection is the per-IP rate limit (12 a minute), which a rotating-IP attacker defeats, and the daily budget (BE-02). The worst case is exhausting the free AI allowance, not data loss (nothing is stored). | Code review. | Turn on the daily budget now (BE-02); optionally add Cloudflare Turnstile (a free, invisible check) for a hard guarantee. | S / M |
| BE-02 | Medium (owner) | **The daily budget is off until set up.** It needs a one-time `wrangler kv namespace create USAGE` and one config line. Until then there is no daily cap. | `worker/README.md`. | Do it at deploy time. | S |
| BE-03 | Medium (owner) | **The real AI has never been called.** The model id (`@cf/meta/llama-3.1-8b-instruct`) is from memory and the streaming format is assumed; the tests use a mock. The guard enforces the rules whatever the model writes, but answer quality and language are untested. | Cloudflare docs unreachable from the sandbox. | After deploying, run `node worker/eval.mjs <url> --show` and read the 20 answers. | S |
| BE-04 | Low | No timeout on the AI call; a stream that fails midway ends silently (the site then shows its WhatsApp fallback, so visitors are fine). | Code review. | Add an abort/timeout around `AI.run` and an `error` event on mid-stream failure. | S |
| BE-05 | Low | The assistant's knowledge file is generated by hand (`npm run knowledge`); editing the FAQ without redeploying the Worker leaves answers stale. | No CI check. | Add `npm run knowledge -- --check` as a non-blocking CI warning. | S |
| BE-06 | Medium | **GitHub Pages cannot send security headers**: no Content-Security-Policy, X-Frame-Options (the site can be embedded in another page), Referrer-Policy or Permissions-Policy. | Platform limit. | A Cloudflare proxy in front (see FE-04) can add them. A strict CSP also needs the inline boot scripts moved to hashes. | M (owner: domain) |
| BE-07 | Low | `robots.txt` and the sitemap live under `/ManBlows/`; crawlers read them only at the host root, so they are ignored on a `github.io` project site. | QA-015. | Disappears with a custom domain; until then submit the sitemap in Google Search Console. | S |
| BE-08 | Medium | **Pipeline gaps.** GitHub Actions are pinned by tag (`@v4`), not commit SHA; no dependency audit step; no browser-level test in CI (only lint, types, Worker tests, build); CI uses Node 24 while contributors may use 22. | `.github/workflows/pages.yml`. | Pin actions by SHA (Dependabot can then bump them); add `npm audit --omit=dev --audit-level=high`; run `npm run smoke` in CI (needs a Playwright install, about 1 minute). | S-M |
| BE-09 | Medium | **Repository weight.** `public/` is 145 MB (19 videos, up to 15 MB each). Every re-encode adds to Git history for good, clones get slower, and GitHub Pages has a soft 1 GB limit. | `du`: `public/` 145 MB; `.git` is 280 MB even in this shallow clone (the full history is larger). | Re-encode the largest films (showreel 15 MB, maracana 14 MB, film-3647 14 MB) to 720p at a lower bitrate, and move videos to Cloudflare R2/Stream or Git LFS before the repo grows further. | M |
| BE-10 | Low (owner) | **No privacy notice for the AI.** Visitors' messages are processed by Cloudflare's AI; the Worker stores nothing and logs only an anonymous topic, but the site does not say so. | | One sentence and a link in the assistant footer or the page footer (wording to agree with Egu; check local data-protection rules). | S |
| BE-11 | Low | No error monitoring on the site (a visitor's JavaScript error would go unnoticed); the Worker has logs. | | Optional: a free-tier error reporter, or a `window.onerror` beacon to the Worker. | S-M |
| BE-12 | Info | Dependencies: 0 known vulnerabilities (a scoped override upgrades `minimatch`); the runtime libraries (Next, React, GSAP, motion, Tailwind) are within a patch or minor release of latest; three dev tools have newer major versions held back on purpose (ESLint 10, TypeScript 7, `@types/node` 26) and should be upgraded deliberately; Dependabot now opens weekly updates. No secrets in tracked files or Git history. | `npm audit`, `npm outdated`, secret scan. | | |

## 5. Scorecard

Lighthouse, mobile profile (slow 4G, 4x CPU slowdown), local server, on the shipping code:

| Page | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS | Transferred |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Home | 71 | 100 | 100 | 100 | 1.8 s | 8.1 s | 90 ms | 0.000 | 2.0 MB |
| Travaux | 68 | 100 | 100 | 100 | 2.0 s | 10.1 s | 150 ms | 0.000 | 1.6 MB |
| Films | 71 | 100 | 100 | 100 | 1.7 s | 9.7 s | 40 ms | 0.000 | 1.5 MB |
| Web | 70 | 100 | 100 | 100 | 1.8 s | 8.7 s | 110 ms | 0.000 | 1.7 MB |
| À propos | 73 | 100 | 100 | 100 | 1.5 s | 7.8 s | 50 ms | 0.000 | 1.2 MB |
| Contact | 73 | 96 | 100 | 100 | 1.5 s | 8.1 s | 70 ms | 0.000 | 1.2 MB |

The lab numbers come from a slow, shared sandbox processor: use them to compare versions on the same machine (below),
not as absolute scores (the brief records 88-92 on inner pages from the owner's own computer on 5 November).
Performance is held down on every page by the intro (FE-01) and the JavaScript payload (FE-02); best practices and
SEO are perfect, CLS is 0 everywhere. Accessibility is 100 on five pages; the Contact page read 100 in one run and 96 in the later ones, because Lighthouse
sometimes samples its text at 93% opacity in the last instant of the page's fade-in (the paragraph then measures
3.86:1 instead of its resting 14:1). A separate axe sweep taken after the animations settle, over 48 views (6 pages x
2 languages x 2 animation modes x 2 sizes), reports **0 violations**.

**Same machine, before and after this session** (the site as it was at the start, built and measured in the same way):

| Page | Before: perf / TBT / LCP | After: perf / TBT / LCP |
| --- | --- | --- |
| Home | 70 / 100 ms / 9.7 s | 71 / 90 ms / 8.1 s |
| Travaux | 69-71 / 50-60 ms / 9.9 s | 68 / 150 ms / 10.1 s |
| Contact | 72 / 50 ms / 8.1 s | 73 / 70 ms / 8.1 s |

A regression I introduced and fixed while auditing (PERF-1 in section 3): after the new intro and reveal changes `/travaux/` fell to
55-59 with blocking time of 300-440 ms. Cause: the page set up its 82 scroll-reveal triggers in one long task right as the
intro lifted. They are now created in batches of 8 per frame. A neighbouring run of experiments showed the metric is
sensitive to *when* that work lands (a 0.1 s change in the intro's length moved it), so batching the work, rather than
tuning the intro to hide it, is the fix that helps real slow phones too.

| Check | Result |
| --- | --- |
| `npm run lint`, `npm run typecheck`, `npm run build` | Pass |
| `npm run test:worker` | 22 tests, pass |
| `npm run smoke` (calm / full animations) | 42 / 70 page views, no problems |
| Intro safety tests (JS off, scripts blocked, storage blocked, Skip, Escape, repeat visit) | Pass |
| Showcase width stability (17 sites at 320, 390, 768, 1440 px) | Stable and inside the screen |
| Reveal-on-scroll (5 pages, both modes) | Nothing left hidden |
| `npm audit` | 0 vulnerabilities |

## 6. Recommended plan

**Before the AI goes live (an hour, owner):** deploy the Worker; create the `USAGE` store and turn on the daily
budget (BE-02); set `ASSISTANT_URL`; run `worker/eval.mjs` and read the answers (BE-03); agree a one-line privacy
notice (BE-10); decide the wording of the "17 sites" figure (FE-10).

**This month:** a custom domain behind Cloudflare, which unlocks caching (FE-04), security headers (BE-06) and a
working `robots.txt` (BE-07); lighter first paint on slow connections (FE-01); code splitting of the `motion`
library and the assistant (FE-02); pin the Actions and add `npm run smoke` and `npm audit` to CI (BE-08).

**Later:** re-encode and relocate the videos (BE-09), paginate the gallery (FE-06), images and polyfills (FE-05,
FE-07), ultrawide layout (FE-08), error monitoring (BE-11).

## Appendix: how to repeat the checks

```bash
npm ci && npm run lint && npm run typecheck && npm run test:worker
NEXT_PUBLIC_BASE_PATH= npm run build                     # root-path build for local checks
NODE_PATH=$(npm root -g) npm run smoke                   # add: -- --motion for full animations
node worker/eval.mjs https://<worker>.workers.dev --show # after deploying the Worker
```

Lighthouse was run with `npx lighthouse@12 <url> --only-categories=performance,accessibility,best-practices,seo`
against the local build, one page at a time. The QA agent's full report (21 findings with screenshots) was
produced outside the repository; the findings and their status are the table in section 3.

## 7. Follow-up audit (10 November 2026)

A second pass the day after, on the code as it now stands (with the live AI assistant, the new intro and the
"seamless motion" changes of 9 November). Same method as above, run again from scratch in this sandbox.

### 7.1 What was run

| Check | Result |
| --- | --- |
| `npm run lint`, `npm run typecheck`, `npm run build` | Pass |
| `npm run test:worker` | 24 tests, pass |
| `npm audit` | 0 vulnerabilities |
| `npm run smoke -- --motion` | 70 page views, no problems (before and after the fixes below) |
| axe, after the animations settle and the page has been scrolled through | 6 pages x 2 languages x 3 sizes (320, 390, 1440 px): **1 critical rule on 4 of 6 pages** before, **0** after |
| Keyboard | Tab through 5 pages at 1440 px: 232 focus stops, every one has a visible focus ring and is visible on screen |
| Image sizes | Every image compared with its displayed size x pixel ratio |
| Lighthouse (mobile profile) | All six pages, plus home twice after the fixes |
| Worker and assistant client | Code review: CORS, body limits, rate limit, daily budget, streaming guard, brief grounding, timeouts |
| Repository | Secret scan of tracked files (none found), weights, `npm outdated`, CI workflow |

### 7.2 Found and fixed in this pass

| ID | Severity | Problem | Fix | Verified |
| --- | --- | --- | --- | --- |
| F2-01 | High | **Home page weight doubled (2.0 MB to 4.3 MB) since the first audit.** The 9 November change made the prism preload the film loop of the next face at once, so the first visit downloaded 1.1-1.8 MB of video during the intro, competing with the first pictures on slow phones. | The loop one turn ahead now starts loading only when the intro is over (it still has a full 4.2 s turn to buffer). | Lighthouse home: 4,314 KB to 2,252 KB, media 1,808 KB to 0 KB at load, TBT 180 to 100-110 ms. In a browser: the loop is requested at 3.9 s, fully buffered at 5 s, and plays when its face arrives. |
| F2-02 | Medium | **The prism's blurred backdrop downloaded every photo and poster twice**: the face shows the 640 px copy, the blur behind it loaded the full-size file (70-105 KB each). | The backdrop uses the 400 px copy (it is blurred by 22 px, so no visible difference). | Lighthouse home images 1,081 KB to 827 KB; no full-size `/work/` file is requested by the prism any more. |
| F2-03 | Medium | **axe critical `aria-valid-attr-value` on home, Web, About (and Films at some sizes)**: the floating WhatsApp/assistant button had `aria-controls="egc-assistant"`, an element that only exists while the assistant is open (it is now loaded lazily). Screen readers get a reference to nothing. | `aria-haspopup="dialog"` instead. | axe: 0 violations over 36 views. |
| F2-04 | Low | The home tunnel showed a 1,280 px site capture in a card at most 270 px wide (69 KB instead of 24 KB). | Uses the existing 640 px copy. | Image size check. |
| F2-05 | Low | **The assistant could wait forever.** Neither the browser request nor the Worker's AI call has a timeout; the brief records one AI request that took over 60 s. Meanwhile the input stays locked. | The site abandons a chat answer after 30 s and a brief after 20 s, and shows its WhatsApp message. The Worker side is still open (BE-04). | Lint and types; the error path is the existing one. |
| F2-06 | Medium | **Dependabot's pull requests were never checked.** The workflow ran only on pushes to `main`, although `dependabot.yml` says every update goes through lint, types, tests and build first. | The workflow also runs on pull requests to `main` (checks only: no upload, no deploy); deploy permissions moved to the deploy job; a pull request can no longer cancel a deploy in progress. | YAML parsed; takes effect on the next pull request. |

### 7.3 Status of the open findings of section 4

Done since the first audit: FE-01 in part (quick intro on 2G/3G and data saver), FE-02 in part (CSS phone menu, assistant
loaded after the page), FE-10 ("sites conçus, dont 3 livrés à des clients"), BE-02 and BE-03 (the Worker is live with
the daily budget on and was tested against the real model, see `BRIEF.md`), BE-08 in part (checkout and setup-node
pinned by SHA, `npm audit` and the smoke test in CI).

Still open: FE-03, FE-04/BE-06/BE-07 (custom domain), FE-05 (the `-face` captures are still 80-126 KB), FE-06
(/travaux/ now 1,118 elements), FE-07 (43 KB of polyfills), FE-08, FE-09, FE-11, BE-04 (Worker side), BE-05, BE-09,
BE-10 (no privacy notice for the AI yet, now that it is live), BE-11.

### 7.4 New open findings

| ID | Severity | Finding | Recommendation | Effort |
| --- | --- | --- | --- | --- |
| F2-07 | Medium | **The film loops are heavy for what they are.** 20 six-second clips at 480 x 600, silent, weigh 17 MB together: 0.15 to 1.6 MB each (up to about 2 Mbit/s). A phone watching the prism for a minute downloads several MB. `public/` grew from 145 to 165 MB in a day. | Re-encode the loops with a size target (about 400-500 KB each, e.g. H.264 CRF 30-32, `-preset slow`, `-movflags +faststart`) and compare on a phone. | S |
| F2-08 | Low | Share previews are the same on every page: a link to `/films/` shared on WhatsApp shows the home title and text, because the pages set `title` and `description` but not `openGraph`. | Give each page its own `openGraph` title and description (and repeat the image, since Next replaces the whole `openGraph` object). Keep the bilingual text if that was the intent. | S |
| F2-09 | Info | Search engines only see French: the HTML is always rendered in French and the English version exists only in the browser, so English searches will not find the site. A known trade-off of the one-URL design. | If English visitors matter, give English its own URLs (`/en/...`) with `hreflang` links. | M-L |
| F2-10 | Low | The 404 page's canonical link points to `/_not-found/`, an address that does not exist (harmless: the page is `noindex`). | Set no canonical on the not-found page. | S |
| F2-11 | Low | A 30 s client timeout ends an unusually slow answer that is still streaming. | Move the limit to the Worker (BE-04): a timeout on the first token rather than on the whole answer. | S |
| F2-12 | Info | Patch releases are waiting: Next 16.4.6, React 19.3.1, motion 14.12, Tailwind 4.3.5. Dependabot will now open them with checks. | Merge the weekly group once its checks pass. | S |

### 7.5 Scorecard

Lighthouse, mobile profile, same sandbox as section 5 (compare between runs, not as absolute values):

| Page | Perf / A11y / BP / SEO | FCP | LCP | TBT | CLS | Transferred |
| --- | --- | --- | --- | --- | --- | --- |
| Home (before fixes) | 64 / 100 / 100 / 100 | 2.0 s | 9.8 s | 180 ms | 0 | 4.3 MB |
| **Home (after fixes, 2 runs)** | **66-67** / 100 / 100 / 100 | 2.0 s | 9.5-9.6 s | 100-110 ms | 0 | **2.3 MB** |
| Travaux | 67 / 100 / 100 / 100 | 2.1 s | 10.5 s | 100 ms | 0 | 1.7 MB |
| Films | 69 / 100 / 100 / 100 | 1.8 s | 10.9 s | 80 ms | 0 | 1.6 MB |
| Web | 66 / 100 / 100 / 100 | 2.0 s | 8.6 s | 130 ms | 0 | 1.8 MB |
| À propos | 71 / 100 / 100 / 100 | 1.7 s | 6.9 s | 70 ms | 0 | 1.3 MB |
| Contact | 68 / 100 / 100 / 100 | 1.7 s | 8.1 s | 190 ms | 0 | 1.2 MB |

LCP is still held back by the intro (FE-01) on every page; the remaining big wins are the custom domain (real caching
and compression control) and the JavaScript payload (about 355-410 KB unused per page).
