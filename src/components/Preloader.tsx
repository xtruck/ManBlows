"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Logo } from "./Logo";
import { LightLeaks } from "./LightLeaks";
import { CraftMotif } from "./CraftMotif";
import { useLang } from "./LangProvider";
import { INTRO_SEEN_KEY, markIntroDone } from "@/lib/intro";
import { motionMode } from "@/lib/motion";

const MAX_WAIT_MS = 3500; // never hold the visitor longer than this for the fonts

/**
 * First load of a visit: the four-craft prism turns through Photo, Vidéo, Design and Web while
 * a counter runs, then brand yellow floods the screen, the logo is written in, and the shutter
 * opens onto the site. Later loads in the same visit get a short fade (see layout.tsx).
 */
export function Preloader() {
  const { t } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const prism = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = root.current;
    const pr = prism.current;
    if (!el || !pr) return;
    const reduced = motionMode() === "gentle";

    // The intro replays on a full load, so start at the top (phones restore the old position).
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.documentElement.style.overflow = "hidden";

    const finish = () => {
      window.scrollTo(0, 0);
      document.documentElement.style.overflow = "";
      try {
        sessionStorage.setItem(INTRO_SEEN_KEY, "1");
      } catch {}
      setGone(true);
      markIntroDone();
    };

    const fonts = document.fonts?.ready ?? Promise.resolve();

    // Already seen in this visit: just lift the dark cover once fonts are in.
    if (document.documentElement.dataset.intro === "quick") {
      let tween: gsap.core.Tween | null = null;
      let cancelled = false;
      Promise.race([fonts, new Promise((r) => setTimeout(r, 800))]).then(() => {
        if (cancelled) return;
        tween = gsap.to(el, { autoAlpha: 0, duration: reduced ? 0.25 : 0.4, ease: "power1.out", onComplete: finish });
      });
      return () => {
        cancelled = true;
        tween?.kill();
        document.documentElement.style.overflow = "";
      };
    }

    const ctx = gsap.context(() => {
      const depth = pr.offsetWidth / 2;
      gsap.set(pr, { z: -depth, rotationY: 0 });
      const count = { v: 0 };
      const show = () => {
        if (counter.current) counter.current.textContent = String(Math.round(count.v)).padStart(3, "0");
      };

      // One full turn of the prism, a quarter per craft, with the counter running alongside.
      const spin = gsap.timeline();
      spin.fromTo("[data-pre-prism]", { autoAlpha: 0, scale: 0.86 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "expo.out" }, 0);
      if (!reduced) {
        for (let k = 1; k <= 4; k++) spin.to(pr, { rotationY: -90 * k, duration: 0.45, ease: "power3.inOut" }, 0.25 + (k - 1) * 0.42);
      }
      spin.to(count, { v: 100, duration: reduced ? 1 : 1.95, ease: "power1.inOut", onUpdate: show }, 0);

      // Outro once the turn is done and fonts are ready (or after MAX_WAIT_MS at worst).
      const ready = Promise.all([
        new Promise((r) => spin.eventCallback("onComplete", r)),
        Promise.race([fonts, new Promise((r) => setTimeout(r, MAX_WAIT_MS))]),
      ]);
      ready.then(() => {
        ctx.add(() => {
          gsap
            .timeline({ onComplete: finish })
            .to("[data-pre-hud]", { autoAlpha: 0, y: 8, duration: 0.3, ease: "power2.in" }, 0)
            .to("[data-pre-prism]", { scale: 1.12, autoAlpha: 0, duration: 0.45, ease: "power2.in" }, 0)
            .fromTo("[data-pre-flood]", { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)", duration: 0.6, ease: "expo.inOut" }, 0.1)
            .fromTo("[data-pre-logo]", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" }, 0.4)
            .fromTo("[data-pre-logo] [data-logo-script]", { clipPath: "inset(-20% 100% -20% 0)" }, { clipPath: "inset(-20% 0% -20% 0)", duration: 0.55, ease: "power2.inOut" }, 0.45)
            .to(el, { clipPath: "inset(50% 0% 50% 0%)", duration: 0.7, ease: "expo.inOut" }, 1.1);
        });
      });
    }, el);

    return () => {
      ctx.revert();
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (gone) return null;

  return (
    <>
      {/* The animation itself is decorative; this tells screen readers the site is loading. */}
      <p role="status" className="sr-only">
        {t.a11y.loading}
      </p>
      <div
        ref={root}
        aria-hidden
        data-preloader
        className="fixed inset-0 isolate z-[100] flex items-center justify-center overflow-hidden bg-ink text-paper"
        style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      >
        <LightLeaks className="opacity-50" />

        <div data-pre-prism style={{ perspective: "1200px" }}>
          <div ref={prism} className="relative aspect-[4/5] w-[min(52vw,15rem)] [transform-style:preserve-3d]">
            {t.crafts.map((c, i) => (
              <div
                key={c.key}
                className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[1.1rem] border border-paper/10 bg-[linear-gradient(160deg,#2a2826,#151413)] [backface-visibility:hidden]"
                style={{ transform: `rotateY(${i * 90}deg) translateZ(min(26vw, 7.5rem))` }}
              >
                <CraftMotif craft={c.key} />
                <span className="font-display text-[clamp(1.8rem,8vw,2.6rem)] font-semibold tracking-[-0.04em]">
                  {c.name}
                  <span className="text-brand">.</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Counter and studio name */}
        <div data-pre-hud className="absolute inset-x-5 bottom-6 flex items-end justify-between text-xs tracking-[0.25em] text-paper/60 uppercase md:inset-x-10 md:bottom-10">
          <span>EGC Studio</span>
          <span ref={counter} className="font-display text-4xl tracking-tight text-paper tabular-nums md:text-5xl">
            000
          </span>
        </div>

        {/* Brand-yellow flood with the logo, before the shutter opens */}
        <div data-pre-flood className="absolute inset-0 flex items-center justify-center bg-brand [clip-path:circle(0%_at_50%_50%)]">
          <div data-pre-logo className="pt-[0.6em] text-[clamp(3.5rem,16vw,9rem)] opacity-0">
            <Logo tone="ink" />
          </div>
        </div>
      </div>
    </>
  );
}
