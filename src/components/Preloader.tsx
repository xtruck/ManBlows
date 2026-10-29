"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Logo } from "./Logo";
import { useLang } from "./LangProvider";
import { markIntroDone, onSceneProgress, onSceneReady } from "@/lib/intro";

// Aperture geometry, in a 200 × 200 viewBox.
const C = 100;
const R = 97;
const BLADES = 7;
const STOPS = ["22", "16", "11", "8", "5.6", "4", "2.8", "2", "1.4"];
const MAX_WAIT_MS = 4500; // never hold the visitor longer than this for the 3D model

/** Iris diaphragm: blades fill the lens and leave a rotating polygon open in the middle. */
function iris(open: number) {
  const r = Math.max(0.03, open) * R;
  const turn = (1 - Math.min(open, 1)) * 1.7;
  const pts = Array.from({ length: BLADES }, (_, i) => {
    const a = turn + (i * Math.PI * 2) / BLADES;
    return [C + r * Math.cos(a), C + r * Math.sin(a)];
  });
  const fmt = (p: number[]) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
  const hole = `M${pts.map(fmt).join("L")}Z`;
  const disc = `M${C - R} ${C}a${R} ${R} 0 1 0 ${R * 2} 0a${R} ${R} 0 1 0 ${-R * 2} 0Z`;
  // Each blade edge continues past the next corner, giving the pinwheel look.
  const edges = pts
    .map((p, i) => {
      const q = pts[(i + 1) % BLADES];
      const len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
      return `M${fmt(q)}L${fmt([q[0] + ((q[0] - p[0]) / len) * 240, q[1] + ((q[1] - p[1]) / len) * 240])}`;
    })
    .join("");
  return { blades: disc + hole, edges };
}

// Server-rendered starting state, so the lens is already shut before any script runs.
const CLOSED = iris(0.06);

/**
 * First visit: a lens aperture whose opening follows real loading progress, with a live
 * f-stop readout. When everything is ready it opens wide, we fly through it into the brand
 * yellow, "egu" is written in, and the shutter opens onto the site.
 */
export function Preloader() {
  const { t } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const camera = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const blades = useRef<SVGPathElement>(null);
  const edges = useRef<SVGPathElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const fstop = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
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
      const tween = gsap.to(el, { autoAlpha: 0, duration: 0.35, delay: 0.05, onComplete: finish });
      return () => {
        tween.kill();
      };
    }

    const setAperture = (open: number) => {
      const d = iris(open);
      blades.current?.setAttribute("d", d.blades);
      edges.current?.setAttribute("d", d.edges);
      const stop = STOPS[Math.round(Math.min(Math.max((open - 0.06) / 0.94, 0), 1) * (STOPS.length - 1))];
      if (fstop.current) fstop.current.textContent = `f/${stop}`;
    };
    const setProgress = (p: number) => {
      if (counter.current) counter.current.textContent = String(Math.round(p * 100)).padStart(3, "0");
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };

    // Only the home page loads the 3D camera; other pages just wait for fonts.
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const path = window.location.pathname.slice(base.length) || "/";
    let sceneDone = path !== "/";
    let fontsDone = false;
    let real = 0;
    const offProgress = onSceneProgress((v) => (real = v));
    const offReady = onSceneReady(() => (sceneDone = true));
    const cap = window.setTimeout(() => (sceneDone = true), MAX_WAIT_MS);
    (document.fonts?.ready ?? Promise.resolve()).then(() => (fontsDone = true));

    // The camera body draws itself in, line by line, while the lens starts to open.
    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .fromTo("[data-draw]", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", stagger: 0.06 })
        .fromTo("[data-body-fill]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "power1.out" }, 0.6)
        .fromTo(stage.current, { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.9, ease: "expo.out" }, 0.3);
    }, el);
    const start = performance.now();
    let shown = 0;
    let outroStarted = false;

    const outro = () => {
      ctx.add(() => {
        const o = { open: 0.5 };
        // Zoom the whole camera into its lens until the yellow fills the screen.
        const cover = () => (Math.hypot(window.innerWidth, window.innerHeight) / (stage.current?.offsetWidth || 1)) * 1.1;
        gsap
          .timeline({ onComplete: finish })
          .to("[data-pre-hud]", { autoAlpha: 0, y: 10, duration: 0.35, ease: "power2.in" }, 0)
          // Shutter press and flash
          .to("[data-pre-shutter]", { y: 3, duration: 0.1, ease: "power2.in", yoyo: true, repeat: 1 }, 0)
          .fromTo("[data-pre-flash]", { autoAlpha: 0.9 }, { autoAlpha: 0, duration: 0.45, ease: "power2.out" }, 0.12)
          .to(o, { open: 1.2, duration: 0.75, ease: "power3.inOut", onUpdate: () => setAperture(o.open) }, 0.15)
          .to("[data-logo-script]", { clipPath: "inset(-20% 0% -20% 0)", duration: 0.9, ease: "power2.inOut" }, 0.35)
          .to(camera.current, { scale: cover, duration: 1.1, ease: "expo.inOut" }, 0.95)
          .to("[data-body]", { autoAlpha: 0, duration: 0.5, ease: "power1.in" }, 1.2)
          .to("[data-pre-logo]", { autoAlpha: 0, duration: 0.3 }, 1.65)
          .to(el, { clipPath: "inset(50% 0% 50% 0%)", duration: 0.8, ease: "expo.inOut" }, 1.95);
      });
    };

    // Ease the displayed progress toward real progress; hold below 100 until ready.
    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      const ready = sceneDone && fontsDone;
      const fake = 1 - Math.exp(-elapsed * 0.9);
      const goal = ready ? 1 : Math.min(0.9, Math.max(fake * 0.85, real * 0.9));
      shown = Math.max(shown, shown + (goal - shown) * (ready ? 0.12 : 0.06));
      setProgress(shown);
      setAperture(0.06 + shown * 0.44);
      if (!outroStarted && ready && shown > 0.995 && elapsed > 1.2) {
        outroStarted = true;
        setProgress(1);
        gsap.ticker.remove(tick);
        outro();
      }
    };
    setAperture(0.06);
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      offProgress();
      offReady();
      window.clearTimeout(cap);
      ctx.revert();
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={root}
      aria-hidden
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-ink text-paper"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
    >
      {/* A modern camera, front view, drawn in line by line. Its lens is the iris below. */}
      <div
        ref={camera}
        className="relative aspect-[400/260] w-[min(94vw,640px,105svh)] origin-[50%_57.7%] will-change-transform"
      >
        <svg data-body viewBox="0 0 400 260" fill="none" className="absolute inset-0 size-full overflow-visible">
          <defs>
            <linearGradient id="pre-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a2826" />
              <stop offset="100%" stopColor="#141312" />
            </linearGradient>
          </defs>
          <g data-body-fill opacity={0}>
            <path d="M140 60L158 28Q162 22 170 22H230Q238 22 242 28L260 60Z" fill="url(#pre-body)" />
            <rect x="20" y="60" width="360" height="180" rx="26" fill="url(#pre-body)" />
          </g>
          <g stroke="rgb(236 232 225 / 0.75)" strokeWidth="1.4" strokeLinecap="round" strokeDashoffset={1}>
            <rect data-draw pathLength={1} strokeDasharray="1" x="20" y="60" width="360" height="180" rx="26" />
            <path data-draw pathLength={1} strokeDasharray="1" d="M140 60L158 28Q162 22 170 22H230Q238 22 242 28L260 60" />
            <path data-draw pathLength={1} strokeDasharray="1" d="M84 64Q50 72 50 114V194Q50 230 84 236" />
            <rect data-draw pathLength={1} strokeDasharray="1" x="64" y="46" width="48" height="14" rx="4" />
            <circle data-draw pathLength={1} strokeDasharray="1" cx="200" cy="150" r="88" />
            <circle data-draw pathLength={1} strokeDasharray="1" cx="200" cy="150" r="80" stroke="rgb(255 196 0 / 0.6)" />
            <path data-draw pathLength={1} strokeDasharray="1" d="M30 90H120M280 90H370" stroke="rgb(236 232 225 / 0.25)" />
          </g>
          <g data-body-fill opacity={0}>
            <rect data-pre-shutter x="290" y="44" width="36" height="16" rx="5" fill="#ffc400" />
            <circle cx="336" cy="88" r="4" fill="#ff3b30" className="rec-dot" />
          </g>
        </svg>

        {/* The lens: brand yellow behind an iris diaphragm */}
        <div ref={stage} className="@container absolute top-[29.2%] left-[31.5%] aspect-square w-[37%] opacity-0">
          <div className="absolute inset-[1.5%] flex items-center justify-center overflow-hidden rounded-full bg-brand">
            <div data-pre-logo className="pt-[0.55em] text-[15cqw]">
              <Logo scriptClassName="[clip-path:inset(-20%_100%_-20%_0)]" />
            </div>
          </div>
        <svg viewBox="0 0 200 200" className="absolute inset-0 size-full">
          <defs>
            <clipPath id="pre-lens">
              <circle cx={C} cy={C} r={R} />
            </clipPath>
            <radialGradient id="pre-blade" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2b2926" />
              <stop offset="100%" stopColor="#121110" />
            </radialGradient>
          </defs>
          <g clipPath="url(#pre-lens)">
            <path ref={blades} d={CLOSED.blades} fill="url(#pre-blade)" fillRule="evenodd" />
            <path ref={edges} d={CLOSED.edges} fill="none" stroke="rgb(255 255 255 / 0.09)" strokeWidth="0.7" />
          </g>
          <circle cx={C} cy={C} r={R} fill="none" stroke="#3a3733" strokeWidth="3" />
          <circle cx={C} cy={C} r={R + 2.2} fill="none" stroke="rgb(255 196 0 / 0.45)" strokeWidth="0.5" />
        </svg>
        </div>
      </div>

      {/* Flash when the shutter fires */}
      <div data-pre-flash className="pointer-events-none invisible absolute inset-0 bg-white" />

      {/* Viewfinder HUD */}
      <div data-pre-hud className="pointer-events-none absolute inset-x-5 top-6 flex justify-between text-xs text-paper/70 md:inset-x-10 md:top-8 md:text-sm">
        <span>{t.focus}</span>
        <span ref={fstop} className="tabular-nums text-brand">
          f/22
        </span>
      </div>
      <div data-pre-hud className="pointer-events-none absolute inset-x-5 bottom-7 md:inset-x-10 md:bottom-9">
        <div className="flex items-end justify-between">
          <span className="text-xs text-paper/70 md:text-sm">{t.preloader}</span>
          <span ref={counter} className="font-display text-5xl leading-none tabular-nums tracking-tight md:text-7xl">
            000
          </span>
        </div>
        <span className="mt-4 block h-px w-full bg-paper/15">
          <span ref={bar} className="block h-full origin-left bg-brand" style={{ transform: "scaleX(0)" }} />
        </span>
      </div>
    </div>
  );
}
