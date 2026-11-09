// Content shown on the site. Everything here is the founder's own work and details.
// Designs live in ./design.ts. Photos and videos are added as they arrive
// (see scripts/ingest-watch.mjs and docs/BRIEF.md).

import { designShots, offerShots } from "./design";
import { photoShots } from "./photos";
import { placeEn } from "./captions-en";

/** The caption of a gallery picture in the visitor's language (French when no English one is written). */
export const placeOf = (shot: { place: string }, lang: "fr" | "en") => (lang === "en" ? placeEn[shot.place] ?? shot.place : shot.place);

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
    id: 11,
    title: { fr: "Mariage, détails de la cérémonie", en: "Wedding, ceremony details" },
    kind: { fr: "Mariage", en: "Wedding" },
    duration: "00:42",
    poster: `${base}/films/mariage-calebasse-poster.webp`,
    video: `${base}/films/mariage-calebasse.mp4`,
    vertical: true,
  },
  {
    id: 12,
    title: { fr: "Les Bols du Bonheur, en cuisine", en: "Les Bols du Bonheur, in the kitchen" },
    kind: { fr: "Entreprise", en: "Business" },
    duration: "00:25",
    poster: `${base}/films/bols-du-bonheur-poster.webp`,
    video: `${base}/films/bols-du-bonheur.mp4`,
    vertical: true,
  },
  {
    id: 13,
    title: { fr: "Au clavier, plan serré", en: "At the keyboard, close-up" },
    kind: { fr: "Événement", en: "Event" },
    duration: "00:37",
    poster: `${base}/films/clavier-poster.webp`,
    video: `${base}/films/clavier.mp4`,
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
  {
    id: 14,
    title: { fr: "Décollage du drone, en pleine rue", en: "Drone take-off, out on the street" },
    kind: { fr: "Coulisses", en: "Behind the scenes" },
    duration: "00:06",
    poster: `${base}/films/film-1451-poster.webp`,
    video: `${base}/films/film-1451.mp4`,
    vertical: true,
  },
  {
    id: 15,
    title: { fr: "Pilotage du drone, tablette en main", en: "Flying the drone from a tablet" },
    kind: { fr: "Coulisses", en: "Behind the scenes" },
    duration: "00:14",
    poster: `${base}/films/film-1453-poster.webp`,
    video: `${base}/films/film-1453.mp4`,
    vertical: true,
  },
  {
    id: 16,
    title: { fr: "Tournage d'une danse en pleine rue", en: "Filming a street dance" },
    kind: { fr: "Coulisses", en: "Behind the scenes" },
    duration: "00:23",
    poster: `${base}/films/film-1440-poster.webp`,
    video: `${base}/films/film-1440.mp4`,
    vertical: true,
  },
  {
    id: 17,
    title: { fr: "Une marche de groupe, filmée depuis le bord de la route", en: "A group walk, filmed from the roadside" },
    kind: { fr: "Coulisses", en: "Behind the scenes" },
    duration: "00:06",
    poster: `${base}/films/film-1439-poster.webp`,
    video: `${base}/films/film-1439.mp4`,
    vertical: true,
  },
  {
    id: 18,
    title: { fr: "L'équipe arrive sur le tournage", en: "The crew arrives on set" },
    kind: { fr: "Coulisses", en: "Behind the scenes" },
    duration: "00:06",
    poster: `${base}/films/film-1441-poster.webp`,
    video: `${base}/films/film-1441.mp4`,
    vertical: true,
  },
  {
    id: 19,
    title: { fr: "Le caméraman en action", en: "The camera operator at work" },
    kind: { fr: "Coulisses", en: "Behind the scenes" },
    duration: "00:12",
    poster: `${base}/films/film-1452-poster.webp`,
    video: `${base}/films/film-1452.mp4`,
    vertical: true,
  },
  {
    id: 20,
    title: { fr: "Séance photo en robe kente", en: "Kente gown photo shoot" },
    kind: { fr: "Portrait", en: "Portrait" },
    duration: "00:27",
    poster: `${base}/films/film-2002-poster.webp`,
    video: `${base}/films/film-2002.mp4`,
    vertical: true,
  },
  {
    id: 21,
    title: { fr: "Réception sous chapiteau, le buffet", en: "Marquee reception, the buffet" },
    kind: { fr: "Événement", en: "Event" },
    duration: "00:20",
    poster: `${base}/films/film-2585-poster.webp`,
    video: `${base}/films/film-2585.mp4`,
  },
  {
    id: 22,
    title: { fr: "Salon professionnel, interviews et rencontres", en: "Trade show, interviews and meetings" },
    kind: { fr: "Événement", en: "Event" },
    duration: "01:21",
    poster: `${base}/films/film-3647-poster.webp`,
    video: `${base}/films/film-3647.mp4`,
    vertical: true,
  },
  {
    id: 23,
    title: { fr: "Alors, ta date ?", en: "So, when's your date?" },
    kind: { fr: "Promo", en: "Promo" },
    duration: "00:18",
    poster: `${base}/films/film-3726-poster.webp`,
    video: `${base}/films/film-3726.mp4`,
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
  "Skinnys",
  "Javelot Bar Resto",
  "SIFEC",
];

// Contact details, as printed on the founder's own posters.
export const contact = {
  whatsapp: "2250160668682", // digits only, for wa.me
  whatsappLabel: "+225 01 60 66 86 82",
  email: "vegcstudio@gmail.com",
  instagram: "egc_studio225", // from the studio's Instagram profile link
  tiktok: "egc_studio225", // from the studio's TikTok profile link
};

/** 640px copy of a work image, for grids and previews; the full file stays for the lightbox. */
export const thumb = (src: string) => src.replace("/work/", "/work/sm/");
