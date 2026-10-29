"use client";

import { LightLeaks } from "@/components/LightLeaks";
import { TransitionLink } from "@/components/TransitionProvider";
import { useLang } from "@/components/LangProvider";

const copy = {
  fr: { title: "Hors champ.", text: "Cette page n'existe pas ou a été déplacée.", home: "Retour à l'accueil" },
  en: { title: "Out of frame.", text: "This page doesn't exist or has moved.", home: "Back to home" },
};

export default function NotFound() {
  const { lang } = useLang();
  const c = copy[lang];
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-ink px-4 pt-32 pb-16 text-paper md:px-8 md:pb-24">
      <LightLeaks className="opacity-50" />
      <p aria-hidden className="font-display text-[clamp(6rem,28vw,22rem)] leading-[0.8] font-semibold tracking-[-0.06em] text-paper/10 tabular-nums">
        404
      </p>
      <h1 className="mt-6 font-display text-[clamp(2.6rem,7vw,6rem)] leading-[0.95] font-semibold tracking-[-0.04em]">{c.title}</h1>
      <p className="mt-4 max-w-[40ch] text-lg text-paper/70">{c.text}</p>
      <div className="mt-10">
        <TransitionLink href="/" className="btn-brand inline-flex h-14 items-center rounded-full px-8 text-sm font-medium">
          {c.home}
        </TransitionLink>
      </div>
    </section>
  );
}
