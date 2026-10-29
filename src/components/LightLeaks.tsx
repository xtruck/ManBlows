"use client";

import { useEffect, useRef } from "react";

/**
 * Warm film-style light leaks for dark sections; the parent needs `relative isolate`.
 * The drift animation pauses while the section is off screen, so the page only
 * animates what the visitor can actually see.
 */
export function LightLeaks({ className = "" }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      el.dataset.paused = entry.isIntersecting ? "false" : "true";
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={root} aria-hidden className={`leaks pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}>
      <span className="leak leak-yellow -top-[25%] -right-[12%] size-[62vmax]" />
      <span className="leak leak-coral -bottom-[30%] -left-[18%] size-[58vmax]" />
      <span className="leak leak-amber top-[35%] left-[38%] size-[34vmax] opacity-35" />
    </div>
  );
}
