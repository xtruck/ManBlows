"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useMotionMode } from "@/lib/motion";

export type DeckItem = {
  src: string;
  /** Small label on the front image (client, title). */
  caption?: string;
  /** Show a play badge, for videos. */
  play?: boolean;
};

/**
 * A stack of preview images. The front one moves to the back every few seconds while the
 * stack is on screen; hovering fans it out. An arrow button invites the visitor to click
 * through to the full set. Decorative: the card's own link carries the accessible name.
 */
export function Deck({ items, hint, delay = 0 }: { items: DeckItem[]; hint: string; delay?: number }) {
  const mode = useMotionMode();
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);

  // Only animate while the stack is on screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (mode === "gentle" || !visible || paused || items.length < 2) return;
    let timer = 0;
    // Each stack starts a little later than the previous one, so they never move in unison.
    const start = window.setTimeout(() => {
      timer = window.setInterval(() => setActive((a) => (a + 1) % items.length), 3200);
    }, delay);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(timer);
    };
  }, [mode, visible, paused, items.length, delay]);

  return (
    <div
      ref={root}
      aria-hidden
      className="deck relative mx-auto mb-7 aspect-[4/5] w-[60%] max-w-[15rem]"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      {items.map((item, i) => {
        const depth = Math.min(3, (i - active + items.length) % items.length);
        return (
          <div key={item.src} data-depth={depth} className="deck-item absolute inset-0 overflow-hidden rounded-xl bg-ink/15 shadow-xl shadow-black/25">
            <Image src={item.src} alt="" fill sizes="(min-width: 768px) 20vw, 60vw" className="object-cover" />
            {item.play && (
              <span className="absolute top-1/2 left-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-ink shadow-lg">
                <svg viewBox="0 0 24 24" className="ml-0.5 size-5" fill="currentColor">
                  <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
                </svg>
              </span>
            )}
            {item.caption && (
              <span className="deck-cap absolute inset-x-0 top-0 bg-gradient-to-b from-black/75 to-transparent px-3 pt-2.5 pb-8 text-xs font-medium text-white">
                <span className="line-clamp-2">{item.caption}</span>
              </span>
            )}
          </div>
        );
      })}

      <span className="absolute -bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-medium whitespace-nowrap text-paper shadow-lg">
        {hint}
        <span className="deck-arrow">→</span>
      </span>
    </div>
  );
}
