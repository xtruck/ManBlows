"use client";

import { useState } from "react";
import Image from "next/image";
import { useLang } from "./LangProvider";
import { TransitionLink } from "./TransitionProvider";
import { reelPoster } from "@/content/site";

/** The showreel frame. On the home page it also links to the films page. */
export function Reel({ cta = false }: { cta?: boolean }) {
  const { t } = useLang();
  const [playing, setPlaying] = useState(false);

  return (
    <section data-nav-tone="dark" className="bg-ink px-4 py-24 text-paper md:px-8 md:py-36">
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
        {playing ? (
          // Placeholder until the client's showreel is uploaded (YouTube/Vimeo embed or a self-hosted file).
          <div className="flex h-full items-center justify-center p-8 text-center text-lg text-paper/80" role="status">
            {t.reel.pending}
          </div>
        ) : (
          <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 cursor-pointer">
            <Image
              src={reelPoster}
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-75 transition-[filter,opacity,transform] duration-700 group-hover:scale-[1.02] group-hover:opacity-90"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="liquid-glass-dark flex items-center gap-3 rounded-full py-2 pr-6 pl-2 transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
                <span className="relative flex size-14 items-center justify-center rounded-full bg-brand text-ink md:size-16">
                  <span className="absolute inset-0 animate-ping rounded-full bg-brand/40 [animation-duration:2.2s]" />
                  <svg viewBox="0 0 24 24" aria-hidden className="relative ml-0.5 size-6" fill="currentColor">
                    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
                  </svg>
                </span>
                <span className="text-base font-medium">{t.reel.play}</span>
              </span>
            </span>
            <span className="absolute bottom-4 left-4 text-sm text-paper/80 tabular-nums md:bottom-6 md:left-6">02:14</span>
          </button>
        )}
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
