"use client";

import { useLang } from "./LangProvider";
import { TransitionLink } from "./TransitionProvider";

/** "page": the full /a-propos introduction. "teaser": a short home-page version linking to it. */
export function About({ mode = "page" }: { mode?: "page" | "teaser" }) {
  const { t } = useLang();
  const teaser = mode === "teaser";
  const Heading = teaser ? "h2" : "h1";

  return (
    <section
      className={`grid gap-12 bg-paper-2 px-4 md:grid-cols-12 md:px-8 ${teaser ? "py-24 md:py-36" : "pt-32 pb-24 md:pt-44 md:pb-36"}`}
    >
      <div className="md:col-span-8 md:col-start-3">
        <Heading
          data-reveal
          className="font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.9] font-semibold tracking-[-0.04em]"
        >
          {t.about.title}
        </Heading>
        <div className="mt-8 max-w-[58ch] space-y-5 text-lg leading-relaxed text-graphite">
          {(teaser ? t.about.bio.slice(0, 1) : t.about.bio).map((p) => (
            <p key={p} data-reveal>
              {p}
            </p>
          ))}
        </div>

        {teaser ? (
          <div data-reveal className="mt-10">
            <TransitionLink
              href="/a-propos/"
              className="inline-flex h-14 items-center rounded-full bg-ink px-8 text-sm font-medium text-paper transition-transform duration-200 hover:scale-[1.03] active:scale-95"
            >
              {t.home.more}
            </TransitionLink>
          </div>
        ) : (
          <>
            <h2 data-reveal className="mt-14 text-sm font-medium text-muted">
              {t.about.servicesTitle}
            </h2>
            <ul className="mt-3">
              {t.about.services.map((s) => (
                <li
                  key={s}
                  data-reveal
                  className="border-t border-ink/15 py-4 font-display text-2xl tracking-tight last:border-b md:text-3xl"
                >
                  {s}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
