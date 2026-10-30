"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { useMotionMode } from "@/lib/motion";

/**
 * Small premium touches, one per input type:
 * - mouse: elements with data-magnetic lean toward the cursor and spring back
 * - touch: a short vibration on taps of links and buttons (Android; iOS ignores it)
 */
export function Interactions() {
  const pathname = usePathname();
  const mode = useMotionMode();

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = mode === "gentle";
    const cleanups: (() => void)[] = [];

    if (fine && !reduced) {
      document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
        const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
        const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          x((e.clientX - (r.left + r.width / 2)) * 0.3);
          y((e.clientY - (r.top + r.height / 2)) * 0.3);
        };
        const leave = () => {
          gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
          gsap.set(el, { x: 0, y: 0 });
        });
      });
    }

    if (!fine && "vibrate" in navigator) {
      const tap = (e: PointerEvent) => {
        if ((e.target as HTMLElement).closest("a, button")) navigator.vibrate(8);
      };
      document.addEventListener("pointerdown", tap, { passive: true });
      cleanups.push(() => document.removeEventListener("pointerdown", tap));
    }

    return () => cleanups.forEach((fn) => fn());
  }, [pathname, mode]);

  return null;
}
