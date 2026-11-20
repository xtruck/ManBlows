/**
 * The pages of the site, in menu order. `craft` ties a page to one of the four crafts (its band
 * lights up in the page transition). Travaux, the gallery of everything, stays out of the desktop
 * bar (`bar: false`): each craft has its own page there, and Travaux is reached from the menu,
 * the home page and the footer.
 */
export const routes = [
  { href: "/", key: "home", bar: false },
  { href: "/photo/", key: "photo", craft: 0, bar: true },
  { href: "/films/", key: "reel", craft: 1, bar: true },
  { href: "/design/", key: "design", craft: 2, bar: true },
  { href: "/web/", key: "web", craft: 3, bar: true },
  { href: "/travaux/", key: "work", bar: false },
  { href: "/a-propos/", key: "about", bar: true },
  { href: "/contact/", key: "contact", bar: true },
] as const;

export type RouteKey = (typeof routes)[number]["key"];

/** Pathnames compared with a trailing slash, matching `trailingSlash: true`. */
export const normalize = (path: string) => (path.endsWith("/") ? path : `${path}/`);
