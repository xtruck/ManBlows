import { news } from "@/content/news";

/**
 * News sorted from the most recent, without future-dated items: the audit of the current site
 * found articles out of order and one dated in the future, so both are prevented here by code.
 */
export function publishedNews(today = new Date().toISOString().slice(0, 10)) {
  return news.filter((n) => /^\d{4}-\d{2}-\d{2}$/.test(n.date) && n.date <= today).sort((a, b) => b.date.localeCompare(a.date));
}

export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
