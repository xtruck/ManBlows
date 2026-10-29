"use client";

import { useLang } from "./LangProvider";
import { TransitionLink } from "./TransitionProvider";

/**
 * The studio's three crafts. Graphic design is where the founder started, so its
 * card is the highlighted one (brand yellow) and links to the design work.
 */
export function Disciplines() {
  const { t } = useLang();
  const d = t.disciplines;

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
          return (
            <li
              key={item.name}
              data-reveal
              className={`relative flex min-h-[18rem] flex-col justify-between overflow-hidden rounded-[1.75rem] p-6 md:min-h-[24rem] md:p-8 ${
                design ? "on-brand bg-brand text-ink" : "border border-ink/15 bg-paper text-ink"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm tabular-nums opacity-60">0{i + 1}</span>
                {design && (
                  <span className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-paper">{d.since}</span>
                )}
              </div>

              {design && (
                // Decorative stack of "poster" cards, a nod to the Canva layouts the work started from.
                <div aria-hidden className="pointer-events-none absolute top-14 right-6 h-28 w-28 md:right-8 md:h-36 md:w-36">
                  <span className="absolute inset-0 rotate-[-9deg] rounded-xl bg-ink/90" />
                  <span className="absolute inset-0 rotate-[5deg] rounded-xl bg-paper" />
                  <span className="absolute inset-3 rotate-[5deg] rounded-lg bg-[#ff5e5b]" />
                  <span className="absolute top-6 left-6 h-1.5 w-10 rotate-[5deg] rounded-full bg-paper md:top-8" />
                  <span className="absolute top-10 left-6 h-1.5 w-7 rotate-[5deg] rounded-full bg-paper/70 md:top-12" />
                </div>
              )}

              <div className="mt-24 md:mt-32">
                <h3 className="font-display text-4xl leading-none font-semibold tracking-[-0.03em] md:text-5xl">{item.name}</h3>
                <p className={`mt-4 max-w-[34ch] leading-relaxed ${design ? "text-ink" : "text-graphite"}`}>{item.text}</p>
                {(design || i === 1) && (
                  <TransitionLink
                    href={design ? "/travaux/" : "/films/"}
                    className="mt-6 inline-flex h-11 items-center rounded-full bg-ink px-6 text-sm font-medium text-paper transition-transform duration-200 hover:scale-[1.03] active:scale-95"
                  >
                    {design ? d.cta : t.home.films}
                  </TransitionLink>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
