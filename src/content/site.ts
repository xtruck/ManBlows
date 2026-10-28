// Demo content. Every image and name here is a placeholder until the client
// sends his own photos, videos, clients and contact details.

export type Category = "ceremonies" | "events" | "portraits" | "films";

export type Shot = {
  id: number;
  category: Category;
  src: string;
  w: number;
  h: number;
  place: string;
};

const img = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const reelPoster = img("egu-reel-poster", 1800, 1012);
export const portrait = img("egu-portrait-artist", 900, 1125);

export const shots: Shot[] = [
  { id: 1, category: "ceremonies", src: img("egu-w1", 900, 1200), w: 900, h: 1200, place: "Mariage, Cocody" },
  { id: 2, category: "events", src: img("egu-e1", 1200, 800), w: 1200, h: 800, place: "Lancement produit" },
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

export const clients = [
  "Maison Adjoua",
  "Groupe Kora",
  "Studio Lagune",
  "Café Bassam",
  "Nuit des Talents",
  "Église du Plateau",
  "Atelier Wax",
  "Radio Horizon",
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
