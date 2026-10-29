// Demo content. Every image and name here is a placeholder until the client
// sends his own photos, videos, clients and contact details.

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
  /** True for the founder's real work; false/absent for demo placeholders. */
  real?: boolean;
  /** The client a real piece was made for, when it could be identified. */
  client?: string;
  kind?: Kind;
};

const img = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const reelPoster = img("egu-reel-poster", 1800, 1012);
export const portrait = img("egu-portrait-artist", 900, 1125);

// Demo placeholders until his photos and videos arrive.
const placeholders: Shot[] = [
  { id: 1, category: "ceremonies", src: img("egu-w1", 900, 1200), w: 900, h: 1200, place: "Mariage, Cocody", featured: true },
  { id: 2, category: "events", src: img("egu-e1", 1200, 800), w: 1200, h: 800, place: "Lancement produit", featured: true },
  { id: 3, category: "portraits", src: img("egu-p1", 900, 1125), w: 900, h: 1125, place: "Portrait studio" },
  { id: 4, category: "films", src: img("egu-f1", 1200, 675), w: 1200, h: 675, place: "Film de mariage" },
  { id: 5, category: "ceremonies", src: img("egu-w2", 1200, 800), w: 1200, h: 800, place: "Dot traditionnelle" },
  { id: 6, category: "portraits", src: img("egu-p2", 900, 1200), w: 900, h: 1200, place: "Éditorial mode" },
  { id: 7, category: "events", src: img("egu-e2", 900, 1125), w: 900, h: 1125, place: "Concert live" },
  { id: 8, category: "ceremonies", src: img("egu-w3", 900, 1200), w: 900, h: 1200, place: "Baptême" },
  { id: 9, category: "films", src: img("egu-f2", 1200, 675), w: 1200, h: 675, place: "Clip musical" },
  { id: 10, category: "events", src: img("egu-e3", 1200, 800), w: 1200, h: 800, place: "Gala d'entreprise" },
  { id: 11, category: "portraits", src: img("egu-p3", 900, 1125), w: 900, h: 1125, place: "Portrait de famille" },
  { id: 12, category: "ceremonies", src: img("egu-w4", 1200, 800), w: 1200, h: 800, place: "Réception" },
];

export const shots: Shot[] = [...designShots, ...placeholders];

// GitHub Pages serves the site under a sub-path, so local files need the base path.
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const films = [
  // Real footage from the owner's folder (vertical videos, converted to 720x1280 H.264).
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
  {
    id: 1,
    title: { fr: "Aïcha & Koffi, le film", en: "Aïcha & Koffi, the film" },
    kind: { fr: "Mariage", en: "Wedding" },
    duration: "04:12",
    poster: img("egu-film-1", 1200, 675),
  },
  {
    id: 2,
    title: { fr: "Nuit des Talents 2026", en: "Nuit des Talents 2026" },
    kind: { fr: "Événement", en: "Event" },
    duration: "02:48",
    poster: img("egu-film-2", 1200, 675),
  },
  {
    id: 3,
    title: { fr: "Lagune, clip officiel", en: "Lagune, official video" },
    kind: { fr: "Clip musical", en: "Music video" },
    duration: "03:35",
    poster: img("egu-film-3", 1200, 675),
  },
  {
    id: 4,
    title: { fr: "Groupe Kora, lancement", en: "Groupe Kora, launch" },
    kind: { fr: "Entreprise", en: "Corporate" },
    duration: "01:56",
    poster: img("egu-film-4", 1200, 675),
  },
];

// Real clients, read from the logos and text on the founder's posters (see design.ts).
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

export const testimonials = [
  {
    name: "Aïcha & Koffi",
    role: { fr: "Mariés", en: "Newlyweds" },
    quote: {
      fr: "On a revécu toute la journée en regardant le film. Il était partout sans jamais se faire remarquer.",
      en: "We relived the whole day watching the film. He was everywhere without ever being in the way.",
    },
  },
  {
    name: "Nadia T.",
    role: { fr: "Directrice marketing, Groupe Kora", en: "Marketing lead, Groupe Kora" },
    quote: {
      fr: "Photos livrées en 48 h, prêtes pour nos réseaux. On le rappelle pour chaque événement.",
      en: "Photos delivered in 48 hours, ready for our socials. We book him for every event.",
    },
  },
];

export const contact = {
  whatsapp: "2250000000000", // placeholder, digits only for wa.me
  whatsappLabel: "+225 00 00 00 00 00",
  email: "hello@egustudio.com",
  instagram: "egustudio",
};
