"use client";

import Image from "next/image";
import { useLang } from "./LangProvider";
import { portrait } from "@/content/site";

export function About() {
  const { t } = useLang();

  return (
    <section id="about" className="grid gap-12 bg-paper-2 px-4 py-24 md:grid-cols-12 md:px-8 md:py-36">
      <figure className="md:col-span-5">
        <Image
          src={portrait}
          alt="Portrait du photographe, image de démonstration"
          width={900}
          height={1125}
          sizes="(min-width: 768px) 40vw, 100vw"
          className="h-auto w-full grayscale"
        />
      </figure>

      <div className="md:col-span-6 md:col-start-7 md:pt-4">
        <h2 className="font-display text-[clamp(2.8rem,6.5vw,6rem)] leading-[0.9] font-semibold tracking-[-0.04em]">
          {t.about.title}
        </h2>
        <div className="mt-8 max-w-[58ch] space-y-5 text-lg leading-relaxed text-graphite">
          {t.about.bio.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        <h3 className="mt-14 text-sm font-medium text-muted">{t.about.servicesTitle}</h3>
        <ul className="mt-3">
          {t.about.services.map((s) => (
            <li
              key={s}
              className="border-t border-ink/15 py-4 font-display text-2xl tracking-tight last:border-b md:text-3xl"
            >
              {s}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
