// The studio's four crafts, in the order they are shown everywhere (hero, intro, cards).
// Texts live in i18n/dict.ts (`crafts`); this file holds what isn't translated.

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export type CraftKey = "photo" | "video" | "design" | "web";

/** One picture on a prism face. A `video` is a short silent loop played while the face is in front. */
export type Slide = { src: string; w: number; h: number; video?: string };

const work = (n: string, w: number, h: number): Slide => ({ src: `${base}/work/${n}.webp`, w, h });
// Hero loops: 6 s, 480 × 600 (the face's 4:5), no sound, cut from the films in public/films
const loop = (n: string): Slide => ({ src: `${base}/films/loop/${n}.webp`, w: 480, h: 600, video: `${base}/films/loop/${n}.mp4` });
// Phone captures of sites the studio built (scripts/make-real-shots.mjs, SHOTS=face)
const site = (n: string): Slide => ({ src: `${base}/web/real-${n}-face.webp`, w: 780, h: 1688 });

/**
 * Each animation of the site shows its own pictures, so the visitor sees as much of the work as
 * possible: the prism (these slides), the intro pill, the stickers (HeroCollage), the three
 * tunnels (WorkTunnel) and the craft cards (Disciplines) don't repeat one another.
 * `image` is each craft's reference picture. `slides` is the slideshow of the hero
 * prism: each time a face comes back to the front it shows the next one (see Hero.tsx).
 */
export const crafts: { key: CraftKey; href: string; image: string; w: number; h: number; slides: Slide[] }[] = [
  {
    key: "photo",
    href: "/travaux/#photos",
    // A studio portrait (photos.ts n° 12): the intro lands on it, so it comes first
    image: `${base}/work/photo-12.webp`,
    w: 934,
    h: 1400,
    slides: [work("photo-12", 934, 1400), work("photo-13", 933, 1400), work("photo-16", 933, 1400), work("photo-18", 933, 1400), work("photo-24", 933, 1400)],
  },
  {
    key: "video",
    href: "/films/",
    // Wedding film, henna details
    image: `${base}/films/film-2476-poster.webp`,
    w: 720,
    h: 1280,
    slides: [loop("film-2476"), loop("showreel"), loop("mariage-calebasse"), loop("bols-du-bonheur")],
  },
  {
    key: "design",
    href: "/travaux/#design",
    // "Opération rentrée scolaire" poster for Église Mesev (design.ts n° 2). The studio's own
    // price posters (n° 22 to 24 and 31) are left out: the owner asked for no prices for now.
    image: `${base}/work/design-02.webp`,
    w: 1120,
    h: 1400,
    slides: [work("design-37", 1120, 1400), work("design-07", 1104, 1058), work("design-03", 1080, 1080), work("design-20", 1400, 1400), work("design-32", 1080, 1080)],
  },
  {
    key: "web",
    href: "/web/",
    // ANAREKA-CI, a site the studio built for a client
    image: `${base}/web/real-anareka-face.webp`,
    w: 780,
    h: 1688,
    slides: [site("anareka"), site("graya"), site("bmtacademy"), site("kignon"), site("vipgarage")],
  },
];
