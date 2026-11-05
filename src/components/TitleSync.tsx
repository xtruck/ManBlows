"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLang } from "./LangProvider";
import { normalize, routes } from "@/lib/routes";

/**
 * The page titles are written in French in each page's metadata (static export). This keeps the
 * browser tab title and the page description in step with the chosen language, and puts them back
 * if the router rewrites them.
 */
export function TitleSync() {
  const { t } = useLang();
  const pathname = normalize(usePathname());

  useEffect(() => {
    const route = routes.find((r) => r.href === pathname);
    if (!route) return; // the "not found" page keeps its own title
    const title = route.key === "home" ? t.meta.home : `${t.nav[route.key]} | EGC Studio`;
    const description = t.meta.description;
    const apply = () => {
      if (document.title !== title) document.title = title;
      const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (meta && meta.content !== description) meta.content = description;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [t, pathname]);

  return null;
}
