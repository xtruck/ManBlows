"use client";

import PerspectiveTunnelHero, { type TunnelImage } from "./ui/perspective-tunnel-hero";
import { useLang } from "./LangProvider";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Nine pieces across the four crafts, small copies (the cards are at most 270 px wide).
const images: TunnelImage[] = [
  { src: `${base}/work/xs/photo-12.webp`, title: "Portrait" },
  { src: `${base}/work/xs/design-02.webp`, title: "Église Mesev" },
  { src: `${base}/films/sm/film-2476-poster.webp`, title: "Mariage" },
  { src: `${base}/web/real-anareka-face.webp`, title: "ANAREKA-CI" },
  { src: `${base}/work/xs/photo-17.webp`, title: "Cérémonie" },
  { src: `${base}/work/xs/design-37.webp`, title: "Skinnys" },
  { src: `${base}/films/loop/showreel.webp`, title: "Showreel" },
  { src: `${base}/web/real-graya-face.webp`, title: "Graya Holistic" },
  { src: `${base}/work/xs/design-19.webp`, title: "SII 2026" },
];

/** Home page: a corridor of the studio's work that the visitor flies through by scrolling. */
export function WorkTunnel() {
  const { t } = useLang();
  const w = t.home.tunnel;
  return <PerspectiveTunnelHero images={images} eyebrow={w.eyebrow} title={[...w.title]} text={w.text} prompt={w.prompt} length={3} />;
}
