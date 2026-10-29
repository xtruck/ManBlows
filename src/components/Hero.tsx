"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Logo } from "./Logo";
import { useLang } from "./LangProvider";
import { TransitionLink } from "./TransitionProvider";
import { LightLeaks } from "./LightLeaks";
import { onIntroDone, onSceneReady } from "@/lib/intro";
import { useMedia } from "@/lib/useMedia";

gsap.registerPlugin(ScrollTrigger);

const CameraScene = dynamic(() => import("./CameraScene"), { ssr: false });

const corners = [
  "top-0 left-0 border-t-2 border-l-2",
  "top-0 right-0 border-t-2 border-r-2",
  "bottom-0 left-0 border-b-2 border-l-2",
  "bottom-0 right-0 border-b-2 border-r-2",
];

/**
 * The site opens through a viewfinder on a 3D camera. Scrolling turns the camera
 * to face you, flies into the lens, and light through the aperture opens onto the work.
 */
export function Hero() {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null);
  const timecode = useRef<HTMLSpanElement>(null);
  const progress = useRef(0);
  const compact = useMedia("(max-width: 767px)");
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const [active, setActive] = useState(true);

  // Pause the 3D render once the hero has scrolled away.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Running timecode at 25 fps, written straight to the DOM to avoid re-renders.
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const pad = (n: number) => String(n).padStart(2, "0");
    const loop = () => {
      const ms = performance.now() - start;
      const s = Math.floor(ms / 1000);
      const frames = Math.floor((ms % 1000) / 40);
      if (timecode.current) {
        timecode.current.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(frames)}`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.set("[data-hero-3d]", { autoAlpha: 0 });
      if (reduced) return;

      gsap.set("[data-corner]", { autoAlpha: 0, scale: 1.6 });
      gsap.set("[data-logo-word]", { yPercent: 60, autoAlpha: 0 });
      gsap.set("[data-logo-script]", { clipPath: "inset(-20% 100% -20% 0)" });
      gsap.set("[data-hero-fade]", { y: 20, autoAlpha: 0 });

      // One scrubbed timeline drives the DOM layers; the 3D scene reads `progress`.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
              progress.current = self.progress;
            },
          },
        })
        .to("[data-hero-ui]", { autoAlpha: 0, y: -40, duration: 0.25, ease: "none" }, 0)
        .to("[data-hero-frame]", { autoAlpha: 0, scale: 1.08, duration: 0.3, ease: "none" }, 0.05)
        .fromTo("[data-hero-lens]", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.12, ease: "none" }, 0.3)
        .to("[data-hero-lens]", { autoAlpha: 0, y: -30, duration: 0.1, ease: "none" }, 0.58)
        .fromTo(
          "[data-hero-iris]",
          { clipPath: "circle(0% at 50% 50%)" },
          { clipPath: "circle(75% at 50% 50%)", duration: 0.16, ease: "power2.in" },
          0.84,
        );
    }, el);

    // Fade the 3D camera in once it's loaded, and play the entrance after the preloader.
    const offScene = onSceneReady(() => {
      ctx.add(() => gsap.to("[data-hero-3d]", { autoAlpha: 1, duration: 1.2, ease: "power2.out" }));
    });
    const offIntro = reduced
      ? () => {}
      : onIntroDone(() => {
          ctx.add(() => {
            gsap
              .timeline()
              .to("[data-corner]", { autoAlpha: 1, scale: 1, duration: 0.9, ease: "expo.out", stagger: 0.05 }, 0.1)
              .to("[data-logo-word]", { yPercent: 0, autoAlpha: 1, duration: 1, ease: "expo.out" }, 0.2)
              .to("[data-logo-script]", { clipPath: "inset(-20% 0% -20% 0)", duration: 1.1, ease: "power2.inOut" }, 0.4)
              .to("[data-hero-fade]", { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out", stagger: 0.08 }, 0.55);
          });
        });

    return () => {
      offScene();
      offIntro();
      ctx.revert();
    };
  }, [reduced]);

  return (
    <section ref={root} id="top" className={`relative bg-ink ${reduced ? "h-[100svh]" : "h-[230svh] md:h-[280svh]"}`}>
      <div className="sticky top-0 isolate h-[100svh] min-h-[620px] overflow-hidden text-paper">
        {/* Studio backdrop with warm light leaks */}
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_70%_60%_at_62%_45%,#2e2b28_0%,#0e0e0e_70%)] max-md:bg-[radial-gradient(ellipse_90%_50%_at_50%_38%,#2e2b28_0%,#0e0e0e_75%)]" />
        <LightLeaks className="opacity-60" />

        <div data-hero-3d className="absolute inset-0">
          <CameraScene progress={progress} compact={compact} active={active} />
        </div>

        {/* Viewfinder frame */}
        <div data-hero-frame aria-hidden className="pointer-events-none absolute inset-3 top-20 md:inset-8 md:top-24">
          {corners.map((c) => (
            <span key={c} data-corner className={`absolute size-7 border-paper/80 md:size-12 ${c}`} />
          ))}
          <div data-hero-fade className="absolute top-4 left-4 flex items-center gap-2 text-xs md:top-6 md:left-6 md:text-sm">
            <span className="rec-dot size-2 rounded-full bg-[#ff3b30]" />
            <span className="font-medium">REC</span>
            <span ref={timecode} className="tabular-nums text-paper/80">
              00:00:00:00
            </span>
          </div>
          <div
            data-hero-fade
            className="absolute top-4 right-4 hidden gap-5 text-sm text-paper/70 tabular-nums md:top-6 md:right-6 md:flex"
          >
            <span>ISO 400</span>
            <span>1/125</span>
            <span>f/2.8</span>
          </div>
        </div>

        <div
          data-hero-ui
          className="absolute inset-x-5 bottom-8 flex flex-col gap-7 md:inset-x-14 md:bottom-14 lg:flex-row lg:items-end lg:justify-between"
        >
          <h1 className="pt-[0.6em]">
            <Logo tone="paper" className="text-[23vw] md:text-[15vw] lg:text-[11vw]" />
          </h1>
          <div className="max-w-sm lg:pb-[1.2vw]">
            <p data-hero-fade className="text-lg leading-snug text-paper/90 md:text-xl">
              {t.hero.line}
            </p>
            <div data-hero-fade className="mt-6 flex items-center gap-5">
              <TransitionLink
                href="/travaux/"
                data-magnetic
                className="flex h-12 items-center rounded-full bg-paper px-6 text-sm font-medium text-ink transition-transform duration-200 hover:scale-[1.03] active:scale-95"
              >
                {t.hero.cta}
              </TransitionLink>
              <span className="flex items-center gap-2 text-sm text-paper/75">
                <span className="size-1.5 rounded-full bg-brand" />
                {t.hero.status}
              </span>
            </div>
          </div>
        </div>

        <p
          data-hero-lens
          className="pointer-events-none invisible absolute inset-x-4 bottom-[12svh] text-center font-display text-[clamp(1.8rem,4.5vw,3.6rem)] font-semibold tracking-[-0.03em] text-paper"
        >
          {t.hero.lens}
        </p>

        {/* Light through the aperture: opens onto the paper-coloured work section */}
        <div data-hero-iris aria-hidden className="pointer-events-none absolute inset-0 bg-paper [clip-path:circle(0%_at_50%_50%)]" />
      </div>
    </section>
  );
}
