"use client";

import { useState } from "react";
import Image from "next/image";
import { useLang } from "./LangProvider";
import { films } from "@/content/site";

/** Grid of films; each card plays once the client's videos are added. */
export function Films() {
  const { t, lang } = useLang();
  const [opened, setOpened] = useState<number | null>(null);

  return (
    <section data-nav-tone="light" className="bg-paper px-4 py-24 md:px-8 md:py-32">
      <h2 data-reveal className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
        {t.films.more}
      </h2>
      <div className="mt-10 grid gap-x-4 gap-y-10 md:mt-14 md:grid-cols-2">
        {films.map((f) => (
          <article key={f.id}>
            <button
              type="button"
              data-reveal="image"
              onClick={() => setOpened(f.id)}
              className="group relative block aspect-video w-full cursor-pointer overflow-hidden rounded-sm bg-graphite active:scale-[0.98]"
              aria-label={`${t.films.play} : ${f.title[lang]}`}
            >
              <Image
                src={f.poster}
                alt=""
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
              {opened === f.id ? (
                <span role="status" className="absolute inset-0 flex items-center justify-center bg-ink/80 p-6 text-center text-paper">
                  {t.films.soon}
                </span>
              ) : (
                <span className="liquid-glass-dark absolute bottom-4 left-4 flex items-center gap-2 rounded-full py-1.5 pr-4 pl-1.5 text-sm text-paper">
                  <span className="flex size-8 items-center justify-center rounded-full bg-brand text-ink">
                    <svg viewBox="0 0 24 24" aria-hidden className="ml-0.5 size-4" fill="currentColor">
                      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
                    </svg>
                  </span>
                  <span className="tabular-nums">{f.duration}</span>
                </span>
              )}
            </button>
            <div data-reveal className="mt-3 flex items-baseline justify-between gap-4">
              <h3 className="font-display text-xl tracking-tight md:text-2xl">{f.title[lang]}</h3>
              <span className="shrink-0 text-sm text-muted">{f.kind[lang]}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
