"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onIntroDone } from "@/lib/intro";

gsap.registerPlugin(ScrollTrigger);

/**
 * "Mise au point": the photo unveils out of focus, an autofocus reticle locks onto it,
 * a small flash confirms, and the image snaps sharp. The blur is only applied while
 * animating and removed afterwards, so it costs nothing at rest.
 */
function focusPull(el: HTMLElement, delay: number, scrollTrigger: ScrollTrigger.Vars) {
  const img = el.querySelector<HTMLElement>("img");
  const reticle = document.createElement("span");
  reticle.className = "af-reticle";
  reticle.setAttribute("aria-hidden", "true");
  reticle.innerHTML = "<i></i><i></i><i></i><i></i>";
  el.appendChild(reticle);

  gsap.set(el, { clipPath: "inset(100% 0% 0% 0%)", y: 40 });
  if (img) gsap.set(img, { filter: "blur(16px)", scale: 1.12 });

  gsap
    .timeline({ delay, scrollTrigger, onComplete: () => reticle.remove() })
    .to(el, { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 1.1, ease: "expo.out" }, 0)
    .fromTo(reticle, { autoAlpha: 0, scale: 1.5 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "power3.out" }, 0.35)
    .to(img ?? el, { filter: "blur(0px)", scale: 1, duration: 0.7, ease: "power2.out", clearProps: "filter,transform" }, 0.55)
    .to(reticle, { autoAlpha: 0, duration: 0.3, ease: "power1.in" }, 1.05);
}

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
              focusPull(el, delay, scrollTrigger);
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
