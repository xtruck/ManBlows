// Content shown on the site. Everything here is the founder's own work and details.
// Designs live in ./design.ts. Photos and videos are added as they arrive
// (see scripts/ingest-watch.mjs and docs/BRIEF.md).

import { designShots } from "./design";

export type Category = "ceremonies" | "events" | "portraits" | "films" | "design" | "studio";

/** Who a design was made for. "studio" is EGC Studio's own promotion. */
export type Kind = "church" | "business" | "school" | "event" | "personal" | "studio";

export type Shot = {
  id: number;
  category: Category;
  src: string;
  w: number;
  h: number;
  place: string;
  /** Shown in the home-page selection. */
  featured?: boolean;
  /** True for the founder's own work. */
  real?: boolean;
  /** The client a piece was made for, when it could be identified. */
  client?: string;
  kind?: Kind;
};

export const shots: Shot[] = [...designShots];

// GitHub Pages serves the site under a sub-path, so local files need the base path.
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Vertical videos from the owner's folder, converted to 720x1280 H.264.
export const films = [
  {
    id: 6,
    title: { fr: "Mariage, détails du henné", en: "Wedding, henna details" },
    kind: { fr: "Mariage", en: "Wedding" },
    duration: "00:33",
    poster: `${base}/films/film-2476-poster.webp`,
    video: `${base}/films/film-2476.mp4`,
    vertical: true,
  },
  {
    id: 7,
    title: { fr: "Mariage, cérémonie du henné", en: "Wedding, henna ceremony" },
    kind: { fr: "Mariage", en: "Wedding" },
    duration: "00:10",
    poster: `${base}/films/film-2172-poster.webp`,
    video: `${base}/films/film-2172.mp4`,
    vertical: true,
  },
  {
    id: 5,
    title: { fr: "Reportage d'événement", en: "Event coverage" },
    kind: { fr: "Événement", en: "Event" },
    duration: "00:25",
    poster: `${base}/films/reportage-evenement-poster.webp`,
    video: `${base}/films/reportage-evenement.mp4`,
    vertical: true,
  },
];

// Clients, read from the logos and text on the founder's posters (see design.ts).
export const clients = [
  "Église Mesev",
  "Assemblée Internationale Royaume de Lumière",
  "Mission Évangélique Source d'Eau Vive",
  "Vitall Institut",
  "Les Bols du Bonheur",
  "KMK Collection",
  "Salon International de l'Investissement",
  "SGS Consulting",
  "AGEF",
  "Eliah Home Déco",
  "Javelot Bar Resto",
];

// Contact details, as printed on the founder's own posters.
export const contact = {
  whatsapp: "2250160668682", // digits only, for wa.me
  whatsappLabel: "+225 01 60 66 86 82",
  email: "vegcstudio@gmail.com",
  instagram: "egc_studio",
};
