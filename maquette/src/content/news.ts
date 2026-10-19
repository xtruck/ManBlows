import type { NewsItem } from "./types";

/**
 * ACTUALITÉS — articles de démonstration (fictifs). L'ordre du tableau n'a pas d'importance :
 * le site trie par date et masque les articles datés dans le futur (src/lib/news.ts).
 */
export const news: NewsItem[] = [
  {
    slug: "rentree-academique",
    title: "Rentrée académique : les informations pratiques",
    date: "2026-10-05",
    category: "Vie étudiante",
    excerpt: "Exemple d'article : calendrier de la rentrée, accueil des nouveaux étudiants, emplois du temps.",
    body: ["Article de démonstration : le contenu réel sera fourni par l'institut."],
    image: "actu-1.webp",
    status: "demo",
  },
  {
    slug: "journee-orientation",
    title: "Journée d'orientation : quelle filière après le bac ?",
    date: "2026-07-18",
    category: "Orientation",
    excerpt: "Exemple d'article : présentation des filières, rencontre avec les enseignants et d'anciens étudiants.",
    body: ["Article de démonstration."],
    image: "actu-2.webp",
    status: "demo",
  },
  {
    slug: "stages-entreprises",
    title: "Stages : des partenariats avec les entreprises de la zone",
    date: "2026-05-02",
    category: "Partenariats",
    excerpt: "Exemple d'article : stages de fin de cycle et entreprises partenaires (à confirmer).",
    body: ["Article de démonstration. Les partenariats réels seront présentés avec l'accord des entreprises."],
    image: "actu-3.webp",
    status: "demo",
  },
];
