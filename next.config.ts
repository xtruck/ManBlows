import type { NextConfig } from "next";

// GitHub Pages serves the site under /ManBlows; the Pages workflow sets this.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export", // static site for GitHub Pages (no server features like cacheComponents)
  basePath,
  trailingSlash: true, // /travaux/ -> travaux/index.html, which GitHub Pages serves directly
  images: {
    // Demo placeholders; swap for the client's own photos in /public later.
    remotePatterns: [new URL("https://picsum.photos/**")],
    // picsum redirects slowly and makes the optimizer time out (504); the browser
    // loads placeholders directly. Remove once real photos live in /public.
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
