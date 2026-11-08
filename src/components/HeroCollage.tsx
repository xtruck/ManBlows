"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLang } from "./LangProvider";
import { onIntroDone } from "@/lib/intro";
import { useMotionMode } from "@/lib/motion";
// Pictures not used by any other animation (see crafts.ts)
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

gsap.registerPlugin(ScrollTrigger);

// A 16-point starburst, for the "new" badge
const BURST = Array.from({ length: 32 }, (_, i) => {
  const a = (i / 32) * Math.PI * 2;
  const r = i % 2 ? 41 : 50;
  return `${(50 + r * Math.cos(a)).toFixed(1)}% ${(50 + r * Math.sin(a)).toFixed(1)}%`;
}).join(",");

/**
 * Stickers floating around the hero prism, after the Square Kiosk collage: a shot ticket, a
 * speech bubble, a starburst badge, a heart, a print of a photo and a poster. They pop in after
 * the intro, drift gently, lean away from the mouse at their own depth, and slide at their own
 * speed when the page scrolls. Decorative only (aria-hidden); phones show the four smaller ones.
 */
export function HeroCollage() {
  const { t } = useLang();
  const s = t.hero.sticker;
  const root = useRef<HTMLDivElement>(null);
  const gentle = useMotionMode() === "gentle";

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const items = gsap.utils.toArray<HTMLElement>("[data-sticker]", el);
    if (gentle) {
      gsap.set(items, { autoAlpha: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.set(items, { autoAlpha: 0, scale: 0.2 });
    }, el);

    // Pop in once the intro is over, one after the other
    const off = onIntroDone(() => {
      ctx.add(() => {
        gsap.to(items, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.7,
          ease: "back.out(2.2)",
          stagger: 0.09,
          delay: 0.35,
          clearProps: "transform",
        });
        // Each slides at its own speed as the page scrolls
        items.forEach((it) => {
          const depth = Number(it.dataset.depth || 1);
          gsap.to(it.firstElementChild, {
            yPercent: -40 * depth,
            ease: "none",
            scrollTrigger: { trigger: el.closest("section"), start: "top top", end: "bottom top", scrub: 0.5 },
          });
        });
      });
    });

    // Lean away from the mouse, the nearer ones more
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const section = el.closest("section");
    const movers = items.map((it) => {
      const inner = it.firstElementChild as HTMLElement;
      return { depth: Number(it.dataset.depth || 1), x: gsap.quickTo(inner, "x", { duration: 1, ease: "power3.out" }), y: gsap.quickTo(inner, "y", { duration: 1, ease: "power3.out" }) };
    });
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      movers.forEach((m) => {
        m.x(-nx * 26 * m.depth);
        m.y(-ny * 18 * m.depth);
      });
    };
    if (fine) section?.addEventListener("pointermove", onMove);

    return () => {
      off();
      section?.removeEventListener("pointermove", onMove);
      ctx.revert();
    };
  }, [gentle]);

  return (
    <div ref={root} aria-hidden className="hero-collage pointer-events-none absolute inset-0 z-10">
      {/* Shot ticket, like a kitchen receipt */}
      <div data-sticker data-depth="1.4" className="sticker absolute -top-[3%] -left-[24%] lg:top-[4%] lg:-left-[44%]" style={{ "--r": "-8deg", "--d": "7s" } as React.CSSProperties}>
        <div>
          <div className="w-[6.4rem] rounded-md bg-[#ffb3d6] p-2.5 font-mono text-[9px] leading-snug text-ink shadow-xl shadow-black/30 lg:w-[9.5rem] lg:p-4 lg:text-xs">
            <p className="text-lg font-bold lg:text-2xl">#24</p>
            {s.ticket.map((line) => (
              <p key={line} className="uppercase">
                {line}
              </p>
            ))}
            <p className="mt-2 border-t border-dashed border-ink/40 pt-1.5 text-[9px] lg:text-[10px]">EGC STUDIO · ABIDJAN</p>
          </div>
        </div>
      </div>

      {/* Speech bubble */}
      <div data-sticker data-depth="0.8" className="sticker absolute top-[52%] -left-[12%] lg:top-[44%] lg:-left-[36%]" style={{ "--r": "-4deg", "--d": "8.5s" } as React.CSSProperties}>
        <div>
          <div className="flex size-[5.5rem] items-center justify-center rounded-full bg-ink p-3 text-center text-[11px] leading-tight font-medium text-paper shadow-xl shadow-black/40 ring-1 ring-paper/15 lg:size-[7.5rem] lg:text-sm">
            {s.ask}
          </div>
          <span className="absolute -bottom-1 left-4 size-4 rotate-45 bg-ink lg:left-6" />
        </div>
      </div>

      {/* Starburst badge */}
      <div data-sticker data-depth="1.2" className="sticker absolute -top-[6%] -right-[10%] lg:top-[0%] lg:-right-[24%]" style={{ "--r": "12deg", "--d": "6.5s" } as React.CSSProperties}>
        <div>
          <div
            className="flex size-[5.5rem] items-center justify-center bg-[#b8f53b] p-4 text-center font-display text-[11px] leading-tight font-semibold text-ink drop-shadow-xl lg:size-[7.5rem] lg:text-sm"
            style={{ clipPath: `polygon(${BURST})` }}
          >
            {s.badge}
          </div>
        </div>
      </div>

      {/* Heart */}
      <div data-sticker data-depth="1" className="sticker absolute top-[48%] -right-[12%] lg:top-[38%] lg:-right-[27%]" style={{ "--r": "14deg", "--d": "9s" } as React.CSSProperties}>
        <div>
          <div className="relative w-[5.5rem] drop-shadow-xl lg:w-[8rem]">
            <svg viewBox="0 0 100 90" className="block w-full">
              <path d="M50 88C20 66 2 50 2 28 2 13 14 2 28 2c9 0 17 5 22 13C55 7 63 2 72 2c14 0 26 11 26 26 0 22-18 38-48 60z" fill="#fff" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center px-4 pb-3 text-center font-mono text-[9px] leading-tight font-bold text-ink uppercase lg:text-[11px]">
              {s.heart}
            </span>
          </div>
        </div>
      </div>

      {/* A print of a photo (wider screens) */}
      <div data-sticker data-depth="1.6" className="sticker absolute -right-[26%] -bottom-[6%] hidden lg:block" style={{ "--r": "6deg", "--d": "7.5s" } as React.CSSProperties}>
        <div>
          <div className="w-[7rem] rounded-md bg-white p-1.5 pb-5 shadow-xl shadow-black/40">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
              <Image src={`${base}/work/photo-17.webp`} alt="" fill sizes="7rem" className="object-cover" />
            </div>
          </div>
          <span className="absolute -top-3 -left-8 rounded-full bg-[#2f6bff] px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-white shadow-lg">{s.photo}</span>
        </div>
      </div>

      {/* A poster (wider screens) */}
      <div data-sticker data-depth="0.9" className="sticker absolute -bottom-[2%] -left-[30%] hidden lg:block" style={{ "--r": "-6deg", "--d": "8s" } as React.CSSProperties}>
        <div>
          <div className="relative aspect-[4/5] w-[6.5rem] overflow-hidden rounded-md shadow-xl shadow-black/40">
            <Image src={`${base}/work/design-33.webp`} alt="" fill sizes="6.5rem" className="object-cover" />
          </div>
          <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-paper shadow-lg ring-1 ring-paper/15">
            {s.poster}
          </span>
        </div>
      </div>
    </div>
  );
}
