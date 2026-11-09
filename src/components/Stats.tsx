"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLang } from "./LangProvider";
import { clients, films, shots } from "@/content/site";
import { motionMode } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

// Counted from the site's own content, so the numbers stay true as work is added.
const counts = {
  photos: shots.filter((s) => s.category !== "design" && s.category !== "studio").length,
  designs: shots.filter((s) => s.category === "design").length,
  films: films.length,
  clients: clients.length,
};

/** A band of real numbers under the crafts, counting up when it comes into view. */
export function Stats() {
  const { t } = useLang();
  const s = t.stats;
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || motionMode() === "gentle") return;
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>("[data-count]").forEach((n) => {
        const target = Number(n.dataset.count);
        const o = { v: 0 };
        gsap.to(o, {
          v: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
          onUpdate: () => (n.textContent = String(Math.round(o.v))),
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const items: { value: string; count?: number; label: string }[] = [
    { value: String(counts.photos), count: counts.photos, label: s.photos },
    { value: String(counts.designs), count: counts.designs, label: s.designs },
    { value: String(counts.films), count: counts.films, label: s.films },
    { value: String(counts.clients), count: counts.clients, label: s.clients },
    { value: s.replyValue, label: s.reply },
  ];

  return (
    <section ref={root} aria-label={s.title} className="bg-paper px-4 pb-24 md:px-8 md:pb-32">
      <p data-reveal className="text-xs font-medium tracking-[0.28em] text-muted uppercase">
        {s.title}
      </p>
      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[1.5rem] bg-ink/10 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((it, i) => (
          <div key={it.label} data-reveal className={`flex flex-col-reverse bg-paper p-6 md:p-8 ${i === items.length - 1 ? "col-span-2 sm:col-span-1" : ""}`}>
            <dt className="mt-3 text-sm text-graphite">{it.label}</dt>
            <dd className="font-display text-[clamp(3rem,6vw,5rem)] leading-none font-semibold tracking-[-0.045em] tabular-nums">
              <span data-count={it.count}>{it.value}</span>
              <span className="text-brand">.</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
