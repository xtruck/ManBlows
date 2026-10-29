"use client";

import { useLang } from "./LangProvider";
import { TransitionLink } from "./TransitionProvider";
import { LightLeaks } from "./LightLeaks";
import { showreel } from "@/content/site";

/** The showreel: a real video from the founder, with a link to the films page on the home page. */
export function Showreel({ cta = false }: { cta?: boolean }) {
  const { t } = useLang();

  return (
    <section className="relative isolate bg-ink px-4 py-24 text-paper md:px-8 md:py-36">
      <LightLeaks className="opacity-45" />
      <div className="grid gap-6 md:grid-cols-12 md:items-end">
        <h2
          data-reveal
          className="font-display text-[clamp(3.2rem,9vw,8.5rem)] leading-[0.88] font-semibold tracking-[-0.04em] md:col-span-7"
        >
          {t.reel.title}
        </h2>
        <p data-reveal className="max-w-[44ch] text-lg leading-relaxed text-paper/65 md:col-span-4 md:col-start-9">
          {t.reel.text}
        </p>
      </div>

      <div data-reveal="image" className="relative mt-12 aspect-video overflow-hidden rounded-sm bg-graphite md:mt-16">
        <video
          src={showreel.video}
          poster={showreel.poster}
          controls
          playsInline
          preload="none"
          aria-label={t.reel.title}
          className="h-full w-full object-contain"
        />
      </div>

      {cta && (
        <div data-reveal className="mt-10 flex justify-center md:mt-14">
          <TransitionLink
            href="/films/"
            className="liquid-glass-dark flex h-14 items-center rounded-full px-8 text-sm font-medium transition-transform duration-200 hover:scale-[1.03] active:scale-95"
          >
            {t.home.films}
          </TransitionLink>
        </div>
      )}
    </section>
  );
}
