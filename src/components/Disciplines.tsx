"use client";

import { useLang } from "./LangProvider";
import { getLenis } from "./SmoothScroll";
import { TransitionLink } from "./TransitionProvider";

const ink = "#0e0e0e";
const brand = "#ffc400";
const coral = "#ff5e5b";

/** Line-art illustrations, one per craft. Decorative, so hidden from screen readers. */
function PhotoArt() {
  return (
    <svg viewBox="0 0 160 120" aria-hidden className="h-full w-auto">
      {/* strap lugs and top plate */}
      <rect x="10" y="40" width="8" height="14" rx="3" fill={ink} />
      <rect x="142" y="40" width="8" height="14" rx="3" fill={ink} />
      <path d="M56 34l8-12h32l8 12z" fill={ink} />
      <rect x="112" y="22" width="22" height="9" rx="4.5" fill={brand} stroke={ink} strokeWidth="2" />
      {/* body */}
      <rect x="14" y="32" width="132" height="76" rx="12" fill={ink} />
      <rect x="14" y="32" width="132" height="22" rx="12" fill="#2b2927" />
      <circle cx="34" cy="46" r="4" fill={coral} />
      {/* lens: ring, glass, aperture blades and a highlight */}
      <circle cx="80" cy="74" r="34" fill="#d8d3ca" />
      <circle cx="80" cy="74" r="29" fill="#1c1b1a" />
      <circle cx="80" cy="74" r="22" fill="none" stroke={brand} strokeWidth="2" />
      <path d="M80 56l9 15-9 17-9-17z" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" />
      <path d="M62 74h36M69 59l22 30M91 59L69 89" stroke="#fff" strokeOpacity="0.18" strokeWidth="1.2" />
      <circle cx="71" cy="64" r="4" fill="#fff" fillOpacity="0.7" />
    </svg>
  );
}

function VideoArt() {
  return (
    <svg viewBox="0 0 160 120" aria-hidden className="h-full w-auto">
      {/* film strip behind */}
      <rect x="104" y="14" width="40" height="92" rx="4" fill={ink} transform="rotate(8 124 60)" />
      <g fill="#f6f3ee" transform="rotate(8 124 60)">
        {[22, 38, 54, 70, 86].map((y) => (
          <g key={y}>
            <rect x="107" y={y} width="5" height="8" rx="1.5" />
            <rect x="136" y={y} width="5" height="8" rx="1.5" />
          </g>
        ))}
      </g>
      {/* clapperboard */}
      <rect x="14" y="48" width="96" height="62" rx="6" fill={ink} />
      <g transform="rotate(-9 14 46)">
        <rect x="14" y="26" width="96" height="20" rx="4" fill={ink} stroke="#f6f3ee" strokeWidth="2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${24 + i * 18} 26l-8 20h9l8-20z`} fill="#f6f3ee" />
        ))}
      </g>
      <rect x="20" y="52" width="84" height="6" rx="3" fill="#f6f3ee" fillOpacity="0.18" />
      <circle cx="62" cy="86" r="17" fill={brand} />
      <path d="M57 77v18l15-9z" fill={ink} />
    </svg>
  );
}

function DesignArt() {
  return (
    <svg viewBox="0 0 160 120" aria-hidden className="h-full w-auto">
      <rect x="40" y="10" width="68" height="94" rx="9" fill={ink} transform="rotate(-10 74 57)" />
      <rect x="52" y="14" width="68" height="94" rx="9" fill="#f6f3ee" transform="rotate(6 86 61)" />
      <g transform="rotate(6 86 61)">
        <rect x="60" y="22" width="52" height="40" rx="5" fill={coral} />
        <circle cx="86" cy="42" r="11" fill={brand} />
        <rect x="60" y="70" width="40" height="5" rx="2.5" fill={ink} />
        <rect x="60" y="81" width="28" height="5" rx="2.5" fill={ink} fillOpacity="0.5" />
        <rect x="60" y="92" width="34" height="5" rx="2.5" fill={ink} fillOpacity="0.25" />
      </g>
      {/* a pen nib drawing a curve */}
      <path d="M18 100c14-10 22 6 36-4" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />
      <path d="M124 78l16 28-9-3-5 9z" fill={ink} />
    </svg>
  );
}

const arts = [PhotoArt, VideoArt, DesignArt];

/**
 * The studio's three crafts. Graphic design is where the founder started, so its
 * card is the highlighted one (brand yellow) with links to the designs and to the rates.
 */
export function Disciplines() {
  const { t } = useLang();
  const d = t.disciplines;

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
    <section className="bg-paper-2 px-4 py-24 md:px-8 md:py-36">
      <div className="grid gap-6 md:grid-cols-12 md:items-end">
        <h2
          data-reveal
          className="font-display text-[clamp(3rem,8vw,7.5rem)] leading-[0.9] font-semibold tracking-[-0.04em] md:col-span-8"
        >
          {d.title}
        </h2>
        <p data-reveal className="max-w-[44ch] text-lg leading-relaxed text-muted md:col-span-4">
          {d.intro}
        </p>
      </div>

      <ul className="mt-12 grid gap-4 md:mt-20 md:grid-cols-3">
        {d.items.map((item, i) => {
          const design = i === 2;
          const Art = arts[i];
          return (
            <li
              key={item.name}
              data-reveal
              className={`relative flex flex-col overflow-hidden rounded-[1.75rem] p-6 md:min-h-[26rem] md:p-8 ${
                design ? "on-brand bg-brand text-ink" : "border border-ink/15 bg-paper text-ink"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm tabular-nums opacity-60">0{i + 1}</span>
                {design && (
                  <span className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-paper">{d.since}</span>
                )}
              </div>

              {/* In the card's flow (not floating) so it never overlaps the text, on any screen */}
              <div className="mt-6 h-28 md:h-36">
                <Art />
              </div>

              <div className="mt-auto pt-8">
                <h3 className="font-display text-4xl leading-none font-semibold tracking-[-0.03em] md:text-5xl">{item.name}</h3>
                <p className={`mt-4 max-w-[34ch] leading-relaxed ${design ? "text-ink" : "text-graphite"}`}>{item.text}</p>
                {(design || i === 1) && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <TransitionLink href={design ? "/travaux/" : "/films/"} className={`${linkClass} bg-ink text-paper`}>
                      {design ? d.cta : t.home.films}
                    </TransitionLink>
                    {design && (
                      <button type="button" onClick={toOffers} className={`${linkClass} cursor-pointer border border-ink/40 text-ink hover:bg-ink/5`}>
                        {d.offersCta}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
