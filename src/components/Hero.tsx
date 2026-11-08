"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLang } from "./LangProvider";
import { TransitionLink } from "./TransitionProvider";
import { LightLeaks } from "./LightLeaks";
import { CraftMotif } from "./CraftMotif";
import { HeroCollage } from "./HeroCollage";
import { onIntroDone, onIntroLeaving } from "@/lib/intro";
import { useMotionMode } from "@/lib/motion";
import { crafts } from "@/content/crafts";

gsap.registerPlugin(ScrollTrigger);

const TURN_MS = 4200; // time on each face before the prism turns to the next craft
// Ambient light behind the prism, in the colour of the craft in front (photo blue, film gold,
// poster orange, web green), like a screen glowing on the wall behind it.
const AMBIENT = ["#2f5fa8", "#b8862f", "#e0782a", "#1f7a4a"];
const mod = (n: number, m: number) => ((n % m) + m) % m;
// Which slide a face shows: it moves on to the next one while it is at the back (out of sight),
// so each time it comes round to the front it shows something new.
const slideOf = (turn: number, face: number, count: number) => {
  const k = Math.floor((turn - face + 2) / 4);
  return mod(turn >= 0 ? Math.max(0, k) : k, count); // every face starts on its first slide
};

/**
 * The studio's four crafts on a 3D prism: each face is real work (photo, film, poster, website)
 * carrying its craft's signature. It turns a quarter at a time; the words on the left pick a face,
 * and it can be spun by hand (drag or swipe, with momentum, then it settles on the nearest face).
 * Each face is lit by its angle as it turns (CSS trigonometry), and plays a small moment of its
 * craft when it arrives in front: shutter flash, scan line, handles, a page scrolling.
 * Behind it, the craft's name in outline. Pure CSS 3D: no WebGL, so it stays light on phones.
 * On a first visit the prism rises from below as the intro's yellow curtain lifts (see Preloader).
 */
export function Hero() {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const spinTween = useRef<gsap.core.Tween | null>(null);
  const released = useRef(false);
  const drag = useRef({ on: false, moved: false, x: 0, spin0: 0, last: 0, lastT: 0, v: 0 });
  const gentle = useMotionMode() === "gentle";
  // `turn` only grows when it plays by itself, so it always spins the same way.
  const [turn, setTurn] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [started, setStarted] = useState(false);
  const active = ((turn % 4) + 4) % 4;
  const craft = t.crafts[active];

  // Start turning once the intro is over.
  useEffect(() => onIntroDone(() => setStarted(true)), []);

  // No turning while the tab is in the background.
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const onVis = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (!started || paused || dragging || gentle || hidden || !inView) return;
    const id = window.setTimeout(() => setTurn((n) => n + 1), TURN_MS);
    return () => window.clearTimeout(id);
  }, [turn, started, paused, dragging, gentle, hidden, inView]);

  // The film face plays its loop only while it is in front, on screen and the tab is visible.
  useEffect(() => {
    const vids = root.current?.querySelectorAll<HTMLVideoElement>(".prism video");
    vids?.forEach((v) => {
      const face = Number(v.dataset.face);
      const play = face === active && started && !dragging && !hidden && inView && !gentle;
      if (play) {
        v.currentTime = 0;
        void v.play().catch(() => {});
      } else v.pause();
    });
  }, [active, started, dragging, hidden, inView, gentle, turn]);

  // Is the hero on screen? (no film playing, no turning, once it has been scrolled away)
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Scrolling away: the prism tips back and settles down, like an object put down on a table.
  useEffect(() => {
    const el = root.current;
    const w = wrap.current;
    if (!el || !w || gentle) return;
    const tween = gsap.to(w, {
      transformPerspective: 1200,
      rotateX: 28,
      scale: 0.86,
      yPercent: 8,
      ease: "none",
      scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.6 },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(w, { clearProps: "transform" });
    };
  }, [gentle]);

  // Turn the prism: one number, --spin, drives the rotation and the lighting of every face.
  useEffect(() => {
    const st = stage.current;
    if (!st || drag.current.on) return;
    spinTween.current?.kill();
    const fromRelease = released.current;
    released.current = false;
    spinTween.current = gsap.to(st, {
      "--spin": turn,
      duration: gentle ? 0.45 : fromRelease ? 0.75 : 1.25,
      ease: fromRelease ? "power3.out" : "power4.inOut",
    });
  }, [turn, gentle]);

  // Jump to a craft by the shortest forward path.
  const pick = (i: number) => setTurn((n) => n + ((i - (n % 4) + 4) % 4));

  // Spin by hand.
  const spinNow = () => Number(gsap.getProperty(stage.current!, "--spin")) || 0;
  const onDown = (e: React.PointerEvent) => {
    if (gentle || (e.pointerType === "mouse" && e.button !== 0)) return;
    const s = spinNow();
    drag.current = { on: true, moved: false, x: e.clientX, spin0: s, last: s, lastT: performance.now(), v: 0 };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.on) return;
    const dx = e.clientX - d.x;
    if (!d.moved) {
      if (Math.abs(dx) < 8) return;
      d.moved = true;
      setDragging(true);
      spinTween.current?.kill();
      scene.current?.setPointerCapture(e.pointerId);
    }
    const s = d.spin0 - dx / ((scene.current?.offsetWidth || 300) * 1.1);
    const now = performance.now();
    const dt = Math.max(now - d.lastT, 1);
    d.v = d.v * 0.6 + ((s - d.last) / dt) * 0.4; // turns per ms, smoothed
    d.last = s;
    d.lastT = now;
    gsap.set(stage.current, { "--spin": s });
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.on) return;
    d.on = false;
    if (!d.moved) return;
    setDragging(false);
    // Carry the momentum, then settle on the nearest face. A clear swipe (a fifth of a turn, or a
    // quick flick) always moves at least one face, so a short gesture never springs back.
    const now = spinNow();
    let target = Math.round(now + Math.max(-1.5, Math.min(1.5, d.v * 220)));
    const pushed = now - d.spin0;
    const flick = Math.abs(d.v) > 0.0015;
    if (target === Math.round(d.spin0) && (Math.abs(pushed) > 0.2 || flick)) target += Math.sign(pushed || d.v);
    // A light tick on phones that support it, as the prism clicks into place
    if (e.pointerType === "touch") navigator.vibrate?.(8);
    if (target === turn) {
      spinTween.current = gsap.to(stage.current, { "--spin": target, duration: 0.6, ease: "power3.out" });
    } else {
      released.current = true;
      setTurn(target);
    }
  };

  // Entrance after the intro, the lean toward the pointer, and the light that follows it.
  useEffect(() => {
    const el = root.current;
    const st = stage.current;
    if (!el || !st) return;
    // A full intro is about to play over the page: the prism is drawn right away underneath it
    // (its photo loads and paints early), then rises from below as the intro's curtain lifts.
    const fullIntro = !gentle && document.documentElement.dataset.intro !== "quick" && !!document.querySelector("[data-preloader]");
    const ctx = gsap.context(() => {
      if (gentle) return;
      gsap.set("[data-hero-in]", { y: 28, autoAlpha: 0 });
      if (!fullIntro) gsap.set(st, { autoAlpha: 0, scale: 0.9, rotateX: 14 });
    }, el);
    const offLeaving = onIntroLeaving(() => {
      if (!fullIntro) return;
      ctx.add(() => {
        gsap.fromTo(
          st,
          { autoAlpha: 1, y: () => window.innerHeight * 0.6, rotateX: 22, scale: 0.9 },
          // clearProps hands the transform back to the CSS tilt that follows the mouse
          { y: 0, rotateX: 0, scale: 1, duration: 1.35, ease: "expo.out", delay: 0.12, clearProps: "transform" },
        );
      });
    });
    const offIntro = onIntroDone(() => {
      ctx.add(() => {
        if (gentle) return;
        gsap.to("[data-hero-in]", { y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out", stagger: 0.07 });
        // After a full intro the prism has already risen into place (above)
        if (!fullIntro) gsap.to(st, { autoAlpha: 1, scale: 1, rotateX: 0, duration: 1.4, ease: "expo.out", delay: 0.1, clearProps: "transform" });
      });
    });

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const tiltX = gsap.quickTo(st, "--tilt-x", { duration: 0.9, ease: "power3.out" });
    const tiltY = gsap.quickTo(st, "--tilt-y", { duration: 0.9, ease: "power3.out" });
    const onPointer = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tiltY(((e.clientX - r.left) / r.width - 0.5) * 18);
      tiltX(-((e.clientY - r.top) / r.height - 0.5) * 12);
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    if (fine && !gentle) el.addEventListener("pointermove", onPointer);
    return () => {
      offIntro();
      offLeaving();
      el.removeEventListener("pointermove", onPointer);
      ctx.revert();
    };
  }, [gentle]);

  return (
    <section
      ref={root}
      id="top"
      className="relative isolate overflow-hidden bg-ink text-paper"
      style={{ "--ambient": AMBIENT[active] } as React.CSSProperties}
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setPaused(false)}
    >
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_70%_60%_at_70%_45%,#2e2b28_0%,#0e0e0e_70%)]" />
      <div aria-hidden className="hero-ambient absolute inset-0 -z-10" />
      <div aria-hidden className="hero-spot absolute inset-0 -z-10" />
      <LightLeaks className="opacity-60" />

      <div className="mx-auto grid min-h-[100svh] max-w-[110rem] items-center gap-10 px-5 pt-28 pb-14 md:px-10 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:pt-24">
        <div className="order-2 lg:order-1">
          <p data-hero-in className="text-xs font-medium tracking-[0.28em] text-paper/60 uppercase md:text-sm">
            {t.hero.kicker}
          </p>

          <h1 className="mt-5">
            <span className="sr-only">EGC Studio : </span>
            {/* The four crafts double as the prism's controls */}
            <span className="flex flex-wrap gap-x-[0.28em] font-display text-[clamp(2.9rem,9.5vw,8.2rem)] leading-[0.92] font-semibold tracking-[-0.045em] lg:flex-col">
              {t.crafts.map((c, i) => (
                <button
                  key={c.key}
                  type="button"
                  data-hero-in
                  onClick={() => pick(i)}
                  aria-pressed={i === active}
                  className={`group relative w-fit cursor-pointer text-left transition-colors duration-500 ${i === active ? "text-paper" : "text-paper/22 hover:text-paper/55"}`}
                >
                  {c.name}
                  <span className={i === active ? "text-brand" : ""}>.</span>
                  <sup className={`absolute -top-1 -right-6 font-sans text-xs font-medium tracking-normal tabular-nums transition-opacity duration-500 md:text-sm ${i === active ? "text-brand opacity-100" : "opacity-0"}`}>
                    0{i + 1}
                  </sup>
                </button>
              ))}
            </span>
          </h1>

          <p data-hero-in className="mt-8 max-w-[34rem] text-lg leading-snug text-paper/85 md:text-xl">
            {t.hero.line}
          </p>

          <div data-hero-in className="mt-8 flex flex-wrap items-center gap-3">
            <TransitionLink
              href="/travaux/"
              data-magnetic
              className="flex h-12 items-center rounded-full bg-paper px-6 text-sm font-medium text-ink transition-transform duration-200 hover:scale-[1.03] active:scale-95"
            >
              {t.hero.cta}
            </TransitionLink>
            <TransitionLink
              href="/contact/"
              className="flex h-12 items-center rounded-full border border-paper/30 px-6 text-sm font-medium transition-colors duration-200 hover:bg-paper/10 active:scale-95"
            >
              {t.hero.quote}
            </TransitionLink>
            <span className="ml-2 flex items-center gap-2 text-sm text-paper/70">
              <span className="size-1.5 rounded-full bg-brand" />
              {t.hero.status}
            </span>
          </div>
        </div>

        {/* The prism */}
        <div className="relative order-1 flex flex-col items-center lg:order-2">
          {/* The craft's name in outline behind the prism, re-lettered at each turn */}
          <div aria-hidden className="hero-word absolute top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2">
            <span key={turn} className="block">
              {craft.name.split("").map((ch, i) => (
                <span key={i} style={{ animationDelay: `${0.35 + i * 0.05}s` }}>
                  {ch}
                </span>
              ))}
            </span>
          </div>

          {/* Tips back as the page scrolls away (wrapper, so it doesn't fight the tilt and the spin) */}
          <div ref={wrap} className="prism-wrap relative">
          <HeroCollage />
          <div
            ref={scene}
            className="prism-scene"
            style={{ perspective: "1600px" }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onClickCapture={(e) => {
              // A drag ends with a click on the face under the pointer: don't follow that link.
              if (drag.current.moved) {
                e.preventDefault();
                e.stopPropagation();
                drag.current.moved = false;
              }
            }}
            onDragStart={(e) => e.preventDefault()}
            onKeyDown={(e) => {
              // Arrow keys turn the prism when its face has the keyboard focus
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault();
                setTurn((n) => n + (e.key === "ArrowRight" ? 1 : -1));
              }
            }}
          >
            <div
              ref={stage}
              className="prism-stage relative"
              style={{ "--tilt-x": 0, "--tilt-y": 0, "--spin": 0 } as React.CSSProperties}
            >
              <div className="prism">
                {crafts.map((c, i) => {
                  const slide = c.slides[slideOf(turn, i, c.slides.length)];
                  return (
                  <TransitionLink
                    key={c.key}
                    href={c.href}
                    tabIndex={i === active ? 0 : -1}
                    aria-hidden={i !== active}
                    data-craft={c.key}
                    className={`prism-face group overflow-hidden rounded-[1.4rem] bg-graphite shadow-2xl shadow-black/50 ${i === active && !dragging ? "is-front" : ""}`}
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    {/* The link's name comes from its content (no aria-label over the visible readout) */}
                    <span className="sr-only">{`${t.crafts[i].verb} : ${t.crafts[i].what}`}</span>
                    {/* The slideshow: a new picture each time the face comes round (keyed, so the old
                        one is replaced while the face is at the back) */}
                    <Image
                      key={slide.src}
                      src={slide.src}
                      alt=""
                      width={slide.w}
                      height={slide.h}
                      sizes="(min-width: 1024px) 26rem, 72vw"
                      preload={i === 0 && slide.src === c.image}
                      draggable={false}
                      className={`size-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04] ${c.key === "web" ? "object-top pt-9" : ""}`}
                    />
                    {slide.video && (
                      <video
                        key={slide.video}
                        data-face={i}
                        src={slide.video}
                        muted
                        loop
                        playsInline
                        preload="none"
                        aria-hidden
                        className="absolute inset-0 size-full object-cover"
                      />
                    )}
                    <span className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-ink/10" />
                    <span className="prism-scan" />
                    <span className="prism-motif absolute inset-0">
                      <CraftMotif craft={c.key} meta={t.crafts[i].meta} />
                    </span>
                    <span className="prism-flash" />
                    <span className="prism-shade" />
                    <span className="prism-sheen" />
                  </TransitionLink>
                  );
                })}
              </div>
            </div>
          </div>
          </div>

          {/* Caption and progress for the face in front */}
          <div data-hero-in className="mt-8 flex w-[var(--prism-w)] max-w-full flex-col items-center gap-3 text-center">
            <p aria-live="polite" className="text-sm text-paper/80 md:text-base">
              <span className="font-serif text-lg text-brand italic md:text-xl">{craft.verb}</span>
              <span className="text-paper/60"> · {craft.what}</span>
            </p>
            <div className="flex gap-2" aria-label={t.hero.pick}>
              {t.crafts.map((c, i) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => pick(i)}
                  aria-label={c.name}
                  aria-pressed={i === active}
                  className="relative h-1 w-10 cursor-pointer overflow-hidden rounded-full bg-paper/20"
                >
                  {i === active && (
                    <span
                      key={turn}
                      className={`absolute inset-0 origin-left rounded-full bg-brand ${started && !paused && !dragging && !gentle ? "prism-progress" : ""}`}
                      style={{ animationDuration: `${TURN_MS}ms` }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
