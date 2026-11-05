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
    // Static export: no optimizer. The loader maps each srcset width to a pre-sized WebP copy
    // in /public (scripts/make-thumbs.mjs), so phones fetch small files and desktops large ones.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    imageSizes: [400],
    deviceSizes: [480, 640, 828, 1080, 1400, 1920],
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
