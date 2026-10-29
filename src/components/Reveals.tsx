"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onIntroDone } from "@/lib/intro";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll reveals for every page, driven by data attributes so they work the same
 * on touch screens (no hover needed):
 *   data-reveal         text and blocks rise and fade in
 *   data-reveal="image" images unveil from the bottom edge
 */
export function Reveals() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx: gsap.Context | null = null;
    let raf = 0;

    const off = onIntroDone(() => {
      raf = requestAnimationFrame(() => {
        ctx = gsap.context(() => {
          gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
            // Things already on screen wait for the page curtain to lift.
            const delay = ScrollTrigger.isInViewport(el) ? 0.35 : 0;
            const scrollTrigger = { trigger: el, start: "top 92%", once: true };
            if (el.dataset.reveal === "image") {
              gsap.fromTo(
                el,
                { clipPath: "inset(100% 0% 0% 0%)", y: 40 },
                { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 1.2, ease: "expo.out", delay, scrollTrigger },
              );
            } else {
              gsap.from(el, { y: 36, autoAlpha: 0, duration: 0.9, ease: "power3.out", delay, scrollTrigger });
            }
          });
          ScrollTrigger.refresh();
        });
      });
    });

    return () => {
      off();
      cancelAnimationFrame(raf);
      ctx?.revert();
    };
  }, [pathname]);

  return null;
}
