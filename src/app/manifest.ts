import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EGC Studio",
    short_name: "EGC Studio",
    description: "Photo, vidéo et design graphique à Abidjan.",
    start_url: `${base}/`,
    scope: `${base}/`,
    display: "browser",
    background_color: "#0e0e0e",
    theme_color: "#ffc400",
    lang: "fr",
    icons: [{ src: `${base}/logo-256.png`, sizes: "256x256", type: "image/png" }],
  };
}
