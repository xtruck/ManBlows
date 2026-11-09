# EGC Studio

Portfolio site for **EGC Studio** (Egu) in Abidjan, built around four crafts: photo, video,
graphic design and websites.
The site is in French and English and is live at **https://xtruck.github.io/ManBlows/**.

The client brief, content decisions and change log (in French) are in [`docs/BRIEF.md`](docs/BRIEF.md).
Read it before changing content.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

| Command             | What it does                                                   |
| ------------------- | -------------------------------------------------------------- |
| `npm run dev`       | Local dev server                                               |
| `npm run build`     | Static export into `out/`                                      |
| `npm run lint`      | ESLint                                                         |
| `npm run typecheck` | Generates Next's route types, then runs TypeScript             |
| `npm run test:worker` | Tests of the assistant's Cloudflare Worker (no account needed) |
| `npm run smoke`     | Opens every page at 3 sizes in FR and EN and fails on errors, overflow, broken images (run it with the same `NEXT_PUBLIC_BASE_PATH` as the build, and Playwright on `NODE_PATH`) |

Stack: Next.js 16 (App Router, `output: "export"`), React 19, Tailwind CSS 4, GSAP, Motion and
Lenis for animation. Everything 3D is pure CSS (no WebGL), so it stays light on phones.

> This Next.js version differs from older ones. Check `node_modules/next/dist/docs/` before
> relying on remembered APIs (see `AGENTS.md`).

## Where things live

| Path                         | Contents                                                              |
| ---------------------------- | --------------------------------------------------------------------- |
| `src/app/`                   | Pages: home, `travaux` (work), `films`, `web`, `a-propos` (about), `contact` |
| `src/content/crafts.ts`      | The four crafts: order, links and the slideshow on each prism face     |
| `src/components/`            | Sections and site-wide pieces (nav, preloader, page transitions…)     |
| `src/components/ui/`         | Reusable pieces: `perspective-tunnel-hero` (3D corridor driven by the page scroll) and `device-mockups` (a laptop and a phone drawn in CSS, holding captures of the sites) |
| `src/content/photos.ts`      | Photos shown in the Work gallery                                      |
| `src/content/design.ts`      | Graphic design work, plus the studio's own price posters              |
| `src/content/site.ts`        | Films, showreel, client list and contact details                      |
| `src/i18n/dict.ts`           | Every interface text, in French and English                           |
| `src/lib/motion.ts`          | Full / gentle animation modes                                         |
| `public/work/`, `public/films/` | Optimised images (640px copies in `work/sm/`, 400px in `work/xs/`, 480px film posters in `films/sm/`) and videos |
| `public/films/loop/`         | 6-second silent loops (480 × 600) played on the prism's Video face     |
| `public/web/`                | Captures of the sites the studio built (`real-<site>-desk/-phone/-face.webp`) and of this site (`site-*.webp`, case study only) |

The language is chosen in the browser (stored in `localStorage`); the HTML is always rendered in
French, and each page has a single URL for both languages.

## Adding work

1. Put new files through `node scripts/ingest-watch.mjs` (converts photos to WebP and videos to
   H.264 into `inbox/ready/`). It watches the owner's folder on his Windows PC.
2. Copy the converted files into `public/work/` or `public/films/`.
3. Add an entry in `photos.ts`, `design.ts` or the `films` list in `site.ts`.
4. For new images, run `node scripts/make-thumbs.mjs` to create the 640px copies.

## Animations, at a glance

| Where | What | File |
| --- | --- | --- |
| First visit, every page | About 3.7 s: a camera viewfinder (brackets, focus square, exposure readout) locks, the shutter opens as a yellow iris, giant "studio." builds from merging bubbles, curtain lift. Skip button and Escape; CSS failsafe if scripts fail | `Preloader.tsx` |
| Home hero | Four-craft prism (drag to spin, per-face lighting, slideshow, film loop) with floating stickers | `Hero.tsx`, `HeroCollage.tsx` |
| Home, Travaux, Films | 3D tunnel of work, driven by the page scroll | `WorkTunnel.tsx` → `ui/perspective-tunnel-hero.tsx` |
| `/web/` | A laptop and phone that walk through every site (auto, arrows, swipe, pause), then the project cards, each on its own laptop | `WebStudio.tsx` → `SiteShowcase.tsx`, `ui/device-mockups.tsx` |
| Between pages | Four-band curtain | `TransitionProvider.tsx` |

Each animation shows **its own pictures** (no photo, poster or film appears in two of them), so a
visitor sees as much of the work as possible: keep it that way when changing `crafts.ts`,
`WorkTunnel.tsx`, `HeroCollage.tsx` or the picks in `Disciplines.tsx` (the intro no longer shows a photo).
Everything respects the "gentle" animation mode (footer switch, or the device's reduce-motion setting).

## Captures of sites

- Sites the studio built: `node scripts/make-real-shots.mjs [slug]` (Playwright, not a project
  dependency; point `NODE_PATH` at it, `PW_CHANNEL=msedge` to use Edge). `SHOTS=face` makes the
  sharp 780px phone captures used on the prism.
- This site (case study on `/web/` only): serve the build on port 8765 and run
  `node scripts/make-web-shots.mjs`.

## Share preview

`public/og.png` is the image shown when a link is shared on WhatsApp, Facebook or X. It carries
French and English text. To change it, edit and run `node scripts/make-og.mjs` (needs Playwright).

## Deploy

Every push to `main` runs `.github/workflows/pages.yml`: lint, type-check, build with
`NEXT_PUBLIC_BASE_PATH=/ManBlows`, then publish `out/` to GitHub Pages. Local files referenced
outside `next/link` must include that base path (see `src/content/site.ts` for the pattern).
