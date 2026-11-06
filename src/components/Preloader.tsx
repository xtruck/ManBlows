"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { Logo } from "./Logo";
import { LightLeaks } from "./LightLeaks";
import { CraftMotif } from "./CraftMotif";
import { useLang } from "./LangProvider";
import { INTRO_SEEN_KEY, markIntroDone, markIntroLeaving, setIntroHandoff } from "@/lib/intro";
import { motionMode } from "@/lib/motion";
import { crafts } from "@/content/crafts";

const MAX_WAIT_MS = 3500; // never hold the visitor longer than this for the fonts
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
// Same `sizes` as the hero prism, so the browser picks the same file and the hero gets it from cache.
const FACE_SIZES = "(min-width: 1024px) 26rem, 72vw";
// Stills for the film strip; it stops on the last one, the video craft's own image.
const STRIP = ["bols-du-bonheur", "archibat", "film-1452", "agef-investir", "film-2476"].map((n) => `${base}/films/${n}-poster.webp`);
// The photo phase opens on a burst, like continuous shooting, before the portrait that the hero shows.
const BURST = ["photo-04", "photo-05"].map((n) => `${base}/work/${n}.webp`);
const HANDLES = ["-top-1 -left-1", "-top-1 -right-1", "-bottom-1 -left-1", "-bottom-1 -right-1", "-top-1 left-1/2 -ml-1", "-bottom-1 left-1/2 -ml-1", "top-1/2 -left-1 -mt-1", "top-1/2 -right-1 -mt-1"];
const SWATCHES = ["#ffc400", "#ff5e5b", "#ece8e1", "#0e0e0e"];

const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");

/**
 * First load of a visit: one frame lives through the four crafts.
 * Photo: a burst of real photos, then a negative develops, the focus settles, the shutter fires.
 * Vidéo: the frame becomes a film strip that rolls to a stop, timecode running.
 * Design: selection handles and a cursor resize it like an artboard, swatches pop in.
 * Web: a browser bar drops in, a client site's address types itself, its page scrolls.
 * Then brand yellow and the logo. On the home page the same frame flies to the hero and becomes
 * the prism's front face (no cut), trailed by fading copies; on other pages the cover dissolves.
 * Later loads in the same visit get a short fade (see layout.tsx).
 */
export function Preloader() {
  const { t } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const skipBtn = useRef<HTMLButtonElement>(null);
  const skipRef = useRef<() => void>(() => {});
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = root.current;
    const fr = frame.current;
    if (!el || !fr) return;
    const reduced = motionMode() === "gentle";

    // The intro replays on a full load, so start at the top (phones restore the old position).
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.documentElement.style.overflow = "hidden";

    const finish = (handoff = false) => {
      window.scrollTo(0, 0);
      document.documentElement.style.overflow = "";
      try {
        sessionStorage.setItem(INTRO_SEEN_KEY, "1");
      } catch {}
      setIntroHandoff(handoff);
      markIntroDone();
      setGone(true);
    };

    const fonts = document.fonts?.ready ?? Promise.resolve();
    const fontsOrTimeout = Promise.race([fonts, new Promise((r) => setTimeout(r, MAX_WAIT_MS))]);

    // Already seen in this visit: just lift the dark cover once fonts are in.
    if (document.documentElement.dataset.intro === "quick") {
      let tween: gsap.core.Tween | null = null;
      let cancelled = false;
      Promise.race([fonts, new Promise((r) => setTimeout(r, 800))]).then(() => {
        if (cancelled) return;
        markIntroLeaving();
        tween = gsap.to(el, { autoAlpha: 0, duration: reduced ? 0.25 : 0.4, ease: "power1.out", onComplete: () => finish() });
      });
      return () => {
        cancelled = true;
        tween?.kill();
        document.documentElement.style.overflow = "";
      };
    }

    const q = gsap.utils.selector(el);
    const ctx = gsap.context(() => {}, el);
    let cancelled = false;

    // Gentle mode: the photo frame and the logo, then a fade.
    if (reduced) {
      ctx.add(() => {
        gsap.set(q("[data-pre-layer]:not([data-pre-layer=photo]), [data-pre-select], [data-pre-cursor], [data-pre-swatch], [data-pre-rec]"), { autoAlpha: 0 });
        gsap.set(q("[data-pre-seg]"), { scaleX: 1 });
      });
      fontsOrTimeout.then(() => {
        if (cancelled) return;
        ctx.add(() => {
          gsap.to([el, skipBtn.current], { autoAlpha: 0, duration: 0.4, delay: 0.5, ease: "power1.out", onStart: markIntroLeaving, onComplete: () => finish() });
        });
      });
      return () => {
        cancelled = true;
        ctx.revert();
        document.documentElement.style.overflow = "";
      };
    }

    const url = q("[data-pre-url]")[0] as HTMLElement | undefined;
    const typed = url?.dataset.typed ?? "";
    const tcEl = q("[data-pre-tc]")[0] as HTMLElement | undefined;
    const tc = { f: 0 };
    const pct = { v: 0 };
    const chars = { n: 0 };

    let outroStarted = false;
    let main: gsap.core.Timeline | undefined;
    let lead = 0;

    // The frame flies to the prism's front face, trailed by fading copies of its photo (the
    // "image trail" idea from Codrops' IntroTrailEffect), which catch up and vanish on landing.
    const fly = (target: HTMLElement) => {
      const from = fr.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      const move = { x: to.left - from.left, y: to.top - from.top, scale: to.width / from.width };
      const src = (q("[data-pre-photo]")[0] as HTMLImageElement | undefined)?.currentSrc;
      const ghosts = src
        ? [0.45, 0.28, 0.16].map((opacity) => {
            const g = document.createElement("div");
            g.className = "pre-ghost";
            Object.assign(g.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`, opacity: String(opacity), backgroundImage: `url("${src}")` });
            el.insertBefore(g, el.firstChild?.nextSibling ?? null);
            return g;
          })
        : [];
      gsap.to(fr, { ...move, duration: 0.95, ease: "expo.inOut" });
      ghosts.forEach((g, i) => {
        gsap.to(g, { ...move, duration: 0.95, ease: "expo.inOut", delay: 0.05 * (i + 1) });
        gsap.to(g, { opacity: 0, duration: 0.25, delay: 0.75 + 0.05 * i, onComplete: () => g.remove() });
      });
    };

    const outro = () => {
      const target = document.querySelector<HTMLElement>("#top .prism-scene");
      const tl = gsap.timeline();
      tl.to([...q("[data-pre-hud], [data-pre-caption]"), skipBtn.current], { autoAlpha: 0, y: 8, duration: 0.3, ease: "power2.in" }, 0)
        // Brand yellow floods the frame, the logo is written in
        .fromTo(q("[data-pre-layer=brand]"), { autoAlpha: 1, clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)", duration: 0.55, ease: "expo.inOut" }, 0)
        .to(q("[data-pre-select], [data-pre-cursor], [data-pre-swatch]"), { autoAlpha: 0, duration: 0.2 }, 0)
        .fromTo(q("[data-pre-logo]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.25)
        .fromTo(q("[data-pre-logo] [data-logo-script]"), { clipPath: "inset(-20% 100% -20% 0)" }, { clipPath: "inset(-20% 0% -20% 0)", duration: 0.5, ease: "power2.inOut" }, 0.3)
        .set(q("[data-pre-layer=video], [data-pre-layer=design], [data-pre-layer=web]"), { autoAlpha: 0 }, 0.56);

      if (target) {
        // Home: the yellow wipes up onto the photo, and the frame flies to the prism's front face.
        tl.set(q("[data-pre-motif]"), { autoAlpha: 1, scale: 1 }, 0.56)
          .set(fr, { scale: 1 }, 0.56)
          .to(q("[data-pre-layer=brand]"), { clipPath: "inset(0% 0% 100% 0%)", duration: 0.45, ease: "power3.inOut" }, 0.8)
          .add(() => fly(target), 0.92)
          // The dark cover dissolves while the frame is in the air, uncovering the hero around it
          .add(markIntroLeaving, 1.0)
          .to(q("[data-pre-band], [data-pre-leaks], [data-pre-hud]"), { autoAlpha: 0, duration: 0.7, ease: "power2.inOut" }, 1.0)
          .add(() => finish(true), 1.9);
      } else {
        // Other pages: the frame steps back and the dark cover dissolves onto the page.
        tl.to(fr, { scale: 0.9, autoAlpha: 0, duration: 0.55, ease: "power2.in" }, 1.0)
          .add(markIntroLeaving, 1.05)
          .to(q("[data-pre-band], [data-pre-leaks], [data-pre-hud]"), { autoAlpha: 0, duration: 0.6, ease: "power2.inOut" }, 1.05)
          .add(() => finish(), 1.7);
      }
    };

    const startOutro = () => {
      if (outroStarted || cancelled) return;
      outroStarted = true;
      ctx.add(outro);
    };

    // The four crafts, one after the other, in the same frame.
    ctx.add(() => {
      gsap.set(q("[data-pre-layer]:not([data-pre-layer=photo]), [data-pre-select], [data-pre-cursor], [data-pre-swatch], [data-pre-rec]"), { autoAlpha: 0 });
      const roll = (i: number) => ({ yPercent: -25 * i, duration: 0.5, ease: "power3.inOut" });

      // The photo phase runs in CSS from the first paint (about 1.8 s): start after it, or right
      // away if the script arrived late. It starts paused until the portrait is ready (below).
      lead = Math.max(0, 1.3 - performance.now() / 1000);
      main = gsap.timeline({ paused: true, onComplete: () => void fontsOrTimeout.then(startOutro) });
      main
        .to(pct, { v: 100, duration: 3.35, ease: "none", onUpdate: () => void (counter.current && (counter.current.textContent = String(Math.round(pct.v)).padStart(3, "0"))) }, 0)
        .fromTo(q("[data-pre-seg]"), { scaleX: 0 }, { scaleX: 1, duration: 0.82, ease: "none", stagger: 0.84 }, 0)

        // 01 Photo: the shutter fires
        // (The frame opening, the negative developing and the focus brackets run in CSS from the
        // first paint, before this script loads: see .pre-open in globals.css.)
        .fromTo(q("[data-pre-blade=top]"), { yPercent: -101 }, { yPercent: 0, duration: 0.07, ease: "power2.in", yoyo: true, repeat: 1 }, 0.6)
        .fromTo(q("[data-pre-blade=bottom]"), { yPercent: 101 }, { yPercent: 0, duration: 0.07, ease: "power2.in", yoyo: true, repeat: 1 }, 0.6)
        .fromTo(q("[data-pre-flash]"), { autoAlpha: 0.75 }, { autoAlpha: 0, duration: 0.35, ease: "power2.out", immediateRender: false }, 0.72)

        // 02 Vidéo: a film strip rolls in from below and slows to a stop, timecode running
        .to(q("[data-pre-words], [data-pre-metas]"), roll(1), 0.84)
        .to(q("[data-pre-motif]"), { autoAlpha: 0, duration: 0.2 }, 0.84)
        .fromTo(q("[data-pre-layer=video]"), { autoAlpha: 1, clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.35, ease: "power3.inOut" }, 0.84)
        .fromTo(q("[data-pre-strip]"), { yPercent: 0 }, { yPercent: -80, duration: 0.8, ease: "power4.out" }, 0.89)
        .to(q("[data-pre-rec]"), { autoAlpha: 1, duration: 0.15 }, 1.1)
        .fromTo(tc, { f: 0 }, { f: 37, duration: 0.8, ease: "none", onUpdate: () => void (tcEl && (tcEl.textContent = `00:00:${pad(tc.f / 25)}:${pad(tc.f % 25)}`)) }, 0.89)

        // 03 Design: selection handles, a cursor grabs the corner and resizes, swatches pop in
        .to(q("[data-pre-words], [data-pre-metas]"), roll(2), 1.68)
        .fromTo(q("[data-pre-layer=design]"), { autoAlpha: 1, clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power3.inOut" }, 1.68)
        .to(q("[data-pre-rec]"), { autoAlpha: 0, duration: 0.15 }, 1.68)
        .to(q("[data-pre-select]"), { autoAlpha: 1, duration: 0.15 }, 1.8)
        .fromTo(q("[data-pre-handle]"), { scale: 0 }, { scale: 1, duration: 0.3, ease: "back.out(3)", stagger: 0.025 }, 1.8)
        .fromTo(q("[data-pre-cursor]"), { autoAlpha: 0, x: 70, y: 60 }, { autoAlpha: 1, x: 0, y: 0, duration: 0.35, ease: "power3.out" }, 1.88)
        .to(fr, { scale: 1.05, duration: 0.24, ease: "power2.inOut" }, 2.2)
        .to(fr, { scale: 1, duration: 0.34, ease: "back.out(2.2)" }, 2.44)
        .fromTo(q("[data-pre-swatch]"), { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(2.5)", stagger: 0.05 }, 1.98)

        // 04 Web: a browser bar drops in, the address types itself, the page scrolls
        .to(q("[data-pre-words], [data-pre-metas]"), roll(3), 2.52)
        .to(q("[data-pre-select], [data-pre-cursor], [data-pre-swatch]"), { autoAlpha: 0, duration: 0.2 }, 2.52)
        .fromTo(q("[data-pre-layer=web]"), { autoAlpha: 1, clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, ease: "power3.inOut" }, 2.52)
        .fromTo(chars, { n: 0 }, { n: typed.length, duration: 0.5, ease: "none", onUpdate: () => void (url && (url.textContent = typed.slice(0, Math.round(chars.n)))) }, 2.82)
        .fromTo(q("[data-pre-webshot]"), { objectPosition: "50% 0%" }, { objectPosition: "50% 30%", duration: 0.75, ease: "power2.inOut" }, 2.82)
        .to({}, { duration: 0.15 });
    });

    // Don't leave the photo phase before its portrait has shown (a first visit to an inner page
    // may not have it yet): wait for it, at most 1.2 s, and then let it be seen for a moment.
    const photo = q("[data-pre-photo]")[0] as HTMLImageElement | undefined;
    const waitStart = performance.now();
    const photoReady = photo && !photo.complete ? Promise.race([photo.decode().catch(() => {}), new Promise((r) => setTimeout(r, 1200))]) : Promise.resolve();
    photoReady.then(() => {
      if (cancelled || outroStarted) return;
      const waited = (performance.now() - waitStart) / 1000;
      main?.delay(waited > 0.1 ? 0.6 : lead).restart(true);
    });

    skipRef.current = () => {
      if (outroStarted) return;
      main?.progress(1); // jumps to the end; onComplete then starts the outro
    };

    return () => {
      cancelled = true;
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
      <div ref={root} aria-hidden data-preloader className="fixed inset-0 isolate z-[100] overflow-hidden text-paper">
        {/* Four ink bands, one per craft: they lift away at the end, like the page transition */}
        <div className="absolute inset-0 -z-10 flex">
          {crafts.map((c) => (
            <span key={c.key} data-pre-band className="h-full flex-1 bg-ink" />
          ))}
        </div>
        <div data-pre-leaks className="absolute inset-0 -z-10">
          <LightLeaks className="opacity-50" />
        </div>

        <p data-pre-hud className="absolute top-5 left-5 text-[11px] tracking-[0.25em] text-paper/55 uppercase md:top-8 md:left-10 md:text-xs">
          EGC Studio · Abidjan
        </p>

        <div className="flex h-full flex-col items-center justify-center pb-20">
          {/* The frame */}
          <div ref={frame} className="pre-frame relative origin-top-left">
            {/* Design: selection box with handles and size tag, around the frame */}
            <div data-pre-select className="invisible opacity-0 pointer-events-none absolute -inset-2.5 z-10 border border-[#3b82f6]">
              {HANDLES.map((h) => (
                <span key={h} data-pre-handle className={`absolute size-2 border border-[#3b82f6] bg-white ${h}`} />
              ))}
              <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 rounded bg-[#3b82f6] px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-white tabular-nums">
                1080 × 1350
              </span>
            </div>
            <svg data-pre-cursor viewBox="0 0 24 24" className="invisible opacity-0 absolute -right-5 -bottom-6 z-20 size-7 drop-shadow-[0_2px_4px_rgb(0_0_0/0.5)]">
              <path d="M4 2l15 9.5-6.6 1.3 3.9 7.2-2.7 1.4-3.9-7.2L4.5 19z" fill="#fff" stroke="#0e0e0e" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
            <div className="absolute top-3 -right-8 z-10 flex flex-col gap-2 md:-right-11">
              {SWATCHES.map((c) => (
                <span key={c} data-pre-swatch className="invisible opacity-0 size-4 rounded-full ring-2 ring-paper/80 md:size-6" style={{ background: c }} />
              ))}
            </div>

            <div data-pre-clip className="pre-open absolute inset-0 overflow-hidden rounded-[1.4rem] bg-graphite shadow-2xl shadow-black/50">
              {/* 01 Photo, also the face the frame lands on in the hero */}
              <div data-pre-layer="photo" className="absolute inset-0">
                <Image data-pre-photo src={crafts[0].image} alt="" width={crafts[0].w} height={crafts[0].h} sizes={FACE_SIZES} preload className="pre-develop size-full object-cover" />
                <span aria-hidden className="pre-negative absolute inset-0" />
                {/* Burst: each layer slides in while its image slides the other way, so the
                    picture seems to stay still while it is uncovered */}
                {BURST.map((src, i) => (
                  <div key={src} className={`pre-burst pre-burst-${i} absolute inset-0 overflow-hidden`}>
                    <div className="pre-burst-img absolute inset-0">
                      <Image loading="eager" src={src} alt="" fill sizes={FACE_SIZES} className="object-cover" />
                    </div>
                  </div>
                ))}
                <div data-pre-motif className="pre-motif absolute inset-0">
                  <span className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-ink/10" />
                  <CraftMotif craft="photo" meta={t.crafts[0].meta} />
                </div>
                <span data-pre-blade="top" className="absolute inset-x-0 top-0 h-1/2 -translate-y-full bg-ink" />
                <span data-pre-blade="bottom" className="absolute inset-x-0 bottom-0 h-1/2 translate-y-full bg-ink" />
              </div>

              {/* 02 Vidéo: film strip with sprocket holes */}
              <div data-pre-layer="video" className="invisible opacity-0 absolute inset-0 overflow-hidden bg-black">
                <div data-pre-strip className="absolute inset-x-[9%] top-0">
                  {STRIP.map((src) => (
                    <div key={src} className="relative aspect-[4/5] w-full border-y-[3px] border-black">
                      <Image loading="eager" src={src} alt="" fill sizes="(min-width: 1024px) 22rem, 60vw" className="object-cover" />
                    </div>
                  ))}
                </div>
                <span className="pre-sprockets absolute inset-y-0 left-0 w-[9%]" />
                <span className="pre-sprockets absolute inset-y-0 right-0 w-[9%]" />
                <span data-pre-rec className="invisible opacity-0 absolute top-3 left-[12%] flex items-center gap-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide tabular-nums">
                  <span className="rec-dot size-1.5 rounded-full bg-[#ff3b30]" />
                  REC <span data-pre-tc>00:00:00:00</span>
                </span>
              </div>

              {/* 03 Design: a real poster */}
              <div data-pre-layer="design" className="invisible opacity-0 absolute inset-0 bg-paper">
                <Image loading="eager" src={crafts[2].image} alt="" width={crafts[2].w} height={crafts[2].h} sizes={FACE_SIZES} className="size-full object-cover" />
              </div>

              {/* 04 Web: a site the studio built for a client (ANAREKA-CI), in a browser */}
              <div data-pre-layer="web" className="invisible opacity-0 absolute inset-0 flex flex-col bg-paper">
                <div className="flex h-9 shrink-0 items-center gap-1.5 bg-ink px-3">
                  <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="size-2.5 rounded-full bg-[#febc2e]" />
                  <span className="size-2.5 rounded-full bg-[#28c840]" />
                  <span className="ml-2 flex h-5 min-w-0 flex-1 items-center rounded-full bg-paper/10 px-2.5 text-[10px] text-paper/80">
                    <span data-pre-url data-typed="anarekaci.com" className="truncate" />
                    <span className="motif-caret ml-0.5 inline-block h-3 w-px shrink-0 bg-brand" />
                  </span>
                </div>
                <div className="relative min-h-0 flex-1">
                  <Image loading="eager" data-pre-webshot src={crafts[3].image} alt="" fill sizes={FACE_SIZES} className="object-cover object-top" />
                </div>
              </div>

              {/* Brand yellow and the logo */}
              <div data-pre-layer="brand" className="invisible opacity-0 absolute inset-0 flex items-center justify-center bg-brand">
                <div data-pre-logo className="pt-[0.6em] text-[clamp(2.6rem,11vw,4.6rem)]">
                  <Logo tone="ink" />
                </div>
              </div>

              <span data-pre-flash className="pointer-events-none absolute inset-0 bg-white opacity-0" />
            </div>
          </div>

          {/* Craft name and its technical readout, rolling with each phase */}
          <div data-pre-caption className="mt-9 flex flex-col items-center gap-2 text-center">
            <div className="h-[1.05em] overflow-hidden font-display text-[clamp(2.2rem,8vw,3.6rem)] leading-none font-semibold tracking-[-0.045em]">
              <div data-pre-words>
                {t.crafts.map((c) => (
                  <div key={c.key} className="h-[1.05em]">
                    {c.name}
                    <span className="text-brand">.</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-[1.4em] overflow-hidden text-[11px] font-medium tracking-[0.18em] text-paper/55 tabular-nums md:text-xs">
              <div data-pre-metas>
                {t.crafts.map((c) => (
                  <div key={c.key} className="h-[1.4em]">
                    {c.meta.join("  ·  ")}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Four segments, one per craft, and the counter */}
        <div data-pre-hud className="absolute inset-x-5 bottom-5 md:inset-x-10 md:bottom-8">
          <div className="mb-3 flex justify-end">
            <span ref={counter} className="font-display text-3xl leading-none tracking-tight tabular-nums md:text-4xl">
              000
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 md:gap-3">
            {t.crafts.map((c, i) => (
              <div key={c.key}>
                <span className="block h-[2px] overflow-hidden rounded-full bg-paper/15">
                  <span data-pre-seg className="block h-full origin-left scale-x-0 bg-brand" />
                </span>
                <span className="mt-2 block text-[10px] tracking-[0.18em] text-paper/50 uppercase md:text-[11px]">
                  0{i + 1} {c.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Outside the decorative layer so it stays reachable by keyboard and screen readers */}
      <button
        ref={skipBtn}
        type="button"
        data-pre-skip
        onClick={() => skipRef.current()}
        className="fixed top-3 right-3 z-[101] h-10 cursor-pointer rounded-full border border-paper/20 bg-ink/60 px-4 text-xs text-paper/80 backdrop-blur-sm transition-colors hover:bg-paper/10 md:top-6 md:right-8"
      >
        {t.a11y.skipIntro}
      </button>
    </>
  );
}
