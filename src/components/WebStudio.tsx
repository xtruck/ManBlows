"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useLang } from "./LangProvider";
import { TransitionLink } from "./TransitionProvider";
import { LightLeaks } from "./LightLeaks";
import TumbleDeckShowcase from "./ui/tumble-deck-showcase";
import { getLenis } from "./SmoothScroll";
import { openAssistant } from "@/lib/assistant";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const shot = (name: string) => `${base}/web/${name}.webp`;

const Check = () => (
  <svg viewBox="0 0 24 24" aria-hidden className="mt-0.5 size-5 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.2 4.2L19 7" />
  </svg>
);

/** A laptop and a phone showing a site the studio built (ANAREKA-CI), slightly turned in 3D. */
function Devices() {
  return (
    <div aria-hidden className="relative mx-auto aspect-[16/11] w-full max-w-[44rem] [perspective:1800px]">
      <div className="devices absolute inset-0 [transform-style:preserve-3d]">
        {/* Laptop */}
        <div className="absolute top-0 left-0 w-[86%]">
          <div className="rounded-t-[1rem] border border-paper/15 bg-[#1b1a19] p-[1.6%] shadow-2xl shadow-black/60">
            <div className="flex items-center gap-1.5 pb-[1.4%]">
              <span className="size-2 rounded-full bg-[#ff5f57]" />
              <span className="size-2 rounded-full bg-[#febc2e]" />
              <span className="size-2 rounded-full bg-[#28c840]" />
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-[0.35rem] bg-paper">
              <Image src={shot("real-anareka-desk")} alt="" fill sizes="(min-width: 1024px) 38rem, 86vw" className="object-cover object-top" preload />
            </div>
          </div>
          <div className="mx-[-4%] h-[0.9rem] rounded-b-[1rem] bg-gradient-to-b from-[#3a3734] to-[#1b1a19]" />
        </div>
        {/* Phone */}
        <div className="absolute right-0 bottom-0 w-[27%] [transform:translateZ(60px)]">
          <div className="rounded-[1.4rem] border border-paper/20 bg-[#111] p-[4%] shadow-2xl shadow-black/70">
            <div className="relative aspect-[9/19.5] overflow-hidden rounded-[1.05rem] bg-paper">
              <Image src={shot("real-anareka-phone")} alt="" fill sizes="(min-width: 1024px) 12rem, 27vw" className="object-cover object-top" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type Work = { name: string; kind: string; url: string; desk: string; phone: string; concept: boolean; sector: string };
type Sector = "food" | "fashion" | "realestate" | "health" | "services";
const SECTORS: Sector[] = ["food", "fashion", "realestate", "health", "services"];

/**
 * One site the studio built: its desktop page in a browser frame, its phone version standing
 * in front of it. On a mouse the card leans toward the pointer and the phone comes forward.
 */
function WorkCard({ work, concept, visit }: { work: Work; concept: string; visit: string }) {
  const card = useRef<HTMLAnchorElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = card.current;
    if (!el || e.pointerType !== "mouse" || document.documentElement.dataset.motion === "gentle") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * 10}deg`);
    el.style.setProperty("--rx", `${-((e.clientY - r.top) / r.height - 0.5) * 8}deg`);
  };
  const onLeave = () => {
    card.current?.style.setProperty("--rx", "0deg");
    card.current?.style.setProperty("--ry", "0deg");
  };

  return (
    <a
      ref={card}
      href={`https://${work.url}`}
      target="_blank"
      rel="noopener noreferrer"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-label={`${work.name}, ${work.kind}${work.concept ? ` (${concept})` : ""} : ${visit}`}
      className="work-card group block rounded-[1.6rem] border border-paper/10 bg-graphite/70 p-3 md:p-4"
    >
      <div className="work-card-stage relative pr-[16%] pb-[9%]">
        {/* Desktop page in a browser frame */}
        <div className="overflow-hidden rounded-[0.9rem] border border-paper/10 bg-[#161514] shadow-2xl shadow-black/50">
          <div className="flex items-center gap-1.5 px-3 py-2">
            <span className="size-1.5 rounded-full bg-paper/25" />
            <span className="size-1.5 rounded-full bg-paper/25" />
            <span className="size-1.5 rounded-full bg-paper/25" />
            <span className="ml-2 min-w-0 truncate rounded-full bg-paper/[0.06] px-2.5 py-0.5 text-[10px] text-paper/50">{work.url}</span>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={shot(work.desk)}
              alt={`${work.name}, ${work.kind}`}
              fill
              sizes="(min-width: 1280px) 26rem, (min-width: 768px) 42vw, 80vw"
              className="object-cover object-top transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
            />
          </div>
        </div>
        {/* Phone version, standing in front */}
        <div className="work-card-phone absolute right-0 bottom-0 w-[27%] rounded-[1rem] border border-paper/20 bg-[#0b0b0b] p-[3px] shadow-2xl shadow-black/70">
          <div className="relative aspect-[420/855] overflow-hidden rounded-[0.8rem]">
            <Image src={shot(work.phone)} alt="" fill sizes="(min-width: 768px) 9rem, 24vw" className="object-cover object-top" />
          </div>
        </div>
        {work.concept && (
          <span className="absolute top-11 left-3 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-medium text-brand ring-1 ring-brand/40 backdrop-blur-sm">
            {concept}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-4 px-1 pt-4 pb-1">
        <div className="min-w-0">
          <h3 className="font-display text-2xl font-semibold tracking-[-0.03em]">{work.name}</h3>
          <p className="mt-0.5 text-sm text-paper/65">{work.kind}</p>
        </div>
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-paper/20 text-brand transition-colors duration-300 group-hover:border-brand group-hover:bg-brand group-hover:text-ink"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17L17 7M9 7h8v8" />
          </svg>
        </span>
      </div>
    </a>
  );
}

/** The "Sites web" page: what the studio builds, this site as a case study, method, FAQ, contact. */
export function WebStudio() {
  const { t } = useLang();
  const w = t.webPage;
  // Sector filter for the project cards (the deck above always shows them all)
  const [sector, setSector] = useState<Sector | "all">("all");
  const shown = sector === "all" ? w.works : w.works.filter((work) => work.sector === sector);
  // The cards below move up or down when the list changes: re-measure the scroll reveals
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => window.clearTimeout(id);
  }, [sector]);

  const toCase = () => {
    const el = document.getElementById("etude-de-cas");
    if (!el) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { offset: -90 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const h2 = "font-display text-[clamp(2.4rem,6vw,5rem)] leading-[0.92] font-semibold tracking-[-0.04em]";

  return (
    <>
      {/* Header */}
      <section className="relative isolate overflow-hidden bg-ink px-4 pt-32 pb-20 text-paper md:px-8 md:pt-40 md:pb-28">
        <LightLeaks className="opacity-60" />
        <div className="mx-auto grid max-w-[110rem] items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="text-xs font-medium tracking-[0.28em] text-paper/60 uppercase md:text-sm">04 · Web</p>
            <h1 className="mt-5 font-display text-[clamp(3rem,8vw,7rem)] leading-[0.9] font-semibold tracking-[-0.045em]">
              {w.title} <span className="font-serif font-normal tracking-[-0.02em] text-brand italic">{w.titleAccent}</span>
            </h1>
            <p className="mt-8 max-w-[36rem] text-lg leading-relaxed text-paper/80 md:text-xl">{w.intro}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button type="button" onClick={() => openAssistant({ service: "web" })} className="flex h-12 items-center rounded-full bg-brand px-6 text-sm font-medium text-ink transition-transform duration-200 hover:scale-[1.03] active:scale-95">
                {w.cta}
              </button>
              <button type="button" onClick={toCase} className="flex h-12 cursor-pointer items-center rounded-full border border-paper/30 px-6 text-sm font-medium transition-colors hover:bg-paper/10 active:scale-95">
                {w.secondary}
              </button>
            </div>
            {/* What every site comes with, at a glance (the count follows the list of projects) */}
            <ul className="mt-10 grid max-w-[36rem] grid-cols-2 gap-x-6 gap-y-3 border-t border-paper/15 pt-6 text-sm text-paper/75 sm:grid-cols-4 sm:gap-x-4">
              {w.trust.map((item, i) => (
                <li key={item} className="flex flex-col gap-1">
                  {i === 0 ? (
                    <span className="font-display text-3xl leading-none font-semibold tracking-tight text-brand tabular-nums">{w.works.length}</span>
                  ) : (
                    <span aria-hidden className="size-2 rounded-full bg-brand" />
                  )}
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <Devices />
        </div>
      </section>

      {/* Real projects: screenshots of sites the studio built */}
      <section id="realisations" className="overflow-hidden bg-ink py-24 text-paper md:py-32">
        <div className="grid gap-6 px-4 md:grid-cols-12 md:items-end md:px-8">
          <h2 data-reveal className={`${h2} md:col-span-6`}>
            {w.worksTitle}
          </h2>
          <p data-reveal className="max-w-[44ch] text-lg leading-relaxed text-paper/70 md:col-span-6 md:justify-self-end">
            {w.worksIntro}
          </p>
        </div>
        {/* The sites as a deck of pages that tip over one after the other (tap, swipe sideways, arrows) */}
        <div data-reveal className="mt-12 px-4 md:px-8">
          <TumbleDeckShowcase
            cards={w.works.map((work) => ({ src: shot(work.desk), alt: `${work.name}, ${work.kind}` }))}
            height="min(78svh, 46rem)"
            aspect={1.6}
            depth={4}
            captureWheel={false}
            dragAxis="x"
            background="transparent"
            ariaLabel={w.worksDeck}
            hint={w.worksDeckHint}
            className="rounded-[1.6rem]"
            style={{ "--color-foreground": "var(--paper)", "--color-background": "var(--ink)", "--color-primary": "var(--brand)" } as React.CSSProperties}
          />
          <p className="mt-3 text-center text-sm text-paper/55">{w.worksDeckHint}</p>
        </div>
        {/* Sector filter */}
        <div role="group" aria-label={w.worksFilter} className="mt-14 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:flex-wrap md:px-8">
          {(["all", ...SECTORS] as const).map((key) => {
            const count = key === "all" ? w.works.length : w.works.filter((work) => work.sector === key).length;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={sector === key}
                onClick={() => setSector(key)}
                className={`flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 text-sm transition-colors duration-300 active:scale-95 ${
                  sector === key ? "bg-brand text-ink" : "border border-paper/20 text-paper/80 hover:border-paper/40"
                }`}
              >
                {key === "all" ? w.worksAll : w.worksSectors[key]}
                <span className={`tabular-nums ${sector === key ? "text-ink/60" : "text-paper/45"}`}>{count}</span>
              </button>
            );
          })}
        </div>
        {/* Phones: a row to swipe through. Wider screens: a grid. */}
        <ul className="works-row mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] md:grid md:snap-none md:grid-cols-2 md:gap-6 md:overflow-visible md:px-8 md:pb-0 xl:grid-cols-3">
          {shown.map((work) => (
            <li key={work.name} data-reveal className="w-[84vw] max-w-[26rem] shrink-0 snap-center md:w-auto md:max-w-none">
              <WorkCard work={work} concept={w.worksConcept} visit={w.worksVisit} />
            </li>
          ))}
        </ul>
      </section>

      {/* What we build */}
      <section className="bg-paper px-4 py-24 md:px-8 md:py-32">
        <h2 data-reveal className={h2}>
          {w.offersTitle}
        </h2>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {w.offers.map((o, i) => (
            <li key={o.name} data-reveal className="flex min-h-[15rem] flex-col rounded-[1.5rem] border border-ink/10 bg-paper-2 p-6 md:p-8">
              <span className="text-sm text-muted tabular-nums">0{i + 1}</span>
              <h3 className="mt-auto font-display text-3xl font-semibold tracking-[-0.03em]">{o.name}</h3>
              <p className="mt-3 leading-relaxed text-graphite">{o.text}</p>
            </li>
          ))}
        </ul>

        <div className="mt-20 grid gap-8 md:grid-cols-12">
          <h3 data-reveal className="font-display text-3xl font-semibold tracking-[-0.03em] md:col-span-4 md:text-4xl">
            {w.includedTitle}
          </h3>
          <ul className="grid gap-x-10 gap-y-4 sm:grid-cols-2 md:col-span-8">
            {w.included.map((item) => (
              <li key={item} data-reveal className="flex gap-3 border-t border-ink/15 pt-4 text-lg leading-snug">
                <Check />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Case study: this site */}
      <section id="etude-de-cas" className="relative isolate overflow-hidden bg-ink px-4 py-24 text-paper md:px-8 md:py-32">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 data-reveal className={h2}>
              {w.caseTitle}
            </h2>
            <p data-reveal className="mt-6 max-w-[40rem] text-lg leading-relaxed text-paper/75">
              {w.caseText}
            </p>
            <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-paper/10">
              {w.caseStats.map((s) => (
                <div key={s.label} data-reveal className="bg-ink p-5 md:p-7">
                  <dt className="text-sm text-paper/60">{s.label}</dt>
                  <dd className="mt-1 font-display text-5xl font-semibold tracking-[-0.04em] text-brand tabular-nums md:text-6xl">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div aria-hidden className="flex justify-center gap-4 md:gap-6">
            {["site-films", "site-contact"].map((n, i) => (
              <div key={n} data-reveal className={`w-[42%] max-w-[15rem] rounded-[1.6rem] border border-paper/15 bg-[#111] p-2 shadow-2xl shadow-black/60 ${i ? "mt-16" : ""}`}>
                <div className="relative aspect-[9/19.5] overflow-hidden rounded-[1.2rem] bg-paper">
                  <Image src={shot(n)} alt="" fill sizes="15rem" className="object-cover object-top" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Method */}
      <section className="bg-paper-2 px-4 py-24 md:px-8 md:py-32">
        <h2 data-reveal className={h2}>
          {w.processTitle}
        </h2>
        <ol className="mt-12 grid gap-px overflow-hidden rounded-[1.5rem] bg-ink/10 md:grid-cols-5">
          {w.process.map((step, i) => (
            <li key={step.title} data-reveal className="bg-paper-2 p-6 md:p-7">
              <span className="font-display text-2xl text-brand tabular-nums [-webkit-text-stroke:1px_var(--ink)] md:text-3xl">0{i + 1}</span>
              <h3 className="mt-6 font-display text-xl font-semibold tracking-[-0.02em]">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-graphite">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="bg-paper px-4 py-24 md:px-8 md:py-32">
        <div className="grid gap-10 md:grid-cols-12">
          <h2 data-reveal className={`${h2} md:col-span-5`}>
            {w.faqTitle}
          </h2>
          <div className="md:col-span-7">
            {w.faq.map((f) => (
              <details key={f.q} data-reveal className="group border-t border-ink/15 py-5 last:border-b">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-xl font-semibold tracking-[-0.02em] md:text-2xl [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full border border-ink/20 text-lg transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-[48ch] text-lg leading-relaxed text-graphite">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="on-brand bg-brand px-4 py-24 text-ink md:px-8 md:py-32">
        <h2 data-reveal className="font-display text-[clamp(3rem,9vw,8rem)] leading-[0.88] font-semibold tracking-[-0.045em]">
          {w.ctaTitle}
        </h2>
        <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p data-reveal className="max-w-[40ch] text-lg leading-relaxed">
            {w.ctaText}
          </p>
          <div data-reveal className="flex flex-wrap gap-3">
            <button type="button" onClick={() => openAssistant({ service: "web" })} className="flex h-14 items-center rounded-full bg-ink px-8 text-sm font-medium text-paper active:scale-95">
              {w.cta}
            </button>
            <TransitionLink href="/contact/" className="liquid-glass flex h-14 items-center rounded-full px-8 text-sm font-medium active:scale-95">
              {t.nav.contact}
            </TransitionLink>
          </div>
        </div>
      </section>
    </>
  );
}
