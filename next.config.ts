import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
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
