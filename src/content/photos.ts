import type { Category, Kind, Shot } from "./site";

// The founder's photographs (product shots and event coverage), with who they were made for.
// Originals live in his OneDrive folder; these are optimised 1400px WebP copies.

// GitHub Pages serves the site under a sub-path, so local files need the base path.
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const p = (
  n: number,
  w: number,
  h: number,
  category: Category,
  kind: Kind,
  place: string,
  client?: string,
): Shot => ({
  id: 200 + n,
  category,
  kind,
  client,
  place,
  src: `${base}/work/photo-${String(n).padStart(2, "0")}.webp`,
  w,
  h,
  real: true,
});

export const photoShots: Shot[] = [
  p(1, 1050, 1400, "products", "business", "Salade composée, étiquette", "Les Bols du Bonheur"),
  p(2, 1050, 1400, "products", "business", "Barquettes de fruits", "Les Bols du Bonheur"),
  p(3, 1051, 1400, "products", "business", "Préparation des salades de fruits", "Les Bols du Bonheur"),
  p(4, 1051, 1400, "products", "business", "Fruits frais et étiquette", "Les Bols du Bonheur"),
  p(5, 960, 1280, "events", "event", "Stand lors d'un salon", "Les Bols du Bonheur"),
  p(6, 960, 1280, "events", "event", "Dégustation lors d'un salon", "Les Bols du Bonheur"),
  p(7, 960, 1280, "events", "event", "Dégustation, salade de fruits", "Les Bols du Bonheur"),
  p(8, 960, 1280, "events", "event", "Pause dégustation", "Les Bols du Bonheur"),
  p(9, 1080, 720, "events", "event", "Marche en équipe", "AGEF, Agence de Gestion Foncière"),
  p(10, 1080, 720, "events", "event", "Marche dans la ville", "AGEF, Agence de Gestion Foncière"),
  p(11, 1080, 720, "events", "event", "Photo d'équipe", "AGEF, Agence de Gestion Foncière"),
];
