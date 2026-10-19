import type { Metadata } from "next";
import { site } from "@/content/site";
import { isDemo, siteUrl } from "./env";

export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}${path}` },
    openGraph: {
      title: `${title} · ${site.name}`,
      description,
      url: `${siteUrl}${path}`,
      siteName: site.name,
      locale: "fr_CI",
      type: "website",
    },
  };
}

/**
 * schema.org data for local search. Only confirmed details are emitted, so a demo build
 * never publishes an unverified phone number or opening hours as structured data.
 */
export function organizationJsonLd() {
  const c = site.contact;
  const confirmed = <T,>(fact: { status: string } | null, value: T) => (fact && fact.status === "confirme" ? value : undefined);
  return {
    "@context": "https://schema.org",
    "@type": site.schemaType,
    name: site.name,
    description: site.description,
    url: siteUrl,
    image: `${siteUrl}/images/hero.webp`,
    address: {
      "@type": "PostalAddress",
      streetAddress: c.address.status === "demo" ? undefined : c.address.value,
      addressLocality: site.locality,
      addressRegion: site.district,
      addressCountry: "CI",
    },
    telephone: confirmed(c.phone, c.phone?.value),
    email: confirmed(c.email, c.email?.value),
    openingHours: c.hours.status === "confirme" ? c.hours.rows.map((r) => `${r.days} ${r.hours}`) : undefined,
    sameAs: site.social.filter((s) => s.status === "confirme").map((s) => s.url),
    ...(isDemo ? { disambiguatingDescription: "Maquette de démonstration non publiée." } : {}),
  };
}
