import type { Kind, Shot } from "./site";

// The founder's real graphic design work, analysed poster by poster: who it was made for
// (church, business, school, event) and what it is. Pieces marked "studio" are his own
// promotional visuals (service packages and price list), not client work.
// Originals live in the owner's folder; these are optimised 1400px WebP copies.

// GitHub Pages serves the site under a sub-path, so local files need the base path.
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const d = (
  n: number,
  w: number,
  h: number,
  category: "design" | "studio",
  kind: Kind,
  place: string,
  client?: string,
  featured?: boolean,
): Shot => ({
  id: 100 + n,
  category,
  kind,
  client,
  place,
  src: `${base}/work/design-${String(n).padStart(2, "0")}.webp`,
  w,
  h,
  real: true,
  featured,
});

const allDesigns: Shot[] = [
  d(1, 1400, 1341, "design", "business", "Invitation d'anniversaire", "Javelot Bar Resto"),
  d(2, 1120, 1400, "design", "church", "Opération rentrée scolaire", "Église Mesev", true),
  d(3, 1080, 1080, "design", "church", "Prophetic Release", "Assemblée Internationale Royaume de Lumière"),
  d(4, 1400, 1101, "design", "church", "30 jours de prière et jeûne", "Assemblée Internationale Royaume de Lumière"),
  d(6, 1400, 1234, "design", "church", "Anniversaire, Roland Amuzu", "Mission Évangélique Source d'Eau Vive"),
  d(7, 1104, 1058, "design", "church", "Happy New Month, mai", "Mission Évangélique Source d'Eau Vive"),
  d(8, 1400, 1174, "design", "business", "Visuel de marque beauté", "KMK Collection"),
  d(9, 1400, 1174, "design", "business", "Affiche de la collection", "KMK Collection", true),
  d(11, 1400, 788, "design", "business", "Logo", "Les Bols du Bonheur"),
  d(12, 1400, 1013, "design", "church", "Culte d'action de grâce", "Assemblée Internationale Royaume de Lumière"),
  d(13, 1400, 987, "design", "school", "Inscriptions", "Vitall Institut"),
  d(14, 1400, 987, "design", "school", "Cours de langues", "Vitall Institut"),
  d(15, 1400, 987, "design", "school", "Anglais, italien, allemand", "Vitall Institut"),
  d(16, 1400, 1174, "design", "church", "Soirée 2 Ouff, inscriptions", "Église Mesev"),
  d(17, 1400, 1174, "design", "church", "Soirée 2 Ouff, 4e édition", "Église Mesev"),
  d(18, 1400, 1400, "design", "event", "SII 2026, annonce", "Salon International de l'Investissement"),
  d(19, 1400, 1400, "design", "event", "SII 2026, dates et lieu", "Salon International de l'Investissement", true),
  d(20, 1400, 1400, "design", "event", "SII 2026, entrée gratuite", "Salon International de l'Investissement"),
  d(21, 1400, 1174, "design", "business", "Décoration événementielle et d'intérieur", "Eliah Home Déco", true),
  d(25, 940, 788, "design", "business", "Promotion fruits frais", "Les Bols du Bonheur"),
  d(26, 1400, 933, "design", "business", "Bannière des services", "Les Bols du Bonheur", true),
  d(27, 1400, 602, "design", "business", "Bannière, terrain", "AGEF, Agence de Gestion Foncière"),
  d(28, 1400, 602, "design", "business", "Bannière, foncier", "AGEF, Agence de Gestion Foncière"),
  d(29, 1400, 602, "design", "business", "Bannière, investir", "AGEF, Agence de Gestion Foncière"),
  d(32, 1080, 1080, "design", "business", "Vœux de l'Eid el Maulud", "SGS Consulting", true),
  d(33, 1080, 1080, "design", "church", "Semaine de la jeunesse, programme", "Église Mesev"),
  d(34, 1080, 1080, "design", "church", "Conférence jeunesse", "Église Mesev"),
  d(35, 1400, 1050, "design", "business", "Panneau installé, photo de terrain", "AGEF, Agence de Gestion Foncière"),
  d(36, 1400, 603, "design", "business", "Bannière de bienvenue", "AGEF, Agence de Gestion Foncière"),
  d(37, 1120, 1400, "design", "business", "Visuel de marque", "Skinnys"),
  d(38, 1200, 675, "design", "business", "Affiche Salad complète", "Les Bols du Bonheur"),
  d(39, 1400, 788, "design", "church", "La Traversée, ma saison du vin nouveau", "Mission Évangélique Source d'Eau Vive"),
  d(40, 1400, 788, "design", "church", "Soirées couples Epanouis Talk", "Mission Évangélique Source d'Eau Vive"),
  d(41, 1400, 933, "design", "business", "Bannière fruits et légumes", "Les Bols du Bonheur"),
  d(42, 1400, 1050, "design", "business", "Panneau installé, vue de la route", "AGEF, Agence de Gestion Foncière"),
  d(22, 1120, 1400, "studio", "studio", "Forfaits réseaux sociaux", "EGC Studio"),
  d(23, 1120, 1400, "studio", "studio", "Création de design", "EGC Studio"),
  d(24, 1120, 1400, "studio", "studio", "Services de design", "EGC Studio"),
  d(31, 1120, 1400, "studio", "studio", "Offres et tarifs", "EGC Studio"),
];

/** Work made for clients: shown in the Travaux gallery. */
export const designShots = allDesigns.filter((s) => s.category !== "studio");

/** EGC Studio's own posters (packages, services, price list): shown apart, in the "Offres et tarifs" section. */
export const offerShots = allDesigns.filter((s) => s.category === "studio");
