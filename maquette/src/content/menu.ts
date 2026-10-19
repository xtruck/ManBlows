import type { MenuCategory } from "./types";

/**
 * MENU — modifiez ce fichier pour mettre la carte à jour.
 * - `price`: montant en FCFA (nombre) ou `null` tant que le prix n'est pas communiqué.
 * - `status`: "demo" (exemple) ou "confirme" (validé par l'établissement).
 * Aucun prix n'est inventé. Les sources publiques mentionnent seulement des « spécialités ivoiriennes ».
 */
export const menu: MenuCategory[] = [
  {
    id: "braises",
    name: "À la braise",
    intro: "Grillades du soir.",
    items: [
      { name: "Poisson braisé", description: "Selon arrivage, sauce oignon-tomate pimentée (exemple).", price: null, tags: ["Populaire ?"], status: "demo" },
      { name: "Poulet braisé", description: "Mariné aux épices, servi avec attiéké (exemple).", price: null, status: "demo" },
      { name: "Choukouya", description: "Viande grillée aux oignons et piment (exemple).", price: null, status: "demo" },
      { name: "Brochettes", description: "Bœuf ou mouton (exemple).", price: null, status: "demo" },
    ],
  },
  {
    id: "plats",
    name: "Plats ivoiriens",
    intro: "Les classiques de la maison.",
    items: [
      { name: "Garba", description: "Attiéké et thon frit (exemple).", price: null, status: "demo" },
      { name: "Kedjenou", description: "Poulet mijoté à l'étouffée (exemple).", price: null, status: "demo" },
      { name: "Sauce graine", description: "Avec foutou ou riz (exemple).", price: null, status: "demo" },
      { name: "Placali sauce kplala", description: "Spécialité à confirmer selon les jours (exemple).", price: null, status: "demo" },
    ],
  },
  {
    id: "accompagnements",
    name: "Accompagnements",
    intro: "Au choix.",
    items: [
      { name: "Attiéké", description: "Semoule de manioc.", price: null, status: "demo" },
      { name: "Alloco", description: "Bananes plantain frites.", price: null, status: "demo" },
      { name: "Frites", description: "Pommes de terre ou igname.", price: null, status: "demo" },
    ],
  },
  {
    id: "bar",
    name: "Bar & lounge",
    intro: "À consommer avec modération.",
    items: [
      { name: "Bières locales", description: "Selon disponibilité (exemple).", price: null, status: "demo" },
      { name: "Cocktails maison", description: "Créations du bar (exemple).", price: null, status: "demo" },
      { name: "Bissap & gnamakoudji", description: "Boissons maison sans alcool.", price: null, tags: ["Sans alcool"], status: "demo" },
    ],
  },
];
