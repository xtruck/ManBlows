import type { NextConfig } from "next";

// GitHub Pages serves the site under /ManBlows; the Pages workflow sets this.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export", // static site for GitHub Pages (no server features like cacheComponents)
  basePath,
  trailingSlash: true, // /travaux/ -> travaux/index.html, which GitHub Pages serves directly
  devIndicators: false, // hide the Next.js "N" badge shown over the page in development
  images: {
    // Static export: images are pre-sized WebP files in /public, so no optimizer is needed.
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
