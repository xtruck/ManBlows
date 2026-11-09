"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useLang } from "./LangProvider";
import { Logo } from "./Logo";
import { INTRO_SEEN_KEY, markIntroDone, markIntroLeaving } from "@/lib/intro";
import { motionMode } from "@/lib/motion";

declare global {
  interface Window {
    __egcSkipEarly?: boolean; // set by the inline script in layout.tsx when Skip was pressed before this code arrived
  }
}

const MAX_WAIT_MS = 2500; // never hold the visitor longer than this for the fonts
const HARD_CAP_MS = 9000; // whatever happens (stalled timers, background tab), the cover is gone by then
const START_AT = 0.5; // seconds after navigation start when the script takes over from the CSS-only photo scene
const ADDRESS = "egcstudio"; // typed into the browser's address bar
const HANDLES = ["0% 0%", "50% 0%", "100% 0%", "100% 50%", "100% 100%", "50% 100%", "0% 100%", "0% 50%"];

const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");

/**
 * First load of a visit (about 3.6 s): the four crafts of the studio, one after the other in the
 * same frame, each in its own visual language, then merged into the logo.
 *
 *  1. Photo: a viewfinder (corner brackets, thirds, a focus square that locks, the exposure) and a
 *     shutter that blinks shut. This part is plain CSS, so it shows before any script arrives.
 *  2. Vidéo: the shutter opens on black film: sprocket holes running, REC, a timecode, a scrub bar.
 *  3. Design: an artboard is wiped in, guides draw, a poster builds itself, a selection with its
 *     handles and the "1080 × 1350" label, a cursor grabs a corner.
 *  4. Web: a browser window, "egcstudio" typed in the address bar, a page lays itself out.
 *  Then the four segments of the progress bar at the bottom grow into four yellow panels (one per
 *  craft, like the faces of the home prism), the logo is written over them, and the panels lift
 *  one after the other to uncover the page while the prism rises (see Hero.tsx, onIntroLeaving).
 *
 * Only transform, opacity and clip-path are animated, so it stays smooth on phones. Later loads in
 * the same visit get a short fade (see layout.tsx). It can never trap the visitor: Skip button and
 * Escape, a hard time cap, a CSS-only failsafe (see [data-preloader] in globals.css) and a
 * no-script rule (layout.tsx).
 */
export function Preloader() {
  const { t } = useLang();
  const crafts = t.crafts;
  const root = useRef<HTMLDivElement>(null);
  const skipBtn = useRef<HTMLButtonElement>(null);
  const skipRef = useRef<() => void>(() => {});
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = motionMode() === "gentle";

    // The intro replays on a full load, so start at the top (phones restore the old position).
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.documentElement.style.overflow = "hidden";

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.scrollTo(0, 0);
      document.documentElement.style.overflow = "";
      try {
        sessionStorage.setItem(INTRO_SEEN_KEY, "1");
      } catch {}
      markIntroDone();
      setGone(true);
    };
    // Last resort: stalled timers (a background tab) or a script error must not keep the cover up
    const hardCap = window.setTimeout(finish, HARD_CAP_MS);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && skipRef.current();
    window.addEventListener("keydown", onKey);
    const cleanup = () => {
      window.clearTimeout(hardCap);
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };

    // Skip was pressed before the scripts arrived: the cover is already lifting, just finish
    if (window.__egcSkipEarly) {
      markIntroLeaving();
      finish();
      return cleanup;
    }

    const fonts = document.fonts?.ready ?? Promise.resolve();
    const fontsOrTimeout = Promise.race([fonts, new Promise((r) => setTimeout(r, MAX_WAIT_MS))]);

    // Already seen in this visit: just lift the cover once fonts are in.
    if (document.documentElement.dataset.intro === "quick") {
      let tween: gsap.core.Tween | null = null;
      let cancelled = false;
      Promise.race([fonts, new Promise((r) => setTimeout(r, 800))]).then(() => {
        if (cancelled) return;
        markIntroLeaving();
        tween = gsap.to(el, { autoAlpha: 0, duration: reduced ? 0.25 : 0.4, ease: "power1.out", onComplete: finish });
      });
      return () => {
        cancelled = true;
        tween?.kill();
        cleanup();
      };
    }

    const q = gsap.utils.selector(el);
    const ctx = gsap.context(() => {}, el);
    let cancelled = false;

    // The resting state the full sequence ends on: four yellow panels, the logo, the craft names
    const endState = () => {
      gsap.set(q("[data-pl-paper], [data-pl-stage], [data-pl-hud]"), { autoAlpha: 0 });
      gsap.set(q("[data-pl-col]"), { autoAlpha: 1, scaleY: 1, transformOrigin: "50% 100%" });
      gsap.set(q("[data-pl-fill]"), { scaleX: 1 });
      gsap.set(q("[data-pl-label]"), { autoAlpha: 1 });
      gsap.set(q("[data-pl-logo]"), { autoAlpha: 1 });
      gsap.set(q("[data-logo-word]"), { yPercent: 0, autoAlpha: 1 });
      gsap.set(q("[data-logo-script]"), { clipPath: "inset(-40% 0% -40% 0)" });
    };

    // Gentle mode: the finished picture (panels and logo), then a fade.
    if (reduced) {
      ctx.add(endState);
      fontsOrTimeout.then(() => {
        if (cancelled) return;
        ctx.add(() => {
          gsap.to([el, skipBtn.current], { autoAlpha: 0, duration: 0.4, delay: 0.5, ease: "power1.out", onStart: markIntroLeaving, onComplete: finish });
        });
      });
      return () => {
        cancelled = true;
        ctx.revert();
        cleanup();
      };
    }

    let outroStarted = false;
    let main: gsap.core.Timeline | undefined;

    // The four panels lift one after the other, uncovering the page (the hero's prism rises from
    // below at the same time: see Hero.tsx, onIntroLeaving).
    const outro = () => {
      gsap
        .timeline({ onComplete: finish })
        .to(skipBtn.current, { autoAlpha: 0, duration: 0.2 }, 0)
        .add(markIntroLeaving, 0.05)
        .to(q("[data-pl-bar]"), { autoAlpha: 0, duration: 0.2 }, 0)
        .to(q("[data-pl-col]"), { yPercent: -100, duration: 0.66, ease: "expo.inOut", stagger: 0.04 }, 0.05)
        // The logo leaves with the panels (no fade: ink fading over yellow turns brown)
        .to(q("[data-pl-logo]"), { y: () => -window.innerHeight, duration: 0.66, ease: "expo.inOut" }, 0.09);
    };
    const startOutro = () => {
      if (outroStarted || cancelled) return;
      outroStarted = true;
      ctx.add(outro);
    };

    ctx.add(() => {
      const words = q("[data-pl-word]");
      const subs = q("[data-pl-sub]");
      const fills = q("[data-pl-fill]");
      const labels = q("[data-pl-label]");
      const timecode = q("[data-pl-tc]")[0];
      const typed = q("[data-pl-typed]")[0];

      // Everything the CSS keeps hidden is placed here first, then revealed by the timeline
      gsap.set(q("[data-pl-later]"), { autoAlpha: 0 });
      gsap.set(words.slice(1).concat(subs.slice(1)), { yPercent: 110, autoAlpha: 1 });
      gsap.set(q("[data-pl-col]"), { scaleY: 0, transformOrigin: "50% 100%" });
      gsap.set(q("[data-pl-blade]"), { scaleY: 0 });
      gsap.set(q("[data-logo-word]"), { yPercent: 45, autoAlpha: 0 });
      gsap.set(q("[data-logo-script]"), { clipPath: "inset(-40% 100% -40% 0)" });

      // Swaps the big craft word (and its line) under the frame: the old one leaves upward
      const swap = (tl: gsap.core.Timeline, i: number, at: number) => {
        tl.to([words[i - 1], subs[i - 1]], { yPercent: -110, duration: 0.35, ease: "power3.in" }, at)
          .fromTo([words[i], subs[i]], { yPercent: 110 }, { yPercent: 0, duration: 0.45, ease: "expo.out", stagger: 0.04 }, at + 0.2)
          .to(labels[i - 1], { opacity: 0.45, duration: 0.2 }, at + 0.2)
          .to(labels[i], { opacity: 1, duration: 0.2 }, at + 0.2);
      };
      // A layer of the frame is cut in with a wipe
      const wipe = (sel: string, from: string) => [q(sel), { autoAlpha: 1, clipPath: from }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.32, ease: "power3.inOut" }] as const;

      // The photo scene plays in CSS (see .pl-photo in globals.css), so it shows even before this
      // script arrives on a slow phone. From here on, everything is GSAP.
      const lead = Math.max(0, START_AT - performance.now() / 1000);
      main = gsap.timeline({ delay: lead, onComplete: () => void fontsOrTimeout.then(startOutro) });
      // A slow phone already held the photo scene longer: play the rest a little faster
      const late = performance.now() / 1000 - START_AT;
      if (late > 0.3) main.timeScale(Math.min(1.3, 1 + late * 0.2));
      const tc = { f: 0 };
      const ty = { n: 0 };
      main
        // 1 → 2. The shutter blinks shut over the viewfinder and opens on film
        .to(q("[data-pl-blade]"), { scaleY: 1, duration: 0.12, ease: "power2.in" }, 0)
        .set(q("[data-pl-photo]"), { autoAlpha: 0 }, 0.12)
        .set(q("[data-pl-video]"), { autoAlpha: 1 }, 0.12)
        .to(q("[data-pl-blade]"), { scaleY: 0, duration: 0.16, ease: "power2.out" }, 0.14);
      swap(main, 1, 0);
      main
        .fromTo(q("[data-pl-sprockets]"), { xPercent: 0 }, { xPercent: -50, duration: 0.6, ease: "none" }, 0.12)
        .fromTo(q("[data-pl-scrub]"), { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "none" }, 0.14)
        .to(tc, { f: 87, duration: 0.5, ease: "none", onUpdate: () => timecode && (timecode.textContent = `00:00:${pad(tc.f / 25)}:${pad(tc.f % 25)}`) }, 0.14)
        .fromTo(fills[1], { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "none" }, 0.12)

        // 3. Design: an artboard is wiped in from below and builds itself
        .fromTo(...wipe("[data-pl-design]", "inset(100% 0% 0% 0%)"), 0.6)
        .set(q("[data-pl-video]"), { autoAlpha: 0 }, 0.95);
      swap(main, 2, 0.58);
      main
        .fromTo(q("[data-pl-guide-h]"), { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power3.out" }, 0.72)
        .fromTo(q("[data-pl-guide-v]"), { scaleY: 0 }, { scaleY: 1, duration: 0.4, ease: "power3.out" }, 0.74)
        .fromTo(q("[data-pl-board]"), { scale: 0.86, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, ease: "expo.out" }, 0.74)
        .fromTo(q("[data-pl-dot]"), { scale: 0 }, { scale: 1, duration: 0.45, ease: "back.out(1.7)" }, 0.82)
        .fromTo(q("[data-pl-line]"), { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power3.out", stagger: 0.05 }, 0.88)
        .fromTo(q("[data-pl-select]"), { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 0.25, ease: "power2.out" }, 0.92)
        .fromTo(q("[data-pl-handle]"), { scale: 0 }, { scale: 1, duration: 0.2, ease: "back.out(2)", stagger: 0.015 }, 0.95)
        .fromTo(q("[data-pl-dim]"), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out" }, 1.0)
        .fromTo(q("[data-pl-cursor]"), { autoAlpha: 0, x: 40, y: 50 }, { autoAlpha: 1, x: 0, y: 0, duration: 0.4, ease: "power3.out" }, 0.86)
        .to(q("[data-pl-cursor]"), { scale: 0.85, duration: 0.08, yoyo: true, repeat: 1 }, 1.08)
        .fromTo(fills[2], { scaleX: 0 }, { scaleX: 1, duration: 0.55, ease: "none" }, 0.6)

        // 4. Web: a browser window is wiped in from the right; the address is typed, the page lays out
        .fromTo(...wipe("[data-pl-web]", "inset(0% 0% 0% 100%)"), 1.15)
        .set(q("[data-pl-design]"), { autoAlpha: 0 }, 1.5);
      swap(main, 3, 1.13);
      main
        .fromTo(q("[data-pl-window]"), { scale: 0.92 }, { scale: 1, duration: 0.45, ease: "expo.out" }, 1.17)
        .to(ty, { n: ADDRESS.length, duration: 0.36, ease: "none", onUpdate: () => typed && (typed.textContent = ADDRESS.slice(0, Math.round(ty.n))) }, 1.3)
        .fromTo(q("[data-pl-nav]"), { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power3.out", stagger: 0.03 }, 1.32)
        .fromTo(q("[data-pl-hero]"), { scaleY: 0 }, { scaleY: 1, duration: 0.4, ease: "expo.out" }, 1.38)
        .fromTo(q("[data-pl-head]"), { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power3.out", stagger: 0.05 }, 1.48)
        .fromTo(q("[data-pl-card]"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out", stagger: 0.05 }, 1.52)
        .fromTo(fills[3], { scaleX: 0 }, { scaleX: 1, duration: 0.55, ease: "none" }, 1.15)

        // 5. The four progress segments grow into four yellow panels, one per craft
        .set(q("[data-pl-col]"), { autoAlpha: 1 }, 1.62)
        .to(q("[data-pl-col]"), { scaleY: 1, duration: 0.5, ease: "power4.inOut", stagger: 0.06 }, 1.62)
        .to(labels, { opacity: 1, duration: 0.2 }, 1.9)
        .set(q("[data-pl-paper], [data-pl-stage], [data-pl-hud]"), { autoAlpha: 0 }, 2.32)
        // ...and the logo is written over them
        .set(q("[data-pl-logo]"), { autoAlpha: 1 }, 1.92)
        .to(q("[data-logo-word]"), { yPercent: 0, autoAlpha: 1, duration: 0.45, ease: "expo.out" }, 1.95)
        .to(q("[data-logo-script]"), { clipPath: "inset(-40% 0% -40% 0)", duration: 0.36, ease: "power2.inOut" }, 2.08)
        .to({}, { duration: 0.1 });
    });

    skipRef.current = () => {
      if (outroStarted) return;
      main?.progress(1); // jumps to the end; onComplete starts the outro
    };

    return () => {
      cancelled = true;
      ctx.revert();
      cleanup();
    };
  }, []);

  if (gone) return null;

  const [photo, video, design] = crafts;

  return (
    <>
      {/* The animation itself is decorative; this tells screen readers the site is loading. */}
      <p role="status" className="sr-only">
        {t.a11y.loading}
      </p>
      <div ref={root} aria-hidden data-preloader className="pl fixed inset-0 z-[100] overflow-hidden text-ink">
        <div data-pl-paper className="absolute inset-0 bg-paper" />

        <div data-pl-hud className="pl-fade absolute inset-x-0 top-0 flex justify-between px-4 pt-4 font-mono text-[10px] tracking-[0.18em] text-ink/60 uppercase md:px-8 md:pt-7 md:text-xs">
          <span>EGC Studio</span>
          <span>Abidjan</span>
        </div>

        {/* The frame where the four crafts play, and the craft's name under it */}
        <div data-pl-stage className="absolute inset-x-0 top-0 bottom-14 flex flex-col items-center justify-center gap-5 md:bottom-16 md:gap-7">
          <div className="pl-box relative overflow-hidden">
            {/* 1. Photo: a viewfinder, all CSS */}
            <div data-pl-photo className="pl-photo absolute inset-0">
              <span className="pl-thirds absolute inset-0" />
              <span className="pl-corner pl-tl absolute" />
              <span className="pl-corner pl-tr absolute" />
              <span className="pl-corner pl-bl absolute" />
              <span className="pl-corner pl-br absolute" />
              <span className="pl-focus absolute top-1/2 left-1/2" />
              <span className="pl-fade absolute top-[7%] left-1/2 flex -translate-x-1/2 items-center gap-1.5 pt-2 font-mono text-[9px] tracking-[0.18em] text-ink/70 md:text-[11px]">
                <i className="block size-1.5 rounded-full bg-ink" /> AF·S
              </span>
              <span className="pl-fade absolute bottom-[7%] left-1/2 -translate-x-1/2 pb-2 font-mono text-[9px] tracking-[0.18em] whitespace-nowrap text-ink/70 md:text-[11px]">
                {photo.meta.join(" · ")}
              </span>
            </div>

            {/* 2. Video: black film running */}
            <div data-pl-video data-pl-later className="pl-later absolute inset-0 bg-ink text-paper">
              <span className="pl-strip absolute inset-x-0 top-0 overflow-hidden">
                <span data-pl-sprockets className="pl-holes absolute inset-y-0 left-0 block w-[200%]" />
              </span>
              <span className="pl-strip absolute inset-x-0 bottom-0 overflow-hidden">
                <span data-pl-sprockets className="pl-holes absolute inset-y-0 left-0 block w-[200%]" />
              </span>
              <span className="absolute inset-x-[7%] top-[15%] flex items-center justify-between font-mono text-[9px] tracking-[0.18em] md:text-[11px]">
                <span className="flex items-center gap-1.5">
                  <i className="pl-rec block size-2 rounded-full bg-brand" /> REC
                </span>
                <span className="text-paper/60">{video.meta.join(" · ")}</span>
              </span>
              <span className="absolute inset-x-[7%] top-1/2 flex -translate-y-1/2 flex-col items-center gap-3 md:gap-4">
                <span data-pl-tc className="font-mono text-[clamp(1.15rem,6vw,2.4rem)] tracking-[0.06em] tabular-nums">
                  00:00:00:00
                </span>
                <span className="relative block h-[3px] w-full bg-paper/20">
                  <span data-pl-scrub className="absolute inset-0 origin-left bg-brand" />
                </span>
              </span>
              <span className="absolute inset-x-[7%] bottom-[15%] flex justify-between font-mono text-[9px] tracking-[0.18em] text-paper/50 md:text-[11px]">
                <span>A001_C012</span>
                <span>EGC</span>
              </span>
            </div>

            {/* 3. Graphic design: an artboard with guides, a poster, a selection */}
            <div data-pl-design data-pl-later className="pl-later pl-grid absolute inset-0 bg-paper">
              <span data-pl-guide-h className="pl-guide-h absolute inset-x-0 top-[44%]" />
              <span data-pl-guide-v className="pl-guide-v absolute inset-y-0 left-1/2" />
              <div className="pl-art absolute top-[44%] left-1/2">
                <div data-pl-board className="absolute inset-0 overflow-hidden bg-ink">
                  <span data-pl-dot className="absolute top-[12%] left-1/2 -ml-[30%] block aspect-square w-[60%] rounded-full bg-brand" />
                  <span data-pl-line className="absolute bottom-[20%] left-[10%] block h-[6%] w-[70%] origin-left bg-paper" />
                  <span data-pl-line className="absolute bottom-[11%] left-[10%] block h-[4%] w-[44%] origin-left bg-paper/60" />
                </div>
                <div data-pl-select className="absolute -inset-[5px] border-[1.5px] border-ink">
                  {HANDLES.map((p) => {
                    const [x, y] = p.split(" ");
                    return <span key={p} data-pl-handle className="absolute block size-[9px] -translate-x-1/2 -translate-y-1/2 border-[1.5px] border-ink bg-brand" style={{ left: x, top: y }} />;
                  })}
                </div>
                <span data-pl-dim className="absolute top-[calc(100%+14px)] left-1/2 -translate-x-1/2 rounded-full bg-ink px-2 py-0.5 font-mono text-[9px] whitespace-nowrap text-brand md:text-[11px]">
                  {design.meta[1]}
                </span>
                <svg data-pl-cursor viewBox="0 0 24 24" className="absolute top-full left-full -mt-[2px] -ml-[2px] block size-5 md:size-6" aria-hidden>
                  <path d="M3 2l7.5 19 2.6-7.6L21 10.8z" fill="var(--ink)" stroke="var(--paper)" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* 4. Websites: a browser window and a page laying itself out */}
            <div data-pl-web data-pl-later className="pl-later absolute inset-0 bg-paper">
              <div data-pl-window className="absolute inset-[7%] flex flex-col overflow-hidden rounded-[10px] border-2 border-ink bg-paper">
                <div className="flex h-[13%] min-h-6 shrink-0 items-center gap-1.5 bg-ink px-2.5 md:gap-2 md:px-3.5">
                  <i className="block size-[7px] rounded-full bg-brand md:size-2.5" />
                  <i className="block size-[7px] rounded-full bg-paper/50 md:size-2.5" />
                  <i className="block size-[7px] rounded-full bg-paper/50 md:size-2.5" />
                  <span className="ml-1.5 flex h-[62%] flex-1 items-center rounded-full bg-paper/15 px-2.5 font-mono text-[9px] text-paper md:ml-3 md:text-xs">
                    <span className="text-paper/45">https://</span>
                    <span data-pl-typed />
                    <i className="pl-caret ml-px block h-[1.1em] w-px bg-brand" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-[6%] p-[6%]">
                  <div className="flex items-center justify-between">
                    <span data-pl-nav className="block h-1.5 w-[22%] origin-left bg-ink md:h-2" />
                    <span className="flex w-[34%] justify-between">
                      <span data-pl-nav className="block h-1 w-[26%] origin-left bg-ink/40 md:h-1.5" />
                      <span data-pl-nav className="block h-1 w-[26%] origin-left bg-ink/40 md:h-1.5" />
                      <span data-pl-nav className="block h-1 w-[26%] origin-left bg-ink/40 md:h-1.5" />
                    </span>
                  </div>
                  <div data-pl-hero className="relative flex flex-[1.4] origin-top flex-col justify-center gap-[8%] rounded-[6px] bg-brand px-[7%]">
                    <span data-pl-head className="block h-[13%] w-[62%] origin-left bg-ink" />
                    <span data-pl-head className="block h-[13%] w-[40%] origin-left bg-ink" />
                    <span data-pl-head className="mt-[3%] block h-[16%] w-[22%] origin-left rounded-full bg-ink/80" />
                  </div>
                  <div className="flex flex-1 gap-[5%]">
                    {[0, 1, 2].map((i) => (
                      <span key={i} data-pl-card className="flex flex-1 flex-col justify-end gap-1 rounded-[4px] border border-ink/25 p-[6%]">
                        <span className="block h-1 w-[70%] bg-ink/30" />
                        <span className="block h-1 w-[45%] bg-ink/20" />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* The shutter blades (the cut from photo to film) */}
            <span data-pl-blade className="absolute inset-x-0 top-0 block h-1/2 origin-top bg-ink [transform:scaleY(0)]" />
            <span data-pl-blade className="absolute inset-x-0 bottom-0 block h-1/2 origin-bottom bg-ink [transform:scaleY(0)]" />
          </div>

          {/* The craft's name: one word at a time, sliding through a mask */}
          <div className="flex flex-col items-center gap-1.5 md:gap-2.5">
            <div className="grid justify-items-center overflow-hidden">
              {crafts.map((c, i) => (
                <span
                  key={c.key}
                  data-pl-word
                  className={`font-display text-[clamp(2.75rem,12vw,6.25rem)] leading-[1.12] font-semibold tracking-[-0.04em] [grid-area:1/1] ${i ? "pl-later" : "pl-rise"}`}
                >
                  {c.name}
                </span>
              ))}
            </div>
            <div className="grid justify-items-center overflow-hidden">
              {crafts.map((c, i) => (
                <span key={c.key} data-pl-sub className={`font-mono text-[10px] tracking-[0.18em] whitespace-nowrap text-ink/60 uppercase [grid-area:1/1] md:text-xs ${i ? "pl-later" : "pl-rise"}`}>
                  {pad(i + 1)} / 04 · {c.verb}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* The four panels (one per craft) that the progress segments grow into */}
        <div className="pointer-events-none absolute inset-0 flex">
          {crafts.map((c) => (
            <span key={c.key} data-pl-col className="pl-later block h-full flex-1 bg-brand" />
          ))}
        </div>

        {/* The logo, written over the panels */}
        <div className="pointer-events-none absolute inset-x-0 top-0 bottom-14 flex items-center justify-center md:bottom-16">
          <div data-pl-logo className="pl-later pl-logo pt-[0.7em] text-[clamp(3.6rem,22vw,10rem)]">
            <Logo />
          </div>
        </div>

        {/* Progress: four segments, one per craft, along the bottom edge */}
        <div data-pl-bar className="absolute inset-x-0 bottom-0 flex">
          {crafts.map((c, i) => (
            <div key={c.key} className="relative flex h-14 flex-1 items-end border-l border-ink/10 px-2.5 pb-3.5 first:border-l-0 md:h-16 md:px-6 md:pb-4">
              <span data-pl-label className={`font-mono text-[10px] tracking-[0.14em] whitespace-nowrap uppercase md:text-xs ${i ? "opacity-45" : ""}`}>
                <span className="text-ink/50">{pad(i + 1)}</span> {c.name}
              </span>
              <span className="absolute inset-x-0 bottom-0 block h-[3px] bg-ink/10">
                <span data-pl-fill className={`absolute inset-0 block origin-left bg-ink ${i ? "[transform:scaleX(0)]" : "pl-fill-1"}`} />
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Outside the decorative layer so it stays reachable by keyboard and screen readers */}
      <button
        ref={skipBtn}
        type="button"
        data-pre-skip
        onClick={() => skipRef.current()}
        className="fixed top-3 left-1/2 z-[101] h-10 -translate-x-1/2 cursor-pointer rounded-full border border-ink/15 bg-paper/70 px-4 text-xs whitespace-nowrap text-ink/80 backdrop-blur-sm transition-colors hover:bg-paper md:top-5"
      >
        {t.a11y.skipIntro}
      </button>
    </>
  );
}
