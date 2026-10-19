import type { MetadataRoute } from "next";
import { copy } from "@/content/site";
import { units } from "@/content/units";
import { siteUrl } from "@/lib/env";
import { publishedNews } from "@/lib/news";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", copy.unitsPath, copy.admissionsPath, "/actualites", "/contact", "/confidentialite", "/maquette"];
  return [
    ...pages.map((p) => ({ url: `${siteUrl}${p}`, priority: p === "" ? 1 : 0.7 })),
    ...units.map((u) => ({ url: `${siteUrl}${copy.unitsPath}/${u.slug}`, priority: 0.8 })),
    ...publishedNews().map((n) => ({ url: `${siteUrl}/actualites/${n.slug}`, lastModified: n.date, priority: 0.5 })),
  ];
}
