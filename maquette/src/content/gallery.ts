import type { EventFormat, GalleryImage, Specialty } from "./types";

/**
 * Visuels de démonstration générés (aucune photo de l'établissement n'est utilisée).
 * Remplacez les fichiers de /public/images par les photos fournies et autorisées,
 * puis lancez `python3 scripts/images.py manifest public/images src/content/images.generated.json`.
 */
export const gallery: GalleryImage[] = [
  { file: "plat-1.webp", alt: "Visuel de démonstration d'une assiette de grillades", caption: "Grillades (visuel de démonstration)", category: "plats" },
  { file: "ambiance-1.webp", alt: "Visuel de démonstration d'une terrasse de nuit", caption: "La terrasse (visuel de démonstration)", category: "ambiance" },
  { file: "evenement-1.webp", alt: "Visuel de démonstration d'une salle décorée", caption: "Salle de fête (visuel de démonstration)", category: "evenements" },
  { file: "plat-2.webp", alt: "Visuel de démonstration d'un plat ivoirien", caption: "Plat ivoirien (visuel de démonstration)", category: "plats" },
  { file: "ambiance-2.webp", alt: "Visuel de démonstration d'un bar lounge", caption: "Le lounge (visuel de démonstration)", category: "ambiance" },
  { file: "plat-3.webp", alt: "Visuel de démonstration d'accompagnements", caption: "Accompagnements (visuel de démonstration)", category: "plats" },
  { file: "evenement-2.webp", alt: "Visuel de démonstration d'un anniversaire", caption: "Anniversaire (visuel de démonstration)", category: "evenements" },
  { file: "ambiance-3.webp", alt: "Visuel de démonstration d'une soirée", caption: "Soirée (visuel de démonstration)", category: "ambiance" },
];

export const heroImage = { file: "hero.webp", alt: "Visuel de démonstration d'une terrasse animée le soir" };

export const eventFormats: EventFormat[] = [
  {
    title: "Location de salle",
    description: "Activité mentionnée dans les publications de l'établissement ; conditions, capacité et tarifs à confirmer.",
    capacity: { value: "Capacité à confirmer", status: "demo" },
    status: "public",
  },
  { title: "Anniversaires", description: "Espace réservé, formule repas et boissons (exemple).", capacity: { value: "Capacité à confirmer", status: "demo" }, status: "demo" },
  { title: "Baptêmes & fêtes de famille", description: "Accueil de vos proches pour les grandes occasions (exemple).", capacity: { value: "Capacité à confirmer", status: "demo" }, status: "demo" },
  { title: "Réunions & associations", description: "Rencontres, assemblées, afterworks (exemple).", capacity: { value: "Capacité à confirmer", status: "demo" }, status: "demo" },
];

export const specialties: Specialty[] = [];
