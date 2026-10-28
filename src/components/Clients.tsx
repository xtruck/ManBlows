"use client";

import { useLang } from "./LangProvider";
import { clients, testimonials } from "@/content/site";

function NameRow({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden} className="flex shrink-0 items-center">
      {clients.map((c) => (
        <li
          key={c}
          className="flex items-center gap-10 pr-10 font-display text-[clamp(2.4rem,6vw,5.5rem)] font-semibold tracking-[-0.03em] whitespace-nowrap"
        >
          {c}
          <span aria-hidden className="size-3 rounded-full bg-brand ring-1 ring-ink/20" />
        </li>
      ))}
    </ul>
  );
}

export function Clients() {
  const { t, lang } = useLang();

  return (
    <section className="overflow-hidden bg-paper py-24 md:py-36">
      <h2 className="px-4 font-display text-3xl font-semibold tracking-tight md:px-8">{t.clients.title}</h2>

      <div className="mt-10 border-y border-ink/15 py-6">
        <div className="marquee flex w-max">
          <NameRow />
          <NameRow hidden />
        </div>
      </div>

      <div className="mt-20 grid gap-14 px-4 md:grid-cols-2 md:gap-10 md:px-8">
        {testimonials.map((q) => (
          <figure key={q.name}>
            <blockquote className="max-w-[34ch] font-display text-2xl leading-snug tracking-tight md:text-3xl">
              «&nbsp;{q.quote[lang]}&nbsp;»
            </blockquote>
            <figcaption className="mt-5 text-sm">
              <span className="font-medium">{q.name}</span>
              <span className="block text-muted">{q.role[lang]}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
