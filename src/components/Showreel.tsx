"use client";

import { useLang } from "./LangProvider";
import { TransitionLink } from "./TransitionProvider";
import { LightLeaks } from "./LightLeaks";
import { showreel } from "@/content/site";

/**
 * The showreel: a vertical 1080x1920 montage of the founder's best footage, shown in a phone-shaped
 * frame so it is never stretched or cropped. On the home page it also links to the films page.
 */
export function Showreel({ cta = false }: { cta?: boolean }) {
  const { t } = useLang();

  return (
    <section className="relative isolate bg-ink px-4 py-24 text-paper md:px-8 md:py-36">
      <LightLeaks className="opacity-45" />
      <div className="grid gap-12 md:grid-cols-12 md:items-center">
        <div className="md:col-span-7">
          <h2
            data-reveal
            className="font-display text-[clamp(3.2rem,9vw,8.5rem)] leading-[0.88] font-semibold tracking-[-0.04em]"
          >
            {t.reel.title}
          </h2>
          <p data-reveal className="mt-6 max-w-[44ch] text-lg leading-relaxed text-paper/65">
            {t.reel.text}
          </p>
          {cta && (
            <div data-reveal className="mt-10">
              <TransitionLink
                href="/films/"
                className="liquid-glass-dark inline-flex h-14 items-center rounded-full px-8 text-sm font-medium transition-transform duration-200 hover:scale-[1.03] active:scale-95"
              >
                {t.home.films}
              </TransitionLink>
            </div>
          )}
        </div>

        <div
          data-reveal="image"
          className="relative mx-auto aspect-[9/16] w-full max-w-[22rem] overflow-hidden rounded-[1.25rem] bg-graphite shadow-2xl shadow-black/40 md:col-span-5 md:ml-auto md:max-w-[24rem]"
        >
          <video
            src={showreel.video}
            poster={showreel.poster}
            controls
            playsInline
            preload="none"
            aria-label={t.reel.title}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
