"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useLang } from "./LangProvider";
import { INTRO_SEEN_KEY, markIntroDone, markIntroLeaving } from "@/lib/intro";
import { motionMode } from "@/lib/motion";

declare global {
  interface Window {
    __egcSkipEarly?: boolean; // set by the inline script in layout.tsx when Skip was pressed before this code arrived
  }
}

const MAX_WAIT_MS = 2500; // never hold the visitor longer than this for the fonts
const HARD_CAP_MS = 9000; // whatever happens (stalled timers, background tab), the cover is gone by then
const IRIS_AT = 0.75; // seconds after navigation start when the shutter opens (the CSS viewfinder takes until then)

// The bubbles that build the giant word: a grid over its box, each growing at its own moment.
const COLS = 16;
const ROWS = 5;
const BUBBLES = Array.from({ length: COLS * ROWS }, (_, i) => {
  const c = i % COLS;
  const r = Math.floor(i / COLS);
  // Fixed jitter (no Math.random, so server and browser draw the same thing)
  const j = ((i * 37) % 11) / 11 - 0.5;
  return { cx: 20 + c * 64 + j * 18, cy: 30 + r * 56 - j * 14 };
});

/**
 * First load of a visit (about 3.7 s). It says what the studio is before a word is read: a camera
 * viewfinder (corner brackets, thirds, a focus square that locks, the same exposure readout as the
 * home hero) appears on the cream, then the shutter opens as a brand-yellow iris from the focus
 * point and floods the screen (transform only, so it stays smooth on phones); the giant word
 * "studio." builds itself out of merging bubbles (a "gooey" SVG filter), "egc" is written in, and
 * the yellow lifts like a curtain while the hero's prism rises from below. The viewfinder is plain
 * CSS, so it shows at once, with no image to download. Later loads in the same visit get a short
 * fade (see layout.tsx).
 *
 * It can never trap the visitor: Skip button and Escape, a hard time cap, a CSS-only failsafe
 * (see [data-preloader] in globals.css) and a no-script rule (layout.tsx).
 */
export function Preloader() {
  const { t } = useLang();
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

    // Gentle mode: the yellow and the finished word, then a fade.
    if (reduced) {
      ctx.add(() => {
        gsap.set(q("[data-sq-paper], [data-sq-pill]"), { autoAlpha: 0 });
        gsap.set(q("[data-sq-fill]"), { x: 0, y: 0, xPercent: -50, yPercent: -50, scale: 1 });
        gsap.set(q("[data-sq-bubble]"), { attr: { r: 52 } });
        gsap.set(q("[data-sq-word]"), { autoAlpha: 1 });
        gsap.set(q("[data-sq-script]"), { clipPath: "inset(-30% 0% -30% 0)" });
      });
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

    // The yellow lifts like a curtain, word and all, uncovering the page (the hero's prism rises
    // from below at the same time: see Hero.tsx, onIntroLeaving).
    const outro = () => {
      gsap
        .timeline({ onComplete: finish })
        .to(skipBtn.current, { autoAlpha: 0, duration: 0.2 }, 0)
        .add(markIntroLeaving, 0.05)
        .to(q("[data-sq-stage]"), { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, 0.05)
        .to(q("[data-sq-word-wrap]"), { yPercent: 30, duration: 0.8, ease: "expo.inOut" }, 0.05);
    };
    const startOutro = () => {
      if (outroStarted || cancelled) return;
      outroStarted = true;
      ctx.add(outro);
    };

    ctx.add(() => {
      const fill = q("[data-sq-fill]")[0] as HTMLElement;
      // The iris is a big circle (sized in CSS to cover any screen) that only ever scales
      gsap.set(fill, { x: 0, y: 0, xPercent: -50, yPercent: -50, scale: 0 });
      // The viewfinder plays in CSS (see .sq-vf in globals.css), so it shows even before this script
      // arrives on a slow phone. From here on, everything is GSAP, starting when the focus has locked.
      const lead = Math.max(0, IRIS_AT - performance.now() / 1000);
      main = gsap.timeline({ delay: lead, onComplete: () => void fontsOrTimeout.then(startOutro) });
      main
        // The shutter opens: a brand-yellow iris grows from the focus point and floods the screen
        .fromTo(fill, { scale: 0 }, { scale: 1, duration: 0.8, ease: "power3.inOut" }, 0)
        // The viewfinder fades under it; the cream goes once the yellow reaches every corner
        .to(q("[data-sq-pill]"), { autoAlpha: 0, duration: 0.25 }, 0.4)
        .set(q("[data-sq-paper]"), { autoAlpha: 0 }, 0.75)
        // The giant word builds itself out of bubbles that merge, once the yellow is nearly everywhere.
        // Keep the bubbles spread out (stagger 0.008, 0.55 s each): packed tighter (0.0045, 0.45 s) the
        // SVG filter work lands as long tasks while a big page is still loading (blocking time on
        // /travaux/ went from about 60 ms to 300-440 ms in Lighthouse).
        .set(q("[data-sq-word]"), { autoAlpha: 1 }, 0.5)
        .fromTo(q("[data-sq-bubble]"), { attr: { r: 0 } }, { attr: { r: 52 }, duration: 0.55, ease: "back.out(1.6)", stagger: { each: 0.008, from: "random" } }, 0.52)
        // "egc" is written in over it, like the logo
        .fromTo(q("[data-sq-script]"), { clipPath: "inset(-30% 100% -30% 0)" }, { clipPath: "inset(-30% 0% -30% 0)", duration: 0.5, ease: "power2.inOut" }, 1)
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

  return (
    <>
      {/* The animation itself is decorative; this tells screen readers the site is loading. */}
      <p role="status" className="sr-only">
        {t.a11y.loading}
      </p>
      <div ref={root} aria-hidden data-preloader className="fixed inset-0 z-[100] overflow-hidden">
        <div data-sq-paper className="absolute inset-0 bg-paper" />

        {/* The viewfinder: the studio is a camera. Decorative; all of it plays in CSS. */}
        <div data-sq-pill className="sq-vf absolute inset-0 font-mono text-[10px] tracking-[0.18em] text-ink/70 uppercase md:text-xs">
          <span className="sq-vf-thirds absolute" />
          <span className="sq-vf-corner sq-vf-tl absolute" />
          <span className="sq-vf-corner sq-vf-tr absolute" />
          <span className="sq-vf-corner sq-vf-bl absolute" />
          <span className="sq-vf-corner sq-vf-br absolute" />
          <span className="sq-vf-hud absolute flex items-center gap-2" style={{ top: "var(--vf-pad)", left: "var(--vf-pad)", marginTop: "0.9rem", marginLeft: "0.9rem" }}>
            <i className="sq-vf-rec block size-2 rounded-full bg-ink" />
            REC
          </span>
          <span className="sq-vf-hud absolute" style={{ top: "var(--vf-pad)", right: "var(--vf-pad)", marginTop: "0.9rem", marginRight: "0.9rem" }}>
            EGC · 001
          </span>
          <span className="sq-vf-hud absolute" style={{ bottom: "var(--vf-pad)", left: "var(--vf-pad)", marginBottom: "0.9rem", marginLeft: "0.9rem" }}>
            f/2.8 · 1/125 · ISO 400
          </span>
          <span className="sq-vf-hud absolute" style={{ bottom: "var(--vf-pad)", right: "var(--vf-pad)", marginBottom: "0.9rem", marginRight: "0.9rem" }}>
            Abidjan
          </span>
          <span className="sq-vf-focus absolute top-1/2 left-1/2" />
        </div>

        {/* Everything that lifts away at the end: the yellow and the giant word */}
        <div data-sq-stage className="absolute inset-0">
          <div data-sq-fill className="sq-fill absolute top-1/2 left-1/2 rounded-full bg-brand" />
          <div data-sq-word-wrap className="absolute inset-0 flex items-center justify-center">
            <div data-sq-word className="invisible relative w-[min(94vw,82rem)] @container">
              <svg viewBox="0 0 1000 300" className="block w-full overflow-visible">
                <defs>
                  {/* Blur then sharpen the alpha: shapes that touch melt into one ("gooey") */}
                  <filter id="sq-goo" x="-10%" y="-20%" width="120%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11" />
                  </filter>
                  <mask id="sq-mask" maskUnits="userSpaceOnUse" x="-50" y="-50" width="1100" height="400">
                    {BUBBLES.map((b, i) => (
                      <circle key={i} data-sq-bubble cx={b.cx} cy={b.cy} r="0" fill="#fff" />
                    ))}
                  </mask>
                </defs>
                <g filter="url(#sq-goo)">
                  <text
                    x="500"
                    y="238"
                    textAnchor="middle"
                    textLength="960"
                    lengthAdjust="spacingAndGlyphs"
                    mask="url(#sq-mask)"
                    className="fill-ink"
                    style={{ fontFamily: "var(--font-poppins)", fontWeight: 800, fontStyle: "italic", fontSize: 270 }}
                  >
                    studio.
                  </text>
                </g>
              </svg>
              <span
                data-sq-script
                className="font-script pointer-events-none absolute top-[-30%] left-[2%] text-[21cqw] leading-none text-white [clip-path:inset(-30%_100%_-30%_0)]"
                style={{ transform: "rotate(-8deg)", textShadow: "0 0.012em 0 rgb(14 14 14 / 0.55), 0 0 0.05em rgb(14 14 14 / 0.3)" }}
              >
                egc
              </span>
            </div>
          </div>
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
