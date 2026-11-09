import type { MetadataRoute } from "next";

export const dynamic = "force-static"; // generated once at build time for the static export

const site = `https://xtruck.github.io${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}`;

/** The pages of the site (trailing slashes match the static export). */
export default function sitemap(): MetadataRoute.Sitemap {
  // No lastModified: a date that changes on every build tells crawlers every page changed every time
  return ["/", "/travaux/", "/films/", "/web/", "/a-propos/", "/contact/"].map((path) => ({ url: `${site}${path}` }));
}
