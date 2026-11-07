"use client";

import { motion, useTransform, useReducedMotion, useMotionValue, useSpring, useScroll, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";

/*
 * Perspective Tunnel — cards fly out of the depth of the screen around a title, like a camera
 * moving down a corridor of pictures. Adapted for EGC Studio:
 * - driven by the page scroll (a tall section with a sticky stage) instead of capturing the wheel,
 *   so it works with a finger on phones and never traps the page;
 * - images, words and colours come in as props (the studio's own work, ink and brand yellow);
 * - uses `motion/react` (the current name of framer-motion, already in the project).
 */

export type TunnelImage = { src: string; title: string };

interface TunnelCardData {
  item: TunnelImage;
  angleCos: number;
  angleSin: number;
  radiusFactorX: number;
  radiusFactorY: number;
  rotationZ: number;
  index: number;
}

const layout = (images: TunnelImage[]): TunnelCardData[] =>
  images.map((item, i) => {
    const goldenAngle = i * 137.5 * (Math.PI / 180);
    return {
      item,
      angleCos: Math.cos(goldenAngle),
      angleSin: Math.sin(goldenAngle),
      radiusFactorX: 0.28 + (i % 3) * 0.08,
      radiusFactorY: 0.26 + (i % 2) * 0.09,
      rotationZ: (i % 2 === 0 ? 1 : -1) * (3 + (i % 5) * 2),
      index: i,
    };
  });

const SPRING_CONFIG = { stiffness: 60, damping: 25, mass: 0.5 };

interface StageDimensions {
  width: number;
  height: number;
  isMobile: boolean;
}

function useCameraParallax(enabled: boolean) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING_CONFIG);
  const y = useSpring(rawY, SPRING_CONFIG);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, rawX, rawY]);

  return { x, y };
}

interface TunnelCardProps {
  card: TunnelCardData;
  progress: MotionValue<number>;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
  total: number;
  stage: StageDimensions;
}

function TunnelCard({ card, progress, pointer, total, stage }: TunnelCardProps) {
  const staggerSpan = 0.55;
  const start = (card.index / total) * (1 - staggerSpan);
  const end = start + staggerSpan;

  const localProgress = useTransform(progress, [start, end], [0, 1]);

  const farZ = stage.isMobile ? -1200 : -1700;
  const nearZ = stage.isMobile ? 350 : 500;
  const z = useTransform(localProgress, [0, 1], [farZ, nearZ]);

  const opacity = useTransform(localProgress, [0, 0.18, 0.82, 0.98], [0, 1, 1, 0]);

  const cardWidth = stage.isMobile ? Math.max(130, Math.min(180, stage.width * 0.38)) : Math.max(180, Math.min(270, stage.width * 0.18));

  const baseX = card.angleCos * (stage.width * card.radiusFactorX);
  const baseY = card.angleSin * (stage.height * card.radiusFactorY);
  const panStrength = stage.isMobile ? 20 : 45;

  const transform = useTransform([z, pointer.x, pointer.y], ([currZ, px, py]: number[]) => {
    const offsetX = baseX - px * panStrength;
    const offsetY = baseY - py * panStrength;
    return `translate3d(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px), ${currZ}px) rotateZ(${card.rotationZ}deg)`;
  });

  return (
    <motion.div style={{ width: cardWidth, transform, opacity, zIndex: card.index + 1 }} className="absolute top-1/2 left-1/2 aspect-[4/5] will-change-transform select-none">
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-graphite shadow-2xl ring-1 shadow-black/70 ring-paper/15">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={card.item.src} alt="" loading="lazy" decoding="async" draggable={false} className="h-full w-full object-cover" />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-black/10 to-transparent p-4 sm:p-5">
          <span className="text-xs tracking-widest text-white/95 uppercase drop-shadow-md sm:text-sm">{card.item.title}</span>
        </div>
      </div>
    </motion.div>
  );
}

export type PerspectiveTunnelHeroProps = {
  images: TunnelImage[];
  eyebrow: string;
  /** Lines of the big title (each on its own line). */
  title: string[];
  text?: string;
  prompt?: string;
  /** Scroll length of the section, in screen heights. Default 3. */
  length?: number;
  className?: string;
};

export default function PerspectiveTunnelHero({ images, eyebrow, title, text, prompt, length = 3, className = "" }: PerspectiveTunnelHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [cards] = useState(() => layout(images));

  const [stage, setStage] = useState<StageDimensions>({ width: 1440, height: 900, isMobile: false });
  useEffect(() => {
    const update = () => setStage({ width: window.innerWidth, height: window.innerHeight, isMobile: window.innerWidth < 768 });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // The page scroll through this section drives the flight (0 at its top, 1 at its bottom).
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 30, restDelta: 0.0001 });

  const pointer = useCameraParallax(!reduce);

  const titleScale = useTransform(smoothProgress, [0, 0.5, 1], [0.7, 1, 1.35]);
  const titleOpacity = useTransform(smoothProgress, [0, 0.12, 0.85, 1], [0.25, 1, 1, 0]);
  const promptOpacity = useTransform(smoothProgress, [0, 0.12], [1, 0]);

  return (
    <section ref={sectionRef} className={`relative bg-ink text-paper ${className}`} style={{ height: `${length * 100}svh` }}>
      <div
        className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden select-none"
        style={{ perspective: stage.isMobile ? "900px" : "1200px", transformStyle: "preserve-3d" }}
      >
        {/* Background dots and glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgb(236_232_225/0.14)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)] [background-size:28px_28px] opacity-70" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgb(255_196_0/0.14)_0%,transparent_70%)]" />

        {/* Depth rings */}
        <div className="pointer-events-none absolute h-[48vmin] w-[48vmin] rounded-full border border-brand/20" />
        <div className="pointer-events-none absolute h-[76vmin] w-[76vmin] rounded-full border border-dashed border-paper/10" />

        {/* Title */}
        <motion.div style={{ scale: titleScale, opacity: titleOpacity }} className="pointer-events-none z-0 flex max-w-xl flex-col items-center px-6 text-center">
          <p className="mb-4 text-xs tracking-[0.4em] text-brand uppercase">{eyebrow}</p>
          <h2 className="bg-gradient-to-b from-paper via-paper to-paper/40 bg-clip-text font-display text-5xl leading-[0.9] font-semibold tracking-tighter text-transparent sm:text-7xl md:text-8xl">
            {title.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h2>
          {text && <p className="mt-4 max-w-[36ch] text-sm text-paper/70 sm:text-base">{text}</p>}
        </motion.div>

        {/* Scroll prompt */}
        {prompt && (
          <motion.div style={{ opacity: promptOpacity }} className="pointer-events-none absolute bottom-8 z-20 flex flex-col items-center gap-2 text-xs tracking-[0.3em] text-paper/60 uppercase">
            <span>{prompt}</span>
            <div className="h-6 w-px bg-gradient-to-b from-brand to-transparent" />
          </motion.div>
        )}

        {/* The corridor */}
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {cards.map((card) => (
            <TunnelCard key={card.index} card={card} progress={smoothProgress} pointer={pointer} total={cards.length} stage={stage} />
          ))}
        </div>
      </div>
    </section>
  );
}
