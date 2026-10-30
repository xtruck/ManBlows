import type { MetadataRoute } from "next";

export const dynamic = "force-static"; // generated once at build time for the static export

const site = `https://xtruck.github.io${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}`;

/** Lets search engines read the whole site and points them to the sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site}/sitemap.xml`,
  };
}
