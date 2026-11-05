"use client";

// Picks a pre-sized file for next/image's srcset (the static export has no image optimizer).
// Work images exist at 400px (xs), 640px (sm) and full size; film posters at 480px (sm) and full.
// Made by scripts/make-thumbs.mjs. Anything else is served as is.

export default function imageLoader({ src, width }: { src: string; width: number }) {
  const work = src.match(/^(.*\/work\/)(?:sm\/|xs\/)?([^/]+)$/);
  if (work) {
    const [, dir, file] = work;
    if (width <= 400) return `${dir}xs/${file}`;
    if (width <= 640) return `${dir}sm/${file}`;
    return `${dir}${file}`;
  }
  const poster = src.match(/^(.*\/films\/)(?:sm\/)?([^/]+-poster\.webp)$/);
  if (poster) {
    const [, dir, file] = poster;
    return width <= 480 ? `${dir}sm/${file}` : `${dir}${file}`;
  }
  return src;
}
