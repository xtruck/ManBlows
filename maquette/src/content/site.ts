import type { SiteConfig } from "./types";

const CHECKED = "consulté le 19/10/2026";

export const site: SiteConfig = {
  name: "Espace Kignon",
  shortName: "EK",
  schemaType: "Restaurant",
  tagline: "Resto · bar · lounge à Yopougon",
  description:
    "Maquette de démonstration pour Espace Kignon, resto-bar-lounge à Yopougon Maroc (Abidjan) : menu, terrasse, galerie, réservation et location de salle.",
  locality: "Abidjan",
  district: "Yopougon Maroc",
  keywords: ["restaurant Yopougon", "lounge Yopougon", "maquis Yopougon Maroc", "location salle Yopougon", "Espace Kignon"],
  nav: [
    { href: "/", label: "Accueil" },
    { href: "/menu", label: "Menu" },
    { href: "/galerie", label: "Galerie" },
    { href: "/evenements", label: "Location de salle" },
    { href: "/reservation", label: "Réservation" },
    { href: "/contact", label: "Contact" },
  ],
  primaryCta: { href: "/reservation", label: "Réserver une table" },
  contact: {
    address: {
      value: "Yopougon Maroc, carrefour Anador, Abidjan",
      status: "public",
      source: `Annuaires baab.ci et sikaplaces.com, ${CHECKED}`,
    },
    // Numbers are published on TikTok but not confirmed by the owner: not displayed.
    phone: { value: "Numéro à confirmer", status: "demo" },
    email: null,
    whatsapp: null,
    whatsappMessage: "Bonjour, je souhaite réserver une table à l'Espace Kignon.",
    mapsQuery: "Espace Kignon Yopougon Maroc carrefour Anador Abidjan",
    hours: {
      status: "demo",
      source: `Sources contradictoires : « fermé le lundi, 16h – minuit » (baab.ci) et « 12h – 23h tous les jours » (sikaplaces.com), ${CHECKED}`,
      rows: [{ days: "Horaires", hours: "à confirmer avec l'établissement" }],
    },
  },
  // Accounts seen in public results are not linked until the owner confirms which ones are official.
  social: [],
};

export const copy = {
  heroEyebrow: "Resto · Bar · Lounge · Yopougon",
  heroTitle: "Le goût d'ici, l'ambiance en plus.",
  heroText:
    "Spécialités ivoiriennes, terrasse en plein air et soirées entre amis au carrefour Anador. Consultez le menu, réservez votre table ou louez la salle pour vos événements.",
  heroLayout: "full" as "full" | "split",
  introTitle: "Un lieu pour manger, se retrouver et célébrer",
  introText:
    "Cette maquette montre comment Espace Kignon pourrait retrouver une présence en ligne claire et rapide. Textes et visuels sont des exemples à remplacer par les contenus fournis par l'établissement.",
  highlights: [
    { title: "Cuisine ivoirienne", text: "Les spécialités de la maison, à découvrir sur le menu." },
    { title: "Terrasse", text: "Un espace en plein air pour profiter des soirées de Yopougon." },
    { title: "Location de salle", text: "Anniversaires, baptêmes, réunions : faites votre demande en ligne." },
  ],
  reservationIntro:
    "Indiquez vos préférences : l'équipe vous recontacte pour confirmer. Aucune réservation n'est définitive avant cette confirmation.",
  reservationIncludesEvents: false,
};
