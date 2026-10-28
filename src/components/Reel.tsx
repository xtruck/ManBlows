"use client";

import { useState } from "react";
import Image from "next/image";
import { useLang } from "./LangProvider";
import { reelPoster } from "@/content/site";

export function Reel() {
  const { t } = useLang();
  const [playing, setPlaying] = useState(false);

  return (
    <section id="reel" className="bg-ink px-4 py-24 text-paper md:px-8 md:py-36">
      <div className="grid gap-6 md:grid-cols-12 md:items-end">
        <h2 className="font-display text-[clamp(3.2rem,9vw,8.5rem)] leading-[0.88] font-semibold tracking-[-0.04em] md:col-span-7">
          {t.reel.title}
        </h2>
        <p className="max-w-[44ch] text-lg leading-relaxed text-paper/65 md:col-span-4 md:col-start-9">{t.reel.text}</p>
      </div>

      <div className="relative mt-12 aspect-video overflow-hidden bg-graphite md:mt-16">
        {playing ? (
          // Placeholder until the client's showreel is uploaded (YouTube/Vimeo embed or a self-hosted file).
          <div className="flex h-full items-center justify-center p-8 text-center text-lg text-paper/80" role="status">
            {t.reel.pending}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 cursor-pointer"
          >
            <Image
              src={reelPoster}
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-70 grayscale transition-[filter,opacity] duration-700 group-hover:opacity-90 group-hover:grayscale-0"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex items-center gap-4">
                <span className="flex size-20 items-center justify-center rounded-full bg-brand text-ink transition-transform duration-300 group-hover:scale-110 md:size-28">
                  <svg viewBox="0 0 24 24" aria-hidden className="ml-1 size-7 md:size-9" fill="currentColor">
                    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
                  </svg>
                </span>
                <span className="hidden text-lg font-medium sm:inline">{t.reel.play}</span>
              </span>
            </span>
            <span className="absolute bottom-4 left-4 text-sm text-paper/80 tabular-nums md:bottom-6 md:left-6">02:14</span>
          </button>
        )}
      </div>
    </section>
  );
}
