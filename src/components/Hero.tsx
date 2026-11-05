"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useLang } from "./LangProvider";
import { TransitionLink } from "./TransitionProvider";
import { LightLeaks } from "./LightLeaks";
import { CraftMotif } from "./CraftMotif";
import { onIntroDone } from "@/lib/intro";
import { useMotionMode } from "@/lib/motion";
import { crafts } from "@/content/crafts";

const TURN_MS = 4200; // time on each face before the prism turns to the next craft

/**
 * The studio's four crafts on a 3D prism: each face is real work (photo, film, poster, this
 * website) carrying its craft's signature. The prism turns a quarter at a time, always in the
 * same direction; the words on the left pick a face. It leans toward the pointer on a mouse.
 * Pure CSS 3D: no WebGL, so it stays light on phones.
 */
export function Hero() {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const gentle = useMotionMode() === "gentle";
  // `turn` only ever grows, so going from Web back to Photo keeps spinning the same way.
  const [turn, setTurn] = useState(0);
  const [paused, setPaused] = useState(false);
  const [started, setStarted] = useState(false);
  const active = ((turn % 4) + 4) % 4;
  const craft = t.crafts[active];

  // Start turning once the intro is over.
  useEffect(() => onIntroDone(() => setStarted(true)), []);

  useEffect(() => {
    if (!started || paused || gentle) return;
    const id = window.setTimeout(() => setTurn((n) => n + 1), TURN_MS);
    return () => window.clearTimeout(id);
  }, [turn, started, paused, gentle]);

  // Jump to a craft by the shortest forward path.
  const pick = (i: number) => setTurn((n) => n + ((i - (n % 4) + 4) % 4));

  // Entrance after the intro, and the lean toward the pointer.
  useEffect(() => {
    const el = root.current;
    const st = stage.current;
    if (!el || !st) return;
    const ctx = gsap.context(() => {
      if (gentle) return;
      gsap.set("[data-hero-in]", { y: 28, autoAlpha: 0 });
      gsap.set(st, { autoAlpha: 0, scale: 0.9, rotateX: 14 });
    }, el);
    const offIntro = onIntroDone(() => {
      ctx.add(() => {
        if (gentle) return;
        gsap.to("[data-hero-in]", { y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out", stagger: 0.07 });
        gsap.to(st, { autoAlpha: 1, scale: 1, rotateX: 0, duration: 1.4, ease: "expo.out", delay: 0.1 });
      });
    });

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const tiltX = gsap.quickTo(st, "--tilt-x", { duration: 0.9, ease: "power3.out" });
    const tiltY = gsap.quickTo(st, "--tilt-y", { duration: 0.9, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tiltY(((e.clientX - r.left) / r.width - 0.5) * 18);
      tiltX(-((e.clientY - r.top) / r.height - 0.5) * 12);
    };
    if (fine && !gentle) el.addEventListener("pointermove", onMove);
    return () => {
      offIntro();
      el.removeEventListener("pointermove", onMove);
      ctx.revert();
    };
  }, [gentle]);

  return (
    <section
      ref={root}
      id="top"
      className="relative isolate overflow-hidden bg-ink text-paper"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_70%_60%_at_70%_45%,#2e2b28_0%,#0e0e0e_70%)]" />
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
        <div className="order-1 flex flex-col items-center lg:order-2">
          <div className="prism-scene" style={{ perspective: "1600px" }}>
            <div
              ref={stage}
              className="prism-stage relative"
              style={{ "--tilt-x": 0, "--tilt-y": 0 } as React.CSSProperties}
            >
              <div className="prism" style={{ "--turn": turn } as React.CSSProperties}>
                {crafts.map((c, i) => (
                  <TransitionLink
                    key={c.key}
                    href={c.href}
                    tabIndex={i === active ? 0 : -1}
                    aria-hidden={i !== active}
                    aria-label={`${t.crafts[i].verb} : ${t.crafts[i].what}`}
                    className="prism-face group overflow-hidden rounded-[1.4rem] bg-graphite shadow-2xl shadow-black/50"
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    <Image
                      src={c.image}
                      alt=""
                      width={c.w}
                      height={c.h}
                      sizes="(min-width: 1024px) 26rem, 72vw"
                      preload={i === 0}
                      className={`size-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04] ${c.key === "web" ? "object-top pt-9" : ""}`}
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-ink/10" />
                    <CraftMotif craft={c.key} meta={t.crafts[i].meta} />
                  </TransitionLink>
                ))}
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
                      className={`absolute inset-0 origin-left rounded-full bg-brand ${started && !paused && !gentle ? "prism-progress" : ""}`}
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
