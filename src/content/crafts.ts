// The studio's four crafts, in the order they are shown everywhere (hero, intro, cards).
// Texts live in i18n/dict.ts (`crafts`); this file holds what isn't translated.

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export type CraftKey = "photo" | "video" | "design" | "web";

export const crafts: { key: CraftKey; href: string; image: string; w: number; h: number }[] = [
  // A studio portrait (photos.ts n° 12)
  { key: "photo", href: "/travaux/#photos", image: `${base}/work/photo-12.webp`, w: 934, h: 1400 },
  // Wedding film, henna details
  { key: "video", href: "/films/", image: `${base}/films/film-2476-poster.webp`, w: 720, h: 1280 },
  // "Opération rentrée scolaire" poster for Église Mesev (design.ts n° 2)
  { key: "design", href: "/travaux/#design", image: `${base}/work/design-02.webp`, w: 1120, h: 1400 },
  // ANAREKA-CI, a site the studio built for a client, on a phone (scripts/make-real-shots.mjs, SHOTS=face)
  { key: "web", href: "/web/", image: `${base}/web/real-anareka-face.webp`, w: 780, h: 1688 },
];
