"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLang } from "./LangProvider";
import { normalize, routes } from "@/lib/routes";

/**
 * The page titles are written in French in each page's metadata (static export). This keeps the
 * browser tab title in step with the chosen language, and puts it back if the router rewrites it.
 */
export function TitleSync() {
  const { t } = useLang();
  const pathname = normalize(usePathname());

  useEffect(() => {
    const route = routes.find((r) => r.href === pathname);
    if (!route) return; // the "not found" page keeps its own title
    const title = route.key === "home" ? t.meta.home : `${t.nav[route.key]} | EGC Studio`;
    const apply = () => {
      if (document.title !== title) document.title = title;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [t, pathname]);

  return null;
}
