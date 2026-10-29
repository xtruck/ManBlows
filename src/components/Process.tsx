"use client";

import { useLang } from "./LangProvider";
import { LightLeaks } from "./LightLeaks";

/** The five steps of working together; numbered because they happen in order. */
export function Process() {
  const { t } = useLang();
  return (
    <section className="relative isolate bg-ink px-4 py-24 text-paper md:px-8 md:py-36">
      <LightLeaks className="opacity-40" />
      <h2 data-reveal className="font-display text-[clamp(3rem,8vw,7rem)] leading-[0.9] font-semibold tracking-[-0.04em]">
        {t.process.title}
      </h2>
      <ol className="mt-14 md:mt-20">
        {t.process.steps.map((s, i) => (
          <li
            key={s.title}
            data-reveal
            className="grid grid-cols-[3rem_1fr] gap-x-4 border-t border-paper/15 py-7 md:grid-cols-12 md:gap-x-8 md:py-9"
          >
            <span className="font-display text-xl text-brand tabular-nums md:col-span-1 md:text-2xl">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display text-2xl tracking-tight md:col-span-4 md:text-4xl">{s.title}</h3>
            <p className="col-start-2 mt-2 max-w-[48ch] text-base leading-relaxed text-paper/65 md:col-span-6 md:col-start-7 md:mt-0 md:text-lg">
              {s.text}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
