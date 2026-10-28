"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Logo } from "./Logo";
import { useLang } from "./LangProvider";
import { markIntroDone, onSceneReady } from "@/lib/intro";

/** Yellow brand screen: "egu" is written in, the counter runs, then a shutter opens on the hero. */
export function Preloader() {
  const { t } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    let seen = false;
    try {
      seen = sessionStorage.getItem("egu-intro") === "1";
    } catch {}
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Mark the intro as seen only once it has played, so a re-run effect doesn't skip it.
    const finish = () => {
      try {
        sessionStorage.setItem("egu-intro", "1");
      } catch {}
      document.documentElement.style.overflow = "";
      setGone(true);
      markIntroDone();
    };

    document.documentElement.style.overflow = "hidden";

    // Returning visitors and reduced motion get a short fade, not the full intro.
    if (seen || reduced) {
      const tween = gsap.to(el, { autoAlpha: 0, duration: 0.35, delay: 0.1, onComplete: finish });
      return () => {
        tween.kill();
      };
    }

    let stopWaiting = () => {};
    let fallback = 0;

    const ctx = gsap.context(() => {
      const count = { v: 0 };
      const render = () => {
        if (counter.current) counter.current.textContent = String(Math.round(count.v)).padStart(3, "0");
        gsap.set("[data-pre-bar]", { scaleX: count.v / 100 });
      };

      const tl = gsap
        .timeline({ onComplete: finish })
        .from("[data-logo-word]", { y: 40, autoAlpha: 0, duration: 0.8, ease: "power3.out" }, 0.1)
        .fromTo(
          "[data-logo-script]",
          { clipPath: "inset(-20% 100% -20% 0)" },
          { clipPath: "inset(-20% 0% -20% 0)", duration: 1.2, ease: "power2.inOut" },
          0.35,
        )
        .to(count, { v: 90, duration: 1.5, ease: "power1.inOut", onUpdate: render }, 0)
        // Hold at 90 until the 3D camera has loaded (capped at 8 s on slow networks).
        .add(() => {
          let resumed = false;
          const resume = () => {
            if (resumed) return;
            resumed = true;
            window.clearTimeout(fallback);
            tl.resume();
          };
          tl.pause();
          stopWaiting = onSceneReady(resume);
          fallback = window.setTimeout(resume, 8000);
        })
        .to(count, { v: 100, duration: 0.35, ease: "power2.out", onUpdate: render })
        .to(el, { clipPath: "inset(50% 0% 50% 0%)", duration: 0.9, ease: "expo.inOut" }, "+=0.1");
    }, el);

    return () => {
      stopWaiting();
      window.clearTimeout(fallback);
      ctx.revert();
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={root}
      aria-hidden
      className="fixed inset-0 z-[100] flex items-center justify-center bg-brand text-ink"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
    >
      <Logo className="text-[25vw] md:text-[10vw]" scriptClassName="[clip-path:inset(-20%_100%_-20%_0)]" />
      <span data-pre-bar className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-ink" />
      <div className="absolute inset-x-4 bottom-6 flex items-end justify-between text-sm md:inset-x-8 md:bottom-8">
        <span>{t.preloader}</span>
        <span ref={counter} className="font-display text-5xl tabular-nums tracking-tight md:text-7xl">
          000
        </span>
      </div>
    </div>
  );
}
