import type { MetadataRoute } from "next";
import { isDemo, siteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  if (isDemo) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: "/api/" }, sitemap: `${siteUrl}/sitemap.xml` };
}
