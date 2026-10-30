"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotionMode } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);
// Mobile address bars resize the viewport while scrolling; don't recalc triggers for that.
ScrollTrigger.config({ ignoreMobileResize: true });

let instance: Lenis | null = null;

/** The shared Lenis instance, or null when reduced motion is on. */
export const getLenis = () => instance;

export function SmoothScroll() {
  const mode = useMotionMode();

  useEffect(() => {
    if (mode === "gentle") return;

    const lenis = new Lenis({ lerp: 0.1 });
    instance = lenis;

    // Keep ScrollTrigger in step with Lenis and drive both from GSAP's ticker.
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      instance = null;
    };
  }, [mode]);

  return null;
}
