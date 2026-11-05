"use client";

import { Deck, type DeckItem } from "./Deck";
import { useLang } from "./LangProvider";
import { getLenis } from "./SmoothScroll";
import { TransitionLink } from "./TransitionProvider";
import { films, shots, type Shot } from "@/content/site";

const isPhoto = (s: Shot) => s.category !== "design" && s.category !== "studio";
const photos = shots.filter(isPhoto);
const designs = shots.filter((s) => s.category === "design");

// A varied handful for each stack (ids come from photos.ts / design.ts).
const pick = (list: Shot[], ids: number[]) =>
  ids.map((id) => list.find((s) => s.id === id)).filter((s): s is Shot => Boolean(s));
const photoPicks = pick(photos, [205, 201, 209, 203, 206]);
const designPicks = pick(designs, [102, 109, 119, 126, 121]);
const filmPicks = [6, 10, 9, 8, 7].map((id) => films.find((f) => f.id === id)).filter((f): f is (typeof films)[number] => Boolean(f));
// This very site, captured on a phone (scripts/make-web-shots.mjs).
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const webPicks = ["site-work", "site-films", "site-contact"].map((n) => `${base}/web/${n}.webp`);

/**
 * The studio's four crafts, each with a stack of its real work. A click goes straight to the
 * photos, the films, the designs or the web offer. Graphic design is where the founder started,
 * so its card is brand yellow, with a second link to the offers; the web card is the new one (ink).
 */
export function Disciplines() {
  const { t, lang } = useLang();
  const d = t.disciplines;

  const decks: { items: DeckItem[]; hint: string; href: string }[] = [
    {
      items: photoPicks.map((s) => ({ src: s.src, caption: s.client ?? s.place })),
      hint: d.photosCta,
      href: "/travaux/#photos",
    },
    {
      items: filmPicks.map((f) => ({ src: f.poster, caption: f.title[lang], play: true })),
      hint: d.videosCta,
      href: "/films/",
    },
    {
      items: designPicks.map((s) => ({ src: s.src, caption: s.client ?? s.place })),
      hint: d.cta,
      href: "/travaux/#design",
    },
    {
      items: webPicks.map((src) => ({ src, caption: "EGC Studio" })),
      hint: d.webCta,
      href: "/web/",
    },
  ];

  const toOffers = () => {
    const el = document.getElementById("offres");
    if (!el) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { offset: -90 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const linkClass =
    "inline-flex h-11 items-center rounded-full px-6 text-sm font-medium transition-transform duration-200 hover:scale-[1.03] active:scale-95";

  return (
    <section className="bg-paper px-4 py-24 md:px-8 md:py-36">
      <div className="grid gap-6 md:grid-cols-12 md:items-end">
        <h2
          data-reveal
          className="font-display text-[clamp(3rem,8vw,7.5rem)] leading-[0.9] font-semibold tracking-[-0.04em] md:col-span-8"
        >
          {d.title} <span className="font-serif font-normal tracking-[-0.02em] italic">{d.titleAccent}</span>
        </h2>
        <p data-reveal className="max-w-[44ch] text-lg leading-relaxed text-muted md:col-span-4">
          {d.intro}
        </p>
      </div>

      <ul className="mt-12 grid gap-4 md:mt-20 md:grid-cols-2 xl:grid-cols-4">
        {d.items.map((item, i) => {
          const design = i === 2;
          const web = i === 3;
          const deck = decks[i];
          return (
            <li
              key={item.name}
              data-reveal
              className={`relative flex flex-col overflow-hidden rounded-[1.75rem] p-6 md:min-h-[34rem] md:p-8 ${
                design ? "on-brand bg-brand text-ink" : web ? "bg-ink text-paper" : "border border-ink/10 bg-paper-2 text-ink"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm tabular-nums opacity-60">0{i + 1}</span>
                {design && (
                  <span className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-paper">{d.since}</span>
                )}
                {web && <span className="rounded-full bg-brand px-3 py-1 text-xs font-medium text-ink">{d.newBadge}</span>}
              </div>

              {/* The stack is also a link to the full set; the buttons below carry the accessible name */}
              <TransitionLink href={deck.href} tabIndex={-1} aria-hidden className="mt-8 block">
                <Deck items={deck.items} hint={deck.hint} delay={i * 900} />
              </TransitionLink>

              <div className="mt-auto pt-6">
                <h3 className="font-display text-4xl leading-none font-semibold tracking-[-0.03em] md:text-5xl">{item.name}</h3>
                <p className={`mt-4 max-w-[34ch] leading-relaxed ${design ? "text-ink" : web ? "text-paper/80" : "text-graphite"}`}>{item.text}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <TransitionLink href={deck.href} className={`${linkClass} ${web ? "bg-brand text-ink" : "bg-ink text-paper"}`}>
                    {deck.hint}
                  </TransitionLink>
                  {design && (
                    <button type="button" onClick={toOffers} className={`${linkClass} cursor-pointer border border-ink/40 text-ink hover:bg-ink/5`}>
                      {d.offersCta}
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
