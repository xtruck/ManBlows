import type { MetadataRoute } from "next";

export const dynamic = "force-static"; // generated once at build time for the static export

const site = `https://xtruck.github.io${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}`;

/** The five pages of the site (trailing slashes match the static export). */
export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/travaux/", "/films/", "/a-propos/", "/contact/"].map((path) => ({
    url: `${site}${path}`,
    lastModified: new Date(),
  }));
}
