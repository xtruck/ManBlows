"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useLang } from "./LangProvider";
import { getLenis } from "./SmoothScroll";
import { shots, type Category } from "@/content/site";

type Filter = "all" | Category;
const filters: Filter[] = ["all", "ceremonies", "events", "portraits", "films"];

const frameNo = (id: number) => String(id).padStart(2, "0");

/** Contact-sheet grid: frame numbers under each image, filter chips, keyboard lightbox. */
export function Work() {
  const { t } = useLang();
  const [filter, setFilter] = useState<Filter>("all");
  const [index, setIndex] = useState<number | null>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);

  const visible = useMemo(() => (filter === "all" ? shots : shots.filter((s) => s.category === filter)), [filter]);
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

  return (
    <section id="work" className="bg-paper px-4 py-24 md:px-8 md:py-36">
      <div className="grid gap-8 md:grid-cols-12 md:items-end">
        <h2 className="font-display text-[clamp(3.2rem,9vw,8.5rem)] leading-[0.88] font-semibold tracking-[-0.04em] md:col-span-7">
          {t.work.title}
        </h2>
        <div className="md:col-span-5">
          <p className="max-w-[44ch] text-lg leading-relaxed text-muted">{t.work.intro}</p>
          <div role="group" aria-label={t.work.title} className="mt-6 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={`h-10 cursor-pointer rounded-full px-4 text-sm transition-colors duration-200 ${
                  filter === f ? "bg-ink text-paper" : "glass text-ink hover:bg-paper-2"
                }`}
              >
                {t.work.filters[f]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 columns-2 gap-3 md:mt-20 md:gap-4 lg:columns-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((shot, i) => (
            <motion.figure
              key={shot.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="mb-3 break-inside-avoid md:mb-4"
            >
              <button
                type="button"
                onClick={(e) => {
                  lastTrigger.current = e.currentTarget;
                  setIndex(i);
                }}
                className="group block w-full cursor-zoom-in overflow-hidden bg-paper-2"
                aria-label={`${t.work.frame} ${frameNo(shot.id)}, ${shot.place}`}
              >
                <Image
                  src={shot.src}
                  alt={`${shot.place}, photo de démonstration`}
                  width={shot.w}
                  height={shot.h}
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </button>
              <figcaption className="flex flex-col pt-2 text-xs sm:flex-row sm:justify-between md:text-sm">
                <span className="text-muted tabular-nums">
                  {t.work.frame} {frameNo(shot.id)}
                </span>
                <span className="truncate">{shot.place}</span>
              </figcaption>
            </motion.figure>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {current && index !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${t.work.frame} ${frameNo(current.id)}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/95 p-4 text-paper md:p-12"
            onClick={close}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={current.src}
                  alt={`${current.place}, photo de démonstration`}
                  width={current.w}
                  height={current.h}
                  sizes="90vw"
                  className="h-auto max-h-[78svh] w-auto max-w-full"
                />
              </motion.div>
            </AnimatePresence>

            <button
              type="button"
              autoFocus
              onClick={close}
              className="glass-dark absolute top-4 right-4 h-11 cursor-pointer rounded-full px-5 text-sm md:top-8 md:right-8"
            >
              {t.work.close}
            </button>
            <div
              className="absolute inset-x-4 bottom-4 flex items-center justify-between md:inset-x-8 md:bottom-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => step(-1)}
                className="glass-dark h-11 cursor-pointer rounded-full px-5 text-sm"
              >
                {t.work.prev}
              </button>
              <span className="text-sm text-paper/70 tabular-nums">
                {index + 1} / {visible.length}
                <span className="ml-4 hidden text-paper md:inline">{current.place}</span>
              </span>
              <button
                type="button"
                onClick={() => step(1)}
                className="glass-dark h-11 cursor-pointer rounded-full px-5 text-sm"
              >
                {t.work.next}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
