"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useMotionMode } from "@/lib/motion";
import { LaptopMockup, PhoneMockup } from "./ui/device-mockups";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const shot = (name: string) => `${base}/web/${name}.webp`;

export type Work = { name: string; kind: string; url: string; desk: string; phone: string; concept: boolean; sector: string };

type Labels = {
  region: string;
  prev: string;
  next: string;
  pause: string;
  play: string;
  visit: string;
  concept: string;
  delivered: string;
  sectors: Record<string, string>;
};

const SLIDE_MS = 5000;

function Svg({ d }: { d: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

/**
 * The hero of the Web page: a laptop and a phone showing, one after the other, every site the studio
 * built. It moves on by itself (and stops while the visitor hovers, when the tab or the section is
 * out of view, in calm mode, or on pause), and can be driven with the arrows, a swipe or the keyboard.
 * A sticker says whether the site was delivered to a client or is a concept the studio made on its own.
 */
export function SiteShowcase({ works, labels }: { works: readonly Work[]; labels: Labels }) {
  const total = works.length;
  const calm = useMotionMode() === "gentle";
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null); // the site that is fading out
  const [playing, setPlaying] = useState(true);
  const [hover, setHover] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const drag = useRef<number | null>(null);

  const go = useCallback(
    (to: number) => {
      setLeaving(index);
      setIndex(((to % total) + total) % total);
    },
    [index, total],
  );

  // The previous site stays under the new one just long enough to fade out
  useEffect(() => {
    if (leaving === null) return;
    const id = window.setTimeout(() => setLeaving(null), 900);
    return () => window.clearTimeout(id);
  }, [leaving, index]);

  // Moves on by itself
  const running = playing && !calm && !hover && onScreen;
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => go(index + 1), SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [running, index, go]);

  // Only while the section is on screen
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Warm up the next site so it is there when it comes
  useEffect(() => {
    const next = works[(index + 1) % total];
    for (const name of [next.desk, next.phone]) {
      const img = new window.Image();
      img.src = shot(name);
    }
  }, [index, total, works]);

  const work = works[index];
  const shown = leaving === null ? [index] : [leaving, index];

  const onMove = (e: React.PointerEvent) => {
    const el = tilt.current;
    if (!el || e.pointerType !== "mouse" || document.documentElement.dataset.motion === "gentle") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--ry", `${-9 + ((e.clientX - r.left) / r.width - 0.5) * 8}deg`);
    el.style.setProperty("--rx", `${3 - ((e.clientY - r.top) / r.height - 0.5) * 6}deg`);
  };
  const onLeave = () => {
    tilt.current?.style.removeProperty("--rx");
    tilt.current?.style.removeProperty("--ry");
    setHover(false);
  };

  const arrow = "flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-paper/25 text-paper transition-colors duration-200 hover:border-brand hover:bg-brand hover:text-ink active:scale-95";

  return (
    <div
      ref={root}
      role="group"
      aria-roledescription="carousel"
      aria-label={labels.region}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        else if (e.key === "ArrowLeft") go(index - 1);
      }}
      className="relative mx-auto w-full max-w-[46rem] min-w-0 rounded-3xl outline-offset-8"
    >
      {/* the studio's yellow, glowing behind the screen */}
      <div aria-hidden className="pointer-events-none absolute top-[4%] left-[-6%] -z-10 h-[78%] w-[112%] rounded-full bg-[radial-gradient(closest-side,rgb(255_196_0/0.28),transparent)] blur-2xl" />

      <div
        ref={tilt}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onPointerDown={(e) => (drag.current = e.clientX)}
        onPointerUp={(e) => {
          if (drag.current !== null && Math.abs(e.clientX - drag.current) > 50) go(index + (e.clientX < drag.current ? 1 : -1));
          drag.current = null;
        }}
        onPointerCancel={() => (drag.current = null)}
        className="showcase-tilt relative touch-pan-y select-none"
      >
        <div className="relative w-[88%]">
          <LaptopMockup className="drop-shadow-[0_2.5rem_3rem_rgb(0_0_0/0.55)]">
            {shown.map((i) => (
              <Image
                key={i}
                src={shot(works[i].desk)}
                alt={i === index ? `${works[i].name}, ${works[i].kind}` : ""}
                fill
                sizes="(min-width: 1024px) 40rem, 92vw"
                className={`object-cover object-top ${leaving === null ? "" : i === index ? "site-in" : "site-out"}`}
                preload={i === 0}
              />
            ))}
          </LaptopMockup>
        </div>

        {/* the phone, standing in front of the laptop */}
        <div className="absolute right-0 bottom-[-4%] w-[25%] [filter:drop-shadow(0_1.5rem_1.5rem_rgb(0_0_0/0.6))]">
          <PhoneMockup>
            {shown.map((i) => (
              <Image key={i} src={shot(works[i].phone)} alt="" fill sizes="(min-width: 1024px) 12rem, 25vw" className={`object-cover object-top ${leaving === null ? "" : i === index ? "site-in" : "site-out"}`} />
            ))}
          </PhoneMockup>
        </div>

        {/* a sticker, like the ones around the home page's prism */}
        <span
          key={index}
          className={`site-in absolute top-[-4%] right-[8%] z-10 rotate-6 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide shadow-xl shadow-black/40 ${
            work.concept ? "bg-[#ffb3d6] text-ink" : "bg-brand text-ink"
          }`}
        >
          {work.concept ? labels.concept : labels.delivered}
        </span>
      </div>

      {/* which site, and the controls */}
      <div className="mt-12 flex flex-col gap-5 sm:mt-14 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div aria-live={playing && !calm ? "off" : "polite"} className="min-w-0">
          <p className="text-xs font-medium tracking-[0.22em] text-paper/60 uppercase tabular-nums">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} · {labels.sectors[work.sector] ?? ""}
          </p>
          <p className="mt-2 font-display text-3xl leading-[1.05] font-semibold tracking-[-0.03em] break-words md:text-4xl">{work.name}</p>
          <p className="mt-1.5 text-paper/70">{work.kind}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={() => go(index - 1)} aria-label={labels.prev} className={arrow}>
            <Svg d="M15 6l-6 6 6 6" />
          </button>
          {!calm && (
            <button type="button" onClick={() => setPlaying((p) => !p)} aria-pressed={!playing} aria-label={playing ? labels.pause : labels.play} className={arrow}>
              {playing ? <Svg d="M9 6v12M15 6v12" /> : <Svg d="M8 5.5v13l11-6.5z" />}
            </button>
          )}
          <button type="button" onClick={() => go(index + 1)} aria-label={labels.next} className={arrow}>
            <Svg d="M9 6l6 6-6 6" />
          </button>
          <a href={`https://${work.url}`} target="_blank" rel="noopener noreferrer" aria-label={`${labels.visit} : ${work.name}`} title={labels.visit} className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-ink transition-transform duration-200 hover:scale-105 active:scale-95">
            <Svg d="M7 17L17 7M9 7h8v8" />
          </a>
        </div>
      </div>
      {/* time left on this site */}
      <div aria-hidden className="mt-5 h-0.5 overflow-hidden rounded-full bg-paper/15">
        {running && !calm && <div key={index} className="site-progress h-full rounded-full bg-brand" style={{ "--site-ms": `${SLIDE_MS}ms` } as React.CSSProperties} />}
      </div>
    </div>
  );
}
