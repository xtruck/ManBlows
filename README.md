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

Stack: Next.js 16 (App Router, `output: "export"`), React 19, Tailwind CSS 4, GSAP, Motion and
Lenis for animation. The home page's four-craft prism is pure CSS 3D (no WebGL).

> This Next.js version differs from older ones. Check `node_modules/next/dist/docs/` before
> relying on remembered APIs (see `AGENTS.md`).

## Where things live

| Path                         | Contents                                                              |
| ---------------------------- | --------------------------------------------------------------------- |
| `src/app/`                   | Pages: home, `travaux` (work), `films`, `web`, `a-propos` (about), `contact` |
| `src/content/crafts.ts`      | The four crafts: order, links and the image on each prism face         |
| `src/components/`            | Sections and site-wide pieces (nav, preloader, page transitions…)     |
| `src/content/photos.ts`      | Photos shown in the Work gallery                                      |
| `src/content/design.ts`      | Graphic design work, plus the studio's own price posters              |
| `src/content/site.ts`        | Films, showreel, client list and contact details                      |
| `src/i18n/dict.ts`           | Every interface text, in French and English                           |
| `src/lib/motion.ts`          | Full / gentle animation modes                                         |
| `public/work/`, `public/films/` | Optimised images (with 640px copies in `work/sm/`) and videos      |

The language is chosen in the browser (stored in `localStorage`); the HTML is always rendered in
French, and each page has a single URL for both languages.

## Adding work

1. Put new files through `node scripts/ingest-watch.mjs` (converts photos to WebP and videos to
   H.264 into `inbox/ready/`). It watches the owner's folder on his Windows PC.
2. Copy the converted files into `public/work/` or `public/films/`.
3. Add an entry in `photos.ts`, `design.ts` or the `films` list in `site.ts`.
4. For new images, run `node scripts/make-thumbs.mjs` to create the 640px copies.

## Captures of the site

`public/web/` holds screenshots of this site, used for the Web craft (prism face, card, `/web/`
page). After a visible change, serve the build on port 8765 and run `node scripts/make-web-shots.mjs`.

## Share preview

`public/og.png` is the image shown when a link is shared on WhatsApp, Facebook or X. It carries
French and English text. To change it, edit and run `node scripts/make-og.mjs` (needs Playwright).

## Deploy

Every push to `main` runs `.github/workflows/pages.yml`: lint, type-check, build with
`NEXT_PUBLIC_BASE_PATH=/ManBlows`, then publish `out/` to GitHub Pages. Local files referenced
outside `next/link` must include that base path (see `src/content/site.ts` for the pattern).
