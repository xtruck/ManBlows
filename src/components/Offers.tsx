"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { useLang } from "./LangProvider";
import { getLenis } from "./SmoothScroll";
import { TransitionLink } from "./TransitionProvider";
import { offers } from "@/content/site";

/**
 * EGC Studio's own posters: service packages, what each one includes and the price list.
 * They are the studio's offer, not client work, so they live here instead of in the gallery.
 * A swipeable carousel (scroll-snap), with a full-size view so the small print is readable.
 */
export function Offers() {
  const { t } = useLang();
  const track = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  useFocusTrap(dialog, open !== null);

  // Which poster is centred, for the dots under the carousel.
  const onScroll = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setActive(Math.min(offers.length - 1, Math.round(el.scrollLeft / (el.scrollWidth / offers.length))));
  }, []);

  const scrollToSlide = (i: number) => {
    const el = track.current;
    if (!el) return;
    const slide = el.children[Math.max(0, Math.min(offers.length - 1, i))] as HTMLElement;
    el.scrollTo({ left: slide.offsetLeft - el.offsetLeft - (el.clientWidth - slide.clientWidth) / 2, behavior: "smooth" });
  };

  const close = useCallback(() => {
    setOpen(null);
    lastTrigger.current?.focus();
  }, []);
  const step = useCallback((dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + offers.length) % offers.length)), []);

  useEffect(() => {
    if (open === null) return;
    getLenis()?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      getLenis()?.start();
    };
  }, [open, close, step]);

  const current = open === null ? null : offers[open];

  return (
    <section id="offres" className="overflow-hidden bg-paper py-24 md:py-36">
      <div className="grid gap-6 px-4 md:grid-cols-12 md:items-end md:px-8">
        <h2
          data-reveal
          className="font-display text-[clamp(3rem,8vw,7.5rem)] leading-[0.9] font-semibold tracking-[-0.04em] md:col-span-7"
        >
          {t.offers.title}
        </h2>
        <div className="md:col-span-5">
          <p data-reveal className="max-w-[44ch] text-lg leading-relaxed text-muted">
            {t.offers.intro}
          </p>
          <p data-reveal className="mt-3 text-sm text-muted">
            {t.offers.hint}
          </p>
        </div>
      </div>

      <div
        ref={track}
        onScroll={onScroll}
        role="region"
        aria-roledescription="carousel"
        aria-label={t.offers.title}
        className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:none] md:mt-16 md:gap-6 md:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {offers.map((shot, i) => (
          <figure key={shot.id} className="w-[76%] shrink-0 snap-center sm:w-[44%] lg:w-[27%]">
            <button
              type="button"
              onClick={(e) => {
                lastTrigger.current = e.currentTarget;
                setOpen(i);
              }}
              aria-label={`${shot.place}, ${t.offers.hint}`}
              className="group block w-full cursor-zoom-in overflow-hidden rounded-2xl bg-paper-2 shadow-lg shadow-ink/10 transition-transform duration-300 active:scale-[0.98]"
            >
              <Image
                src={shot.src}
                alt={`${shot.place}, ${t.a11y.realDesign}`}
                width={shot.w}
                height={shot.h}
                sizes="(min-width: 1024px) 27vw, (min-width: 640px) 44vw, 76vw"
                className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            </button>
            <figcaption className="mt-3 text-sm font-medium">{shot.place}</figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-6 px-4 md:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => scrollToSlide(active - 1)}
            aria-label={t.work.prev}
            disabled={active === 0}
            className="liquid-glass flex size-11 cursor-pointer items-center justify-center rounded-full text-ink transition-opacity active:scale-95 disabled:cursor-default disabled:opacity-35"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <div className="flex items-center gap-2" aria-hidden>
            {offers.map((s, i) => (
              <span key={s.id} className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-ink" : "w-1.5 bg-ink/25"}`} />
            ))}
          </div>
          <button
            type="button"
            onClick={() => scrollToSlide(active + 1)}
            aria-label={t.work.next}
            disabled={active === offers.length - 1}
            className="liquid-glass flex size-11 cursor-pointer items-center justify-center rounded-full text-ink transition-opacity active:scale-95 disabled:cursor-default disabled:opacity-35"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <TransitionLink
          href="/contact/"
          className="btn-brand inline-flex h-12 items-center rounded-full px-7 text-sm font-medium"
        >
          {t.offers.cta}
        </TransitionLink>
      </div>

      <AnimatePresence>
        {current && open !== null && (
          <motion.div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-label={current.place}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-ink/90 p-4 text-paper backdrop-blur-xl md:p-10"
            onClick={close}
          >
            <div className="flex max-h-full flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <Image
                src={current.src}
                alt={`${current.place}, ${t.a11y.realDesign}`}
                width={current.w}
                height={current.h}
                sizes="90vw"
                className="h-auto max-h-[72svh] w-auto max-w-full rounded-lg shadow-2xl md:max-h-[80svh]"
              />
              <p className="mt-3 text-center text-sm font-medium text-paper/85">{current.place}</p>
            </div>
            <button
              type="button"
              autoFocus
              onClick={close}
              className="liquid-glass-dark absolute top-4 right-4 h-11 cursor-pointer rounded-full px-5 text-sm active:scale-95 md:top-8 md:right-8"
            >
              {t.work.close}
            </button>
            <div
              className="liquid-glass-dark absolute inset-x-4 bottom-4 flex items-center justify-between rounded-full p-1.5 md:inset-x-auto md:bottom-8 md:left-1/2 md:w-[28rem] md:-translate-x-1/2"
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" onClick={() => step(-1)} className="h-10 cursor-pointer rounded-full px-5 text-sm hover:bg-paper/10 active:scale-95">
                {t.work.prev}
              </button>
              <span className="text-sm text-paper/75 tabular-nums">
                {open + 1} / {offers.length}
              </span>
              <button type="button" onClick={() => step(1)} className="h-10 cursor-pointer rounded-full px-5 text-sm hover:bg-paper/10 active:scale-95">
                {t.work.next}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
