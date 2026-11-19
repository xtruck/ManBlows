"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLang } from "./LangProvider";
import { getLenis } from "./SmoothScroll";
import { openAssistant, type AssistantService } from "@/lib/assistant";
import { useMotionMode } from "@/lib/motion";
import { loop } from "@/content/crafts";
import { films } from "@/content/site";
import { photoShots } from "@/content/photos";
import { designShots } from "@/content/design";

/*
 * The opening of each craft page, each in the visual language of its craft (the same one the
 * intro uses, see Preloader.tsx), so the four pages don't open alike:
 *   Photo   a viewfinder: the picture in the frame changes with a shutter blink and the focus locks
 *   Vidéo   a cinema screen: full-bleed loops in letterbox, REC, a running timecode, scene picker
 *   Design  an artboard: posters on a canvas, a selection with handles, a layers panel, swatches
 * The Web page keeps its own opening (WebStudio.tsx: a laptop and phone showcase).
 * Every slideshow pauses while hovered or focused, and stays still in gentle motion mode.
 */

const pad = (n: number) => String(n).padStart(2, "0");

/** Moves to the next slide every `ms` while `run` is true. */
function useCycle(count: number, ms: number, run: boolean) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!run || count < 2) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % count), ms);
    return () => window.clearInterval(id);
  }, [count, ms, run, i]); // `i` restarts the wait after a manual pick
  return [i, setI] as const;
}

/** Hover and keyboard focus pause a slideshow. */
function usePause() {
  const [paused, setPaused] = useState(false);
  const handlers = {
    onPointerEnter: (e: React.PointerEvent) => e.pointerType === "mouse" && setPaused(true),
    onPointerLeave: () => setPaused(false),
    onFocus: () => setPaused(true),
    onBlur: (e: React.FocusEvent) => !e.currentTarget.contains(e.relatedTarget) && setPaused(false),
  };
  return [paused, handlers] as const;
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(el, { offset: -80 });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Actions({ service, cta, secondary, target, dark }: { service: AssistantService; cta: string; secondary: string; target: string; dark?: boolean }) {
  return (
    <div data-reveal className="mt-9 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => openAssistant({ service })}
        className="flex h-12 cursor-pointer items-center rounded-full bg-brand px-6 text-sm font-medium text-ink transition-transform duration-200 hover:scale-[1.03] active:scale-95"
      >
        {cta}
      </button>
      <button
        type="button"
        onClick={() => scrollToId(target)}
        className={`flex h-12 cursor-pointer items-center gap-2 rounded-full border px-6 text-sm font-medium transition-colors active:scale-95 ${
          dark ? "border-paper/30 hover:bg-paper/10" : "border-ink/20 hover:bg-ink/5"
        }`}
      >
        {secondary}
        <svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
      </button>
    </div>
  );
}

function Title({ title, accent }: { title: string; accent: string }) {
  return (
    <h1 data-reveal className="mt-5 font-display text-[clamp(3rem,8.5vw,7.5rem)] leading-[0.9] font-semibold tracking-[-0.045em]">
      {title} <span className="font-serif font-normal tracking-[-0.02em] text-brand italic">{accent}</span>
    </h1>
  );
}

/* ---------------------------------------------------------------- Photo: the viewfinder */

const PHOTO_PICKS = [12, 26, 31, 17, 36, 30, 15];
const photoPicks = PHOTO_PICKS.map((n) => photoShots.find((p) => p.src.endsWith(`/photo-${pad(n)}.webp`))).filter((p) => p !== undefined);

function PhotoHero() {
  const { t } = useLang();
  const h = t.craftHero.photo;
  const meta = t.crafts[0].meta;
  const full = useMotionMode() === "full";
  const [paused, pause] = usePause();
  const [i, setI] = useCycle(photoPicks.length, 4200, full && !paused);
  const shot = photoPicks[i];

  return (
    <section className="relative isolate overflow-clip bg-paper px-4 pt-28 pb-16 md:px-8 md:pt-36 md:pb-24">
      <div className="mx-auto grid max-w-[110rem] grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <p data-reveal className="font-mono text-xs tracking-[0.28em] text-ink/60 uppercase md:text-sm">
            {h.eyebrow}
          </p>
          <Title title={h.title} accent={h.accent} />
          <p data-reveal className="mt-8 max-w-[36rem] text-lg leading-relaxed text-muted md:text-xl">
            {h.intro}
          </p>
          <Actions service="photo" cta={h.cta} secondary={h.secondary} target="galerie" />
          <ul data-reveal className="mt-10 flex max-w-[36rem] flex-wrap gap-x-6 gap-y-2 border-t border-ink/15 pt-6 font-mono text-[11px] tracking-[0.16em] text-ink/60 uppercase">
            {h.stats.map((s) => (
              <li key={s} className="flex items-center gap-2">
                <span aria-hidden className="size-1.5 rounded-full bg-brand ring-1 ring-ink/30" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div {...pause} className="mx-auto w-full max-w-[30rem]">
          {/* The viewfinder */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-[4px] bg-ink">
            {photoPicks.map((p, n) => (
              <Image
                key={p.src}
                src={p.src}
                alt={n === i ? (p.client ? `${p.place}, ${p.client}` : p.place) : ""}
                fill
                priority={n === 0}
                sizes="(min-width: 1024px) 30rem, 90vw"
                className={`object-cover transition-opacity duration-500 ${n === i ? "opacity-100" : "opacity-0"}`}
              />
            ))}
            <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-ink/35 via-transparent to-ink/45" />
            <span aria-hidden className="vf-thirds absolute inset-[7%]" />
            <span aria-hidden className="vf-corner vf-tl absolute" />
            <span aria-hidden className="vf-corner vf-tr absolute" />
            <span aria-hidden className="vf-corner vf-bl absolute" />
            <span aria-hidden className="vf-corner vf-br absolute" />
            {/* The focus square locks again on each new picture */}
            <span key={`f${i}`} aria-hidden className="vf-focus absolute top-[38%] left-1/2" />
            <span aria-hidden className="absolute top-[7%] left-1/2 flex -translate-x-1/2 items-center gap-1.5 pt-2 font-mono text-[10px] tracking-[0.18em] text-paper/85 md:text-[11px]">
              <i className="block size-1.5 rounded-full bg-brand" /> AF·S
            </span>
            <span aria-hidden className="absolute inset-x-[9%] bottom-[7%] flex justify-between gap-3 pb-2 font-mono text-[10px] tracking-[0.14em] text-paper/85 tabular-nums md:text-[11px]">
              <span className="min-w-0 truncate">{meta.join(" · ")}</span>
              <span>
                {h.frame} {pad(i + 1)}/{pad(photoPicks.length)}
              </span>
            </span>
            {/* The shutter blinks on each change */}
            <span key={`a${i}`} aria-hidden className="vf-blade vf-blade-top absolute inset-x-0 top-0 h-1/2 bg-ink" />
            <span key={`b${i}`} aria-hidden className="vf-blade vf-blade-bottom absolute inset-x-0 bottom-0 h-1/2 bg-ink" />
          </div>
          <p className="mt-3 truncate text-sm text-muted" aria-live="polite">
            {shot.client ? `${shot.place} · ${shot.client}` : shot.place}
          </p>
          {/* Contact sheet: pick a frame */}
          <div role="group" aria-label={h.pick} className="mt-3 grid grid-cols-7 gap-1.5">
            {photoPicks.map((p, n) => (
              <button
                key={p.src}
                type="button"
                aria-label={`${h.frame} ${n + 1}`}
                aria-pressed={n === i}
                onClick={() => setI(n)}
                className={`relative aspect-[4/5] cursor-pointer overflow-hidden rounded-[3px] transition-all duration-300 ${
                  n === i ? "ring-2 ring-brand ring-offset-2 ring-offset-paper" : "opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={p.src} alt="" fill sizes="4rem" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Vidéo: the cinema screen */

const SCENES = ["maracana", "film-2585", "archibat", "sii-invitation"].map((n) => {
  const f = films.find((x) => x.video.endsWith(`/${n}.mp4`));
  return { ...loop(n), title: f?.title, kind: f?.kind };
});

function timecode(seconds: number) {
  const s = Math.max(0, seconds);
  return `00:00:${pad(Math.floor(s))}:${pad(Math.floor((s % 1) * 25))}`;
}

function VideoHero() {
  const { t, lang } = useLang();
  const h = t.craftHero.video;
  const full = useMotionMode() === "full";
  const [i, setI] = useState(0);
  // The visitor's own play / pause choice wins; until then it follows the motion mode
  const [choice, setChoice] = useState<boolean | null>(null);
  const playing = choice ?? full;
  const video = useRef<HTMLVideoElement>(null);
  const tc = useRef<HTMLSpanElement>(null);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);

  // Plays the current scene (or holds it on its first frame), and keeps the timecode and the
  // scene's progress bar in step with the picture
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    let raf = 0;
    const tick = () => {
      if (tc.current) tc.current.textContent = timecode(v.currentTime);
      const bar = bars.current[i];
      if (bar && v.duration) bar.style.transform = `scaleX(${v.currentTime / v.duration})`;
      raf = requestAnimationFrame(tick);
    };
    bars.current.forEach((b, n) => b && n !== i && (b.style.transform = `scaleX(${n < i ? 1 : 0})`));
    if (playing) v.play().catch(() => setChoice(false));
    else v.pause();
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [i, playing]);

  const scene = SCENES[i];
  const next = useCallback(() => setI((n) => (n + 1) % SCENES.length), []);

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink text-paper">
      <video
        key={scene.video}
        ref={video}
        src={scene.video}
        poster={scene.src}
        muted
        playsInline
        preload="auto"
        onEnded={next}
        aria-hidden
        className="cine-in absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/40 to-ink/30" />
      {/* Letterbox bars with the film's sprocket holes */}
      <span aria-hidden className="cine-bar relative z-10 block h-[7vh] min-h-10 shrink-0 bg-ink" />
      <span aria-hidden className="cine-bar absolute inset-x-0 bottom-0 z-10 block h-[7vh] min-h-10 bg-ink" />

      <div className="relative flex flex-1 flex-col justify-between px-4 pt-20 pb-[calc(7vh+2rem)] md:px-8 md:pt-24">
        {/* Camera display */}
        <div aria-hidden className="flex items-start justify-between font-mono text-[11px] tracking-[0.18em] uppercase md:text-xs">
          <span className="flex items-center gap-2">
            <i className={`block size-2.5 rounded-full bg-brand ${playing ? "pl-rec" : ""}`} /> {playing ? "REC" : "STBY"}
          </span>
          <span className="flex flex-col items-end gap-1 text-paper/75">
            <span ref={tc} className="text-base tracking-[0.08em] text-paper tabular-nums md:text-xl">
              00:00:00:00
            </span>
            <span>
              {h.scene} {pad(i + 1)} · {t.crafts[1].meta.join(" · ")}
            </span>
          </span>
        </div>

        <div className="mt-16 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <p data-reveal className="font-mono text-xs tracking-[0.28em] text-paper/70 uppercase md:text-sm">
              {h.eyebrow}
            </p>
            <Title title={h.title} accent={h.accent} />
            <p data-reveal className="mt-7 max-w-[34rem] text-lg leading-relaxed text-paper/80 md:text-xl">
              {h.intro}
            </p>
            <Actions service="video" cta={h.cta} secondary={h.secondary} target="films" dark />
          </div>

          {/* Scene picker: each scene's bar fills while it plays, then the next one starts */}
          <div className="w-full">
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="min-w-0 truncate text-sm text-paper/80" aria-live="polite">
                {scene.kind ? `${scene.kind[lang]} · ` : ""}
                {scene.title?.[lang]}
              </p>
              <button
                type="button"
                onClick={() => setChoice(!playing)}
                aria-label={playing ? h.pause : h.play}
                className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-paper/30 transition-colors hover:bg-paper/10 active:scale-95"
              >
                <svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="currentColor">
                  {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13l10.5-6.5z" />}
                </svg>
              </button>
            </div>
            <div role="group" aria-label={h.pick} className="grid grid-cols-4 gap-2">
              {SCENES.map((s, n) => (
                <button
                  key={s.video}
                  type="button"
                  aria-pressed={n === i}
                  aria-label={`${h.scene} ${n + 1}${s.title ? `, ${s.title[lang]}` : ""}`}
                  onClick={() => setI(n)}
                  className="group cursor-pointer text-left"
                >
                  <span className={`relative block aspect-video overflow-hidden rounded-[4px] transition-opacity ${n === i ? "" : "opacity-55 group-hover:opacity-90"}`}>
                    <Image src={s.src} alt="" fill sizes="10rem" className="object-cover" />
                  </span>
                  <span className="mt-2 block h-[3px] overflow-hidden bg-paper/20">
                    <span
                      ref={(el) => {
                        bars.current[n] = el;
                      }}
                      className="block h-full origin-left bg-brand [transform:scaleX(0)]"
                    />
                  </span>
                  <span className="mt-1.5 block font-mono text-[10px] tracking-[0.16em] text-paper/60 uppercase">{pad(n + 1)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Design: the artboard */

const DESIGN_PICKS = [2, 37, 34, 20, 3, 7];
const designPicks = DESIGN_PICKS.map((n) => designShots.find((d) => d.src.endsWith(`/design-${pad(n)}.webp`))).filter((d) => d !== undefined);
const SWATCHES = ["#ffc400", "#0e0e0e", "#f3ecdc", "#e4572e", "#1f6f8b", "#2f855a"];
const HANDLES = ["0% 0%", "50% 0%", "100% 0%", "100% 50%", "100% 100%", "50% 100%", "0% 100%", "0% 50%"];

function DesignHero() {
  const { t } = useLang();
  const h = t.craftHero.design;
  const full = useMotionMode() === "full";
  const [paused, pause] = usePause();
  const [i, setI] = useCycle(designPicks.length, 3600, full && !paused);
  const count = designPicks.length;
  const shot = designPicks[i];

  return (
    <section className="pl-grid relative isolate overflow-clip bg-paper px-4 pt-28 pb-16 md:px-8 md:pt-36 md:pb-24">
      <div className="mx-auto grid max-w-[110rem] grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
        <div>
          <p data-reveal className="font-mono text-xs tracking-[0.28em] text-ink/60 uppercase md:text-sm">
            {h.eyebrow}
          </p>
          <Title title={h.title} accent={h.accent} />
          <p data-reveal className="mt-8 max-w-[36rem] text-lg leading-relaxed text-muted md:text-xl">
            {h.intro}
          </p>
          <Actions service="design" cta={h.cta} secondary={h.secondary} target="galerie" />
          <div data-reveal className="mt-10 border-t border-ink/15 pt-6">
            <p className="font-mono text-[11px] tracking-[0.16em] text-ink/60 uppercase">{h.swatches}</p>
            <ul aria-hidden className="mt-3 flex gap-2">
              {SWATCHES.map((c) => (
                <li key={c} className="flex flex-col items-center gap-1.5">
                  <span className="block size-9 rounded-full ring-1 ring-ink/15" style={{ background: c }} />
                  <span className="font-mono text-[9px] text-ink/50 uppercase">{c.slice(1)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div {...pause} className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-[minmax(0,1fr)_11rem]">
          {/* The canvas: the poster in front is selected, the others wait behind it */}
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[28rem]">
            {designPicks.map((d, n) => {
              const depth = (n - i + count) % count; // 0 = in front
              const back = Math.min(depth, 3);
              return (
                <div
                  key={d.src}
                  aria-hidden={depth !== 0}
                  className="art-sheet absolute inset-[6%] flex items-center justify-center"
                  style={{
                    zIndex: count - depth,
                    transform: `translate(${back * 4}%, ${-back * 3}%) rotate(${depth ? (n % 2 ? 5 : -6) * (back / 3 + 0.4) : 0}deg) scale(${1 - back * 0.06})`,
                    opacity: depth > 3 ? 0 : 1,
                  }}
                >
                  <div className="relative max-h-full max-w-full shadow-[0_1.5rem_3rem_-1rem_rgb(14_14_14/0.45)]" style={{ aspectRatio: `${d.w} / ${d.h}`, height: d.h >= d.w ? "100%" : "auto", width: d.h >= d.w ? "auto" : "100%" }}>
                    <Image src={d.src} alt={depth === 0 ? `${d.place}${d.client ? `, ${d.client}` : ""}` : ""} fill priority={n === 0} sizes="(min-width: 1024px) 26rem, 80vw" className="object-cover" />
                    {depth === 0 && (
                      <>
                        <span aria-hidden className="art-select absolute -inset-[6px] border-[1.5px] border-ink">
                          {HANDLES.map((p) => {
                            const [x, y] = p.split(" ");
                            return <i key={p} className="absolute block size-[9px] -translate-x-1/2 -translate-y-1/2 border-[1.5px] border-ink bg-brand" style={{ left: x, top: y }} />;
                          })}
                        </span>
                        <span aria-hidden className="art-dim absolute top-[calc(100%+14px)] left-1/2 -translate-x-1/2 rounded-full bg-ink px-2.5 py-0.5 font-mono text-[10px] whitespace-nowrap text-brand tabular-nums">
                          {d.w} × {d.h}
                        </span>
                        <svg aria-hidden viewBox="0 0 24 24" className="art-cursor absolute top-full left-full -mt-1 -ml-1 block size-6">
                          <path d="M3 2l7.5 19 2.6-7.6L21 10.8z" fill="var(--ink)" stroke="var(--paper)" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Layers panel: pick a poster */}
          <div className="self-center rounded-xl border border-ink/15 bg-paper/90 p-2 shadow-[0_1rem_2rem_-1.5rem_rgb(14_14_14/0.4)] backdrop-blur-sm">
            <p className="flex items-center justify-between px-2 pt-1 pb-2 font-mono text-[10px] tracking-[0.16em] text-ink/60 uppercase">
              {h.layers}
              <span className="tabular-nums">
                {pad(i + 1)}/{pad(count)}
              </span>
            </p>
            <div role="group" aria-label={h.pick} className="grid grid-cols-3 gap-1 sm:grid-cols-1">
              {designPicks.map((d, n) => (
                <button
                  key={d.src}
                  type="button"
                  aria-pressed={n === i}
                  onClick={() => setI(n)}
                  className={`flex min-w-0 cursor-pointer items-center gap-2 rounded-lg p-1.5 text-left text-xs transition-colors ${n === i ? "bg-brand text-ink" : "hover:bg-ink/5"}`}
                >
                  <span className="relative size-8 shrink-0 overflow-hidden rounded-[3px] ring-1 ring-ink/15">
                    <Image src={d.src} alt="" fill sizes="2rem" className="object-cover" />
                  </span>
                  <span className="hidden min-w-0 truncate sm:block">{d.client ?? d.place}</span>
                  <span className="sr-only sm:hidden">{d.client ?? d.place}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {shot.place}
        {shot.client ? `, ${shot.client}` : ""}
      </p>
    </section>
  );
}

/** The opening of a craft page. */
export function CraftHero({ craft }: { craft: "photo" | "video" | "design" }) {
  if (craft === "photo") return <PhotoHero />;
  if (craft === "video") return <VideoHero />;
  return <DesignHero />;
}

