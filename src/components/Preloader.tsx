"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Logo } from "./Logo";
import { LightLeaks } from "./LightLeaks";
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
 * yellow, "egc" is written in, and the shutter opens onto the site.
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

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const finish = () => {
      document.documentElement.style.overflow = "";
      setGone(true);
      markIntroDone();
    };

    document.documentElement.style.overflow = "hidden";

    // The intro plays on every full page load (refresh included); page-to-page navigation
    // keeps the layout mounted, so it never replays there. Reduced motion gets a short fade.
    if (reduced) {
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
        .fromTo("[data-body-fill]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: "power1.out" }, 0.55)
        .fromTo("[data-lens-glass]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: "power1.out" }, 0.8)
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
          .to("[data-lens-glass]", { autoAlpha: 0, duration: 0.4, ease: "power1.in" }, 0.15)
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
      // Ease toward the goal, scaled by frame time so slow devices aren't slower; once ready,
      // a minimum step makes it land exactly on 100.
      const ratio = gsap.ticker.deltaRatio(60);
      const k = 1 - Math.pow(1 - (ready ? 0.12 : 0.06), ratio);
      const step = (goal - shown) * k;
      shown = Math.min(goal, shown + (ready ? Math.max(step, 0.015 * ratio) : Math.max(step, 0)));
      setProgress(shown);
      setAperture(0.06 + shown * 0.44);
      if (!outroStarted && ready && shown >= 1 && elapsed > 1.2) {
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
      className="fixed inset-0 isolate z-[100] flex items-center justify-center overflow-hidden bg-ink text-paper"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
    >
      <LightLeaks className="opacity-50" />

      {/*
        A mirrorless camera, front view: outlines draw in first, then the materials
        (leatherette, brushed metal, lens rings) fade in. Its lens is the iris below.
      */}
      <div
        ref={camera}
        className="relative aspect-[400/260] w-[min(94vw,660px,108svh)] origin-[50%_57.7%] will-change-transform"
      >
        <svg data-body viewBox="0 0 400 260" fill="none" className="absolute inset-0 size-full overflow-visible">
          <defs>
            <pattern id="pre-leather" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="4" height="4" fill="#1a1918" />
              <circle cx="1" cy="1" r="0.75" fill="#232120" />
              <circle cx="3" cy="2.6" r="0.6" fill="#121110" />
              <circle cx="1.9" cy="3.4" r="0.45" fill="#262422" />
            </pattern>
            <linearGradient id="pre-metal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#66625d" />
              <stop offset="30%" stopColor="#3c3936" />
              <stop offset="65%" stopColor="#262422" />
              <stop offset="100%" stopColor="#3a3734" />
            </linearGradient>
            <linearGradient id="pre-silver" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e4dfd6" />
              <stop offset="35%" stopColor="#7d7872" />
              <stop offset="60%" stopColor="#c9c3ba" />
              <stop offset="100%" stopColor="#4a4642" />
            </linearGradient>
            <linearGradient id="pre-sheen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.1" />
              <stop offset="40%" stopColor="#fff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="pre-grip" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#000" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0.07" />
            </linearGradient>
            <radialGradient id="pre-af" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffd27a" />
              <stop offset="45%" stopColor="#ff9a2e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ff9a2e" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g data-body-fill opacity={0}>
            {/* Strap lugs and hot shoe */}
            <rect x="9" y="74" width="10" height="14" rx="2.5" fill="url(#pre-metal)" />
            <rect x="381" y="74" width="10" height="14" rx="2.5" fill="url(#pre-metal)" />
            <rect x="168" y="13" width="64" height="11" rx="2" fill="#2b2927" stroke="#57534e" strokeWidth="0.6" />
            <path d="M172 17H228M172 20H228" stroke="#141312" strokeWidth="1" />
            {/* Viewfinder hump in brushed metal, engraved with the brand */}
            <path d="M136 62L153 31Q157 22 168 22H232Q243 22 247 31L264 62Z" fill="url(#pre-metal)" />
            <path d="M156 30H244" stroke="#fff" strokeOpacity="0.22" strokeWidth="0.8" />
            <text x="200" y="52" textAnchor="middle" fontSize="9" letterSpacing="3.5" fill="#fff" fillOpacity="0.42" fontWeight="600">
              EGC
            </text>
            {/* Body: leatherette, with a brushed-metal top plate */}
            <rect x="18" y="58" width="364" height="184" rx="24" fill="url(#pre-leather)" />
            <path d="M42 58H358Q382 58 382 82V94H18V82Q18 58 42 58Z" fill="url(#pre-metal)" />
            <path d="M18 94H382" stroke="#000" strokeOpacity="0.6" strokeWidth="1.2" />
            <path d="M18 95.4H382" stroke="#fff" strokeOpacity="0.07" strokeWidth="0.8" />
            <rect x="18" y="58" width="364" height="184" rx="24" fill="url(#pre-sheen)" />
            {/* Grip */}
            <path d="M18 104Q18 95 30 95H82Q102 98 102 124V214Q102 240 80 242H42Q18 242 18 218Z" fill="url(#pre-leather)" />
            <path d="M18 104Q18 95 30 95H82Q102 98 102 124V214Q102 240 80 242H42Q18 242 18 218Z" fill="url(#pre-grip)" />
            <path d="M96 120V214" stroke="#fff" strokeOpacity="0.08" strokeWidth="1.5" strokeLinecap="round" />
            {/* Mode dial with knurling */}
            <rect x="46" y="38" width="62" height="20" rx="3" fill="url(#pre-metal)" />
            <path d="M48 42H106M48 46H106M48 50H106M48 54H106" stroke="#fff" strokeOpacity="0.16" strokeDasharray="1 1.6" />
            {/* Shutter button: silver collar, brand-yellow release */}
            <rect x="298" y="46" width="44" height="13" rx="6.5" fill="url(#pre-silver)" />
            <rect data-pre-shutter x="305" y="40" width="30" height="9" rx="4.5" fill="#ffc400" stroke="#b88a00" strokeWidth="0.6" />
            {/* AF assist lamp, mic holes, lens release */}
            <circle cx="332" cy="112" r="8" fill="url(#pre-af)" className="rec-dot" />
            <circle cx="332" cy="112" r="2.6" fill="#ffd27a" />
            <path d="M318 78h0.01M324 78h0.01M330 78h0.01" stroke="#050505" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="306" cy="200" r="8" fill="url(#pre-silver)" />
            <circle cx="306" cy="200" r="5" fill="#1c1b1a" />
            {/* Lens mount and barrel */}
            <circle cx="200" cy="150" r="93" fill="url(#pre-silver)" />
            <circle cx="200" cy="150" r="88.5" fill="#0d0c0c" />
            <circle cx="200" cy="150" r="84" fill="none" stroke="#24221f" strokeWidth="8" strokeDasharray="0.9 1.2" />
            <circle cx="200" cy="150" r="79" fill="none" stroke="#3e3b37" strokeWidth="1.2" />
            <circle cx="200" cy="150" r="77" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.4" strokeDasharray="0.5 7" />
            <rect x="199.2" y="61" width="1.6" height="6" rx="0.8" fill="#ffc400" />
          </g>

          <g stroke="rgb(236 232 225 / 0.7)" strokeWidth="1.2" strokeLinecap="round" strokeDashoffset={1}>
            <rect data-draw pathLength={1} strokeDasharray="1" x="18" y="58" width="364" height="184" rx="24" />
            <path data-draw pathLength={1} strokeDasharray="1" d="M136 62L153 31Q157 22 168 22H232Q243 22 247 31L264 62" />
            <path data-draw pathLength={1} strokeDasharray="1" d="M82 95Q102 98 102 124V214Q102 240 80 242" />
            <rect data-draw pathLength={1} strokeDasharray="1" x="46" y="38" width="62" height="20" rx="3" />
            <rect data-draw pathLength={1} strokeDasharray="1" x="298" y="46" width="44" height="13" rx="6.5" />
            <circle data-draw pathLength={1} strokeDasharray="1" cx="200" cy="150" r="93" />
            <circle data-draw pathLength={1} strokeDasharray="1" cx="200" cy="150" r="79" stroke="rgb(255 196 0 / 0.55)" />
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

        {/* Front element: coated glass reflections sitting over the iris */}
        <svg data-lens-glass viewBox="0 0 400 260" className="pointer-events-none absolute inset-0 size-full opacity-0">
          <defs>
            <radialGradient id="pre-glass" cx="36%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
              <stop offset="30%" stopColor="#fff" stopOpacity="0.05" />
              <stop offset="70%" stopColor="#6f4bff" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#1fa37a" stopOpacity="0.18" />
            </radialGradient>
          </defs>
          <circle cx="200" cy="150" r="73" fill="url(#pre-glass)" />
          <circle cx="200" cy="150" r="70" fill="none" stroke="#fff" strokeOpacity="0.08" />
          <path d="M146 118A64 64 0 0 1 182 90" stroke="#fff" strokeOpacity="0.45" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M238 206A64 64 0 0 0 258 186" stroke="#c9a6ff" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="170" cy="116" r="4" fill="#fff" fillOpacity="0.6" />
          <circle cx="170" cy="116" r="10" fill="#fff" fillOpacity="0.1" />
        </svg>
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
