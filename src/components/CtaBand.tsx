"use client";

import { useLang } from "./LangProvider";
import { TransitionLink } from "./TransitionProvider";
import { contact } from "@/content/site";

/** Closing call to action on the home and about pages. */
export function CtaBand() {
  const { t } = useLang();
  return (
    <section className="on-brand bg-brand px-4 py-24 text-ink md:px-8 md:py-32">
      <h2 data-reveal className="font-display text-[clamp(3.2rem,10vw,9rem)] leading-[0.86] font-semibold tracking-[-0.045em]">
        {t.cta.title}
      </h2>
      <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <p data-reveal className="max-w-[38ch] text-lg leading-relaxed">
          {t.cta.text}
        </p>
        <div data-reveal className="flex flex-wrap gap-3">
          <TransitionLink
            href="/contact/"
            data-magnetic
            className="flex h-14 items-center rounded-full bg-ink px-8 text-sm font-medium text-paper active:scale-95"
          >
            {t.cta.button}
          </TransitionLink>
          <a
            href={`https://wa.me/${contact.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-glass flex h-14 items-center rounded-full px-8 text-sm font-medium active:scale-95"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
