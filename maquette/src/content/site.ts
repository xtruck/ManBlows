import type { SiteConfig } from "./types";

const SOURCES = "Pages indexées de institutlkm.ci et annuaires (abidjan.net, upesup.ci), recherche du 19/10/2026";

export const site: SiteConfig = {
  name: "Institut LKM",
  shortName: "LKM",
  schemaType: "CollegeOrUniversity",
  tagline: "Institut Loukou Kouadio Michel · formations professionnelles à Yopougon",
  description:
    "Maquette de démonstration pour l'Institut LKM (Loukou Kouadio Michel) à Yopougon : catalogue des formations, fiches filières, admissions, actualités et demande de renseignements.",
  locality: "Abidjan",
  district: "Yopougon",
  keywords: ["BTS Yopougon", "Institut LKM", "école supérieure Yopougon", "licence professionnelle Abidjan", "BTS informatique Abidjan"],
  nav: [
    { href: "/", label: "Accueil" },
    { href: "/formations", label: "Formations" },
    { href: "/admissions", label: "Admissions" },
    { href: "/actualites", label: "Actualités" },
    { href: "/contact", label: "Contact" },
  ],
  primaryCta: { href: "/contact", label: "Demander des renseignements" },
  contact: {
    address: {
      value: "Yopougon Ananeraie, route de Dabou, Abidjan (adresse exacte à confirmer)",
      status: "public",
      source: SOURCES,
    },
    // Public sources list different numbers: none is shown until the institute confirms one.
    phone: { value: "Numéro à confirmer", status: "demo" },
    email: null,
    whatsapp: null,
    whatsappMessage: "Bonjour, je souhaite des renseignements sur les formations de l'Institut LKM.",
    mapsQuery: "Institut LKM Yopougon Ananeraie Abidjan",
    hours: {
      status: "demo",
      source: "Aucune source publique fiable pour les horaires (recherche du 19/10/2026).",
      rows: [{ days: "Secrétariat", hours: "Horaires à confirmer" }],
    },
  },
  social: [],
};

/** Labels and routes shared by the education template. */
export const copy = {
  heroEyebrow: "Enseignement supérieur · Yopougon",
  heroTitle: "Choisissez votre formation, préparez votre avenir professionnel.",
  heroText:
    "BTS et licences professionnelles en gestion, informatique, logistique et ressources humaines. Comparez les filières, consultez les conditions d'admission et demandez des renseignements en ligne.",
  unitsLabel: "Formations",
  unitsPath: "/formations",
  unitsIntro: "Filtrez par domaine ou par niveau. Chaque fiche présente la durée, le diplôme visé, les conditions d'admission et les débouchés (à confirmer par l'institut).",
  unitSingular: "formation",
  admissionsLabel: "Admissions",
  admissionsPath: "/admissions",
  profils: [
    { value: "etudiant", label: "Futur étudiant" },
    { value: "parent", label: "Parent" },
    { value: "entreprise", label: "Entreprise / partenaire" },
    { value: "autre", label: "Autre" },
  ],
  pathways: [
    { title: "Découvrir les formations", text: "BTS et licences professionnelles, par domaine.", href: "/formations" },
    { title: "Comprendre l'admission", text: "Étapes, conditions et calendrier de candidature.", href: "/admissions" },
    { title: "Poser une question", text: "Une demande en ligne, l'institut vous recontacte.", href: "/contact" },
  ],
};
