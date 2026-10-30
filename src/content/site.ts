// Content shown on the site. Everything here is the founder's own work and details.
// Designs live in ./design.ts. Photos and videos are added as they arrive
// (see scripts/ingest-watch.mjs and docs/BRIEF.md).

import { designShots, offerShots } from "./design";
import { photoShots } from "./photos";

export type Category = "ceremonies" | "events" | "products" | "portraits" | "films" | "design" | "studio";

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

// The Travaux gallery: client designs first, then photographs.
export const shots: Shot[] = [...designShots, ...photoShots];

// His own price and service posters, kept out of the gallery (see components/Offers.tsx).
export const offers: Shot[] = offerShots;

// GitHub Pages serves the site under a sub-path, so local files need the base path.
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// The showreel: his 25 s event coverage video (1080x1920, see docs/BRIEF.md).
export const showreel = {
  video: `${base}/films/showreel.mp4`,
  poster: `${base}/films/showreel-poster.webp`,
};

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
    id: 8,
    title: { fr: "AGEF, investir dans le foncier", en: "AGEF, investing in land" },
    kind: { fr: "Entreprise", en: "Business" },
    duration: "00:30",
    poster: `${base}/films/agef-investir-poster.webp`,
    video: `${base}/films/agef-investir.mp4`,
  },
  {
    id: 9,
    title: { fr: "Salon Archibat, reportage", en: "Archibat expo, coverage" },
    kind: { fr: "Événement", en: "Event" },
    duration: "01:07",
    poster: `${base}/films/archibat-poster.webp`,
    video: `${base}/films/archibat.mp4`,
  },
  {
    id: 10,
    title: { fr: "Maracana, reportage d'événement", en: "Maracana, event coverage" },
    kind: { fr: "Événement", en: "Event" },
    duration: "02:40",
    poster: `${base}/films/maracana-poster.webp`,
    video: `${base}/films/maracana.mp4`,
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
  "Skinnys",
  "Javelot Bar Resto",
];

// Contact details, as printed on the founder's own posters.
export const contact = {
  whatsapp: "2250160668682", // digits only, for wa.me
  whatsappLabel: "+225 01 60 66 86 82",
  email: "vegcstudio@gmail.com",
  instagram: "egc_studio",
};
