"use client";

import PerspectiveTunnelHero, { type TunnelImage } from "./ui/perspective-tunnel-hero";
import { useLang } from "./LangProvider";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
// Small copies: the cards are at most 270 px wide.
const work = (n: string, title: string): TunnelImage => ({ src: `${base}/work/xs/${n}.webp`, title });
const film = (n: string, title: string): TunnelImage => ({ src: `${base}/films/sm/${n}-poster.webp`, title });
const site = (n: string, title: string): TunnelImage => ({ src: `${base}/web/real-${n}-face.webp`, title });

const sets = {
  // Home: nine pieces across the four crafts
  home: [
    work("photo-12", "Portrait"),
    work("design-02", "Église Mesev"),
    film("film-2476", "Mariage"),
    site("anareka", "ANAREKA-CI"),
    work("photo-17", "Cérémonie"),
    work("design-37", "Skinnys"),
    { src: `${base}/films/loop/showreel.webp`, title: "Showreel" },
    site("graya", "Graya Holistic"),
    work("design-19", "SII 2026"),
  ],
  // Travaux: photos and posters
  work: [
    work("design-02", "Église Mesev"),
    work("photo-17", "Cérémonie"),
    work("design-37", "Skinnys"),
    work("photo-04", "Les Bols du Bonheur"),
    work("design-19", "SII 2026"),
    work("photo-05", "Salon"),
    work("design-03", "Royaume de Lumière"),
    work("photo-14", "Portrait"),
    work("design-07", "Source d'Eau Vive"),
  ],
  // Films: posters of the films
  films: [
    film("film-2476", "Henné"),
    film("showreel", "Showreel"),
    film("mariage-calebasse", "Mariage"),
    film("bols-du-bonheur", "En cuisine"),
    film("archibat", "Archibat"),
    film("film-2172", "Cérémonie"),
    film("maracana", "Maracana"),
    film("clavier", "Au clavier"),
    film("agef-investir", "AGEF"),
  ],
} satisfies Record<string, TunnelImage[]>;

/**
 * A corridor of the studio's work that the visitor flies through by scrolling
 * (ui/perspective-tunnel-hero). The home page opens on the four crafts; Travaux and Films open
 * on their own pieces with a shorter run, so the gallery comes quickly.
 */
export function WorkTunnel({ set = "home" }: { set?: keyof typeof sets }) {
  const { t } = useLang();
  const w = set === "home" ? t.home.tunnel : t.tunnels[set];
  return (
    <PerspectiveTunnelHero
      key={set}
      images={sets[set]}
      eyebrow={w.eyebrow}
      title={[...w.title]}
      text={w.text}
      prompt={w.prompt}
      length={set === "home" ? 3 : 2.4}
    />
  );
}
