export const routes = [
  { href: "/", key: "home" },
  { href: "/travaux/", key: "work" },
  { href: "/films/", key: "reel" },
  { href: "/a-propos/", key: "about" },
  { href: "/contact/", key: "contact" },
] as const;

export type RouteKey = (typeof routes)[number]["key"];

/** Pathnames compared with a trailing slash, matching `trailingSlash: true`. */
export const normalize = (path: string) => (path.endsWith("/") ? path : `${path}/`);
