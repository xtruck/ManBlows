"use client";

import PerspectiveTunnelHero, { type TunnelImage } from "./ui/perspective-tunnel-hero";
import { useLang } from "./LangProvider";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
// Small copies: the cards are at most 270 px wide. None of these pictures is used by another
// animation (prism, intro, stickers): see crafts.ts.
const work = (n: string, title: string): TunnelImage => ({ src: `${base}/work/xs/${n}.webp`, title });
const film = (n: string, title: string): TunnelImage => ({ src: `${base}/films/sm/${n}-poster.webp`, title });

const sets = {
  // Home: nine pieces across the four crafts
  home: [
    work("photo-26", "Portrait"),
    work("design-34", "Église Mesev"),
    film("film-1453", "Drone"),
    { src: `${base}/web/real-mima-phone.webp`, title: "Espace Mima" },
    work("photo-14", "Shooting"),
    work("design-18", "SII 2026"),
    film("film-2002", "Robe kente"),
    { src: `${base}/web/real-bmtacademy-desk.webp`, title: "BMT Green Academy" },
    work("photo-02", "Les Bols du Bonheur"),
  ],
  // Travaux: photos and posters
  work: [
    work("photo-27", "Portrait"),
    work("design-01", "Javelot Bar Resto"),
    work("photo-28", "Shooting"),
    work("design-04", "Royaume de Lumière"),
    work("photo-29", "Studio"),
    work("design-06", "Source d'Eau Vive"),
    work("photo-30", "Portrait"),
    work("design-08", "KMK Collection"),
    work("photo-15", "Séance"),
    work("design-12", "Action de grâce"),
  ],
  // Films: posters of the films
  films: [
    film("film-2172", "Henné"),
    film("archibat", "Archibat"),
    film("film-1440", "Danse"),
    film("maracana", "Maracana"),
    film("film-1441", "Tournage"),
    film("clavier", "Au clavier"),
    film("film-1451", "Drone"),
    film("agef-investir", "AGEF"),
    film("film-1439", "Marche"),
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
      length={set === "home" ? 2.6 : 2.4}
    />
  );
}
