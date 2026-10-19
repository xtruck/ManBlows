import type { MetadataRoute } from "next";
import { specialties } from "@/content/gallery";
import { copy } from "@/content/site";
import { siteUrl } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/menu", "/galerie", "/reservation", "/contact", "/maquette"];
  if (specialties.length > 0) routes.push("/specialites");
  if (!copy.reservationIncludesEvents) routes.push("/evenements");
  return routes.map((r) => ({ url: `${siteUrl}${r}`, changeFrequency: r === "/menu" ? "weekly" : "monthly", priority: r === "" ? 1 : 0.7 }));
}
