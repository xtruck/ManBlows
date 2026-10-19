import type { Fact } from "@/content/types";

/** Demo mode is the default: banner on every page and no search-engine indexing. */
export const isDemo = process.env.NEXT_PUBLIC_SITE_MODE !== "production";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/**
 * The WhatsApp number comes from the environment, or from the config only once the
 * establishment has confirmed it. A demo build never opens a chat with a real number.
 */
export function resolveWhatsapp(configured: Fact | null): string | null {
  const fromEnv = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");
  if (fromEnv.length >= 8) return fromEnv;
  if (configured?.status === "confirme") return configured.value.replace(/\D/g, "");
  return null;
}

export function telHref(fact: Fact | null): string | null {
  if (!fact || fact.status !== "confirme") return null;
  return `tel:${fact.value.replace(/[^\d+]/g, "")}`;
}
