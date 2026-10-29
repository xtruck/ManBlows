"use client";

import { useLang } from "./LangProvider";
import { clients } from "@/content/site";

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
  const { t } = useLang();

  return (
    <section className="overflow-hidden bg-paper py-24 md:py-36">
      <h2 data-reveal className="px-4 font-display text-3xl font-semibold tracking-tight md:px-8">
        {t.clients.title}
      </h2>

      <div data-reveal className="mt-10 border-y border-ink/15 py-6">
        <div className="marquee flex w-max">
          <NameRow />
          <NameRow hidden />
        </div>
      </div>

    </section>
  );
}
