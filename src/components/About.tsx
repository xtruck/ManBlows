"use client";

import Image from "next/image";
import { useLang } from "./LangProvider";
import { TransitionLink } from "./TransitionProvider";

/** "page": the full /a-propos introduction. "teaser": a short home-page version linking to it. */
export function About({ mode = "page" }: { mode?: "page" | "teaser" }) {
  const { t } = useLang();
  const teaser = mode === "teaser";
  const Heading = teaser ? "h2" : "h1";

  return (
    <section
      className={`bg-paper-2 px-4 md:px-8 ${teaser ? "py-24 md:py-36" : "pt-32 pb-24 md:pt-44 md:pb-36"}`}
    >
      <div className={teaser ? "md:mx-auto md:max-w-[58rem]" : ""}>
        {/* Always visible: no reveal animation on the title */}
        <Heading className="font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.9] font-semibold tracking-[-0.04em]">
          {t.about.title}
        </Heading>

        {/* Page: black-and-white portrait on one side, the story on the other; stacked on phones. */}
        <div className={teaser ? "" : "mt-10 grid items-start gap-8 md:mt-14 md:grid-cols-2 md:gap-14"}>
          {!teaser && (
            <figure className="md:sticky md:top-28">
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/egu.webp`}
                alt={t.about.portraitAlt}
                width={800}
                height={1199}
                sizes="(min-width: 768px) 45vw, 100vw"
                priority
                className="h-auto w-full max-w-[34rem] rounded-2xl object-cover grayscale contrast-[1.05] shadow-xl shadow-ink/15 md:max-h-[78svh] md:object-top"
              />
              <figcaption className="mt-3 text-sm text-muted">{t.about.portraitCaption}</figcaption>
            </figure>
          )}

          <div>
            <div className="max-w-[58ch] space-y-5 text-lg leading-relaxed text-graphite">
              {(teaser ? t.about.bio.slice(0, 1) : t.about.bio).map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            {teaser ? (
              <div className="mt-10">
                <TransitionLink
                  href="/a-propos/"
                  className="inline-flex h-14 items-center rounded-full bg-ink px-8 text-sm font-medium text-paper transition-transform duration-200 hover:scale-[1.03] active:scale-95"
                >
                  {t.home.more}
                </TransitionLink>
              </div>
            ) : (
              <>
                <h2 className="mt-12 text-sm font-medium text-muted">{t.about.servicesTitle}</h2>
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
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
