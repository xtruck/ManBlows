"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { useLang } from "./LangProvider";
import { getLenis } from "./SmoothScroll";
import { TransitionLink } from "./TransitionProvider";
import { useMedia } from "@/lib/useMedia";
import { shots, type Category, type Kind, type Shot } from "@/content/site";

type Filter = "all" | Category;
// Only offer filters that have something in them: when photos or films are added later,
// their filter appears on its own.
const categoryOrder: Category[] = ["design", "products", "events", "ceremonies", "portraits", "films"];
const present = new Set(shots.map((s) => s.category));
const filters: Filter[] = ["all", ...categoryOrder.filter((c) => present.has(c))];

// Client types offered when browsing the design work ("studio" is the founder's own promotion).
type KindFilter = "all" | Exclude<Kind, "studio">;
const kindOrder = ["church", "business", "school", "event", "personal"] as const;
const kindsPresent = new Set(shots.filter((s) => s.category === "design").map((s) => s.kind));
const kindFilters: KindFilter[] = ["all", ...kindOrder.filter((k) => kindsPresent.has(k))];

const frameNo = (id: number) => String(id).padStart(2, "0");

type WorkProps = {
  /** "page": the full /travaux page with filters. "teaser": a home-page selection. */
  mode?: "page" | "teaser";
};

/** Contact-sheet grid: frame numbers under each image, filter chips, keyboard and swipe lightbox. */
export function Work({ mode = "page" }: WorkProps) {
  const { t } = useLang();
  const teaser = mode === "teaser";
  const [filter, setFilter] = useState<Filter>("all");
  const [kind, setKind] = useState<KindFilter>("all");
  const [index, setIndex] = useState<number | null>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  useFocusTrap(dialog, index !== null);

  // Filtering moves the remaining images up; re-measure scroll reveals once the
  // exit animation is done, or images still waiting to reveal stay hidden.
  const firstFilter = useRef(true);
  useEffect(() => {
    if (firstFilter.current) {
      firstFilter.current = false;
      return;
    }
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 450);
    return () => window.clearTimeout(id);
  }, [filter, kind]);

  const visible = useMemo(() => {
    if (teaser) return shots.filter((s) => s.featured);
    const byCategory = filter === "all" ? shots : shots.filter((s) => s.category === filter);
    return filter === "design" && kind !== "all" ? byCategory.filter((s) => s.kind === kind) : byCategory;
  }, [filter, kind, teaser]);
  // Masonry without CSS multi-column (which fights with lazy loading and exit animations):
  // each image goes into the currently shortest column, so the first images sit side by side.
  const wide = useMedia("(min-width: 1024px)");
  const colCount = wide ? 3 : 2;
  const columns = useMemo(() => {
    const cols: { shot: Shot; i: number }[][] = Array.from({ length: colCount }, () => []);
    const heights = new Array<number>(colCount).fill(0);
    visible.forEach((shot, i) => {
      const c = heights.indexOf(Math.min(...heights));
      cols[c].push({ shot, i });
      heights[c] += shot.h / shot.w + 0.14; // image ratio plus the caption
    });
    return cols;
  }, [visible, colCount]);
  // Accessible name of an image: who it was made for and what it is (frame number for photos).
  const label = (s: Shot) =>
    s.real ? `${s.client ? `${s.client}, ` : ""}${s.place}` : `${t.work.frame} ${frameNo(s.id)}, ${s.place}`;
  const altOf = (s: Shot) =>
    s.category === "design" ? `${s.place}, ${t.a11y.realDesign}` : s.client ? `${s.place}, ${s.client}` : s.place;
  const current = index === null ? null : visible[index];

  const close = useCallback(() => {
    setIndex(null);
    lastTrigger.current?.focus();
  }, []);
  const step = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i === null ? i : (i + dir + visible.length) % visible.length)),
    [visible.length],
  );

  useEffect(() => {
    if (index === null) return;
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
  }, [index, close, step]);

  const Heading = teaser ? "h2" : "h1";

  return (
    <section
      className={`bg-paper px-4 md:px-8 ${teaser ? "py-24 md:py-36" : "pt-32 pb-24 md:pt-44 md:pb-36"}`}
    >
      <div className="grid gap-8 md:grid-cols-12 md:items-end">
        <Heading
          data-reveal
          className="font-display text-[clamp(3.4rem,10vw,9rem)] leading-[0.86] font-semibold tracking-[-0.045em] md:col-span-7"
        >
          {teaser ? t.home.selection : t.work.title}
        </Heading>
        {/* min-w-0 lets the scrollable filter row shrink instead of widening the page */}
        <div className="min-w-0 md:col-span-5">
          <p data-reveal className="max-w-[44ch] text-lg leading-relaxed text-muted">
            {teaser ? t.home.selectionIntro : t.work.intro}
          </p>
          {!teaser && (
            <div
              data-reveal
              role="group"
              aria-label={t.work.title}
              className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0"
            >
              {filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => {
                    setFilter(f);
                    setKind("all");
                  }}
                  className={`h-10 shrink-0 cursor-pointer rounded-full px-4 text-sm transition-all duration-300 active:scale-95 ${
                    filter === f ? "bg-ink text-paper shadow-lg shadow-ink/20" : "liquid-glass text-ink"
                  }`}
                >
                  {t.work.filters[f]}
                </button>
              ))}
            </div>
          )}
          {!teaser && filter === "design" && (
            // Second row: who the designs were made for (churches, businesses, schools, events).
            <div
              role="group"
              aria-label={t.work.clientType}
              className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0"
            >
              {kindFilters.map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={kind === k}
                  onClick={() => setKind(k)}
                  className={`h-8 shrink-0 cursor-pointer rounded-full px-3 text-xs transition-all duration-300 active:scale-95 ${
                    kind === k ? "bg-brand text-ink" : "border border-ink/20 text-ink hover:bg-ink/5"
                  }`}
                >
                  {t.work.kinds[k]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 flex items-start gap-3 md:mt-20 md:gap-4">
        {columns.map((col, c) => (
        <div key={c} className="relative flex min-w-0 flex-1 flex-col gap-3 md:gap-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {col.map(({ shot, i }) => (
            <motion.figure
              key={shot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="min-w-0"
            >
              <button
                type="button"
                data-reveal="image"
                onClick={(e) => {
                  lastTrigger.current = e.currentTarget;
                  setIndex(i);
                }}
                className="group block w-full cursor-zoom-in overflow-hidden rounded-sm bg-paper-2 transition-transform duration-200 active:scale-[0.98]"
                aria-label={label(shot)}
              >
                <Image
                  src={shot.src}
                  alt={altOf(shot)}
                  width={shot.w}
                  height={shot.h}
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </button>
              {shot.real ? (
                // Real work: say who it was made for, and what kind of client it is.
                <figcaption className="flex flex-col gap-0.5 pt-2 text-xs md:text-sm">
                  <span className="truncate font-medium">{shot.client ?? shot.place}</span>
                  <span className="truncate text-muted">
                    {shot.kind ? t.work.kinds[shot.kind] : ""}
                    {shot.client ? ` · ${shot.place}` : ""}
                  </span>
                </figcaption>
              ) : (
                <figcaption className="flex flex-col pt-2 text-xs sm:flex-row sm:justify-between md:text-sm">
                  <span className="text-muted tabular-nums">
                    {t.work.frame} {frameNo(shot.id)}
                  </span>
                  <span className="truncate">{shot.place}</span>
                </figcaption>
              )}
            </motion.figure>
          ))}
        </AnimatePresence>
        </div>
        ))}
      </div>

      {teaser && (
        <div data-reveal className="mt-12 flex justify-center md:mt-16">
          <TransitionLink
            href="/travaux/"
            className="flex h-14 items-center rounded-full bg-ink px-8 text-sm font-medium text-paper transition-transform duration-200 hover:scale-[1.03] active:scale-95"
          >
            {t.home.allWork}
          </TransitionLink>
        </div>
      )}

      <AnimatePresence>
        {current && index !== null && (
          <motion.div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-label={label(current)}
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/80 p-4 text-paper md:p-12"
            onClick={close}
            // Swipe left or right to move through the images on touch screens.
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              touchX.current = null;
              if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 0.96, filter: "blur(14px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={current.src}
                  alt={altOf(current)}
                  width={current.w}
                  height={current.h}
                  sizes="90vw"
                  className="h-auto max-h-[68svh] w-auto max-w-full rounded-sm shadow-2xl"
                />
                {current.real && (
                  <p className="mt-3 text-center text-sm text-paper/85">
                    <span className="font-medium">{current.client ?? current.place}</span>
                    <span className="text-paper/60">
                      {current.kind ? ` · ${t.work.kinds[current.kind]}` : ""}
                      {current.client ? ` · ${current.place}` : ""}
                    </span>
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

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
                {index + 1} / {visible.length}
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
