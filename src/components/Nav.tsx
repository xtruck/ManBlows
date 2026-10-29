"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Logo } from "./Logo";
import { useLang } from "./LangProvider";
import { getLenis } from "./SmoothScroll";
import { TransitionLink } from "./TransitionProvider";
import { normalize, routes } from "@/lib/routes";
import type { Lang } from "@/i18n/dict";

type Tone = "dark" | "light";

function LangToggle({ className = "", tone = "dark" }: { className?: string; tone?: Tone }) {
  const { lang, setLang } = useLang();
  const idle = tone === "dark" ? "text-paper/70 hover:text-paper" : "text-ink/60 hover:text-ink";
  const on = tone === "dark" ? "bg-paper text-ink" : "bg-ink text-paper";
  return (
    <div role="group" aria-label="Langue / Language" className={`flex rounded-full p-1 text-xs ${className}`}>
      {(["fr", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={`h-8 min-w-10 cursor-pointer rounded-full px-3 font-medium uppercase transition-colors duration-300 ${
            lang === l ? on : idle
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

const pages = routes.filter((r) => r.key !== "home");

export function Nav() {
  const { t } = useLang();
  const pathname = normalize(usePathname());
  const [open, setOpen] = useState(false);
  const [tone, setTone] = useState<Tone>("dark");

  // Like iOS bars, the glass takes the tint of whatever section is underneath it.
  useEffect(() => {
    let io: IntersectionObserver | undefined;
    const raf = requestAnimationFrame(() => {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) setTone((e.target as HTMLElement).dataset.navTone === "light" ? "light" : "dark");
          });
        },
        { rootMargin: "-40px 0px -92% 0px" },
      );
      document.querySelectorAll("[data-nav-tone]").forEach((el) => io?.observe(el));
    });
    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, [pathname]);

  const dark = tone === "dark";

  useEffect(() => {
    const lenis = getLenis();
    if (open) lenis?.stop();
    else lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-3 top-3 z-50 flex h-14 items-center justify-between rounded-full pr-2 pl-5 md:inset-x-8 md:top-5 ${
          dark ? "liquid-glass-dark text-paper" : "liquid-glass text-ink"
        }`}
      >
        <TransitionLink href="/" aria-label="Egu Studio" className="pt-2">
          <Logo tone={dark ? "paper" : "ink"} script={dark ? "white" : "ink"} className="text-[22px]" />
        </TransitionLink>

        <nav aria-label="Principal" className="hidden items-center gap-8 text-sm md:flex">
          {pages.map((p) => {
            const active = pathname === p.href;
            return (
              <TransitionLink
                key={p.href}
                href={p.href}
                aria-current={active ? "page" : undefined}
                className={`relative transition-colors duration-300 ${
                  active ? "" : dark ? "text-paper/70 hover:text-paper" : "text-ink/60 hover:text-ink"
                }`}
              >
                {t.nav[p.key]}
                {active && <span className="absolute -bottom-2 left-1/2 size-1 -translate-x-1/2 rounded-full bg-brand" />}
              </TransitionLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LangToggle tone={tone} className="hidden sm:flex" />
          <TransitionLink
            href="/contact/"
            data-magnetic
            className="hidden h-10 items-center rounded-full bg-brand px-5 text-sm font-medium text-ink transition-transform duration-200 hover:scale-[1.03] active:scale-95 md:flex"
          >
            {t.nav.book}
          </TransitionLink>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="flex h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-sm active:scale-95 md:hidden"
          >
            {t.nav.menu}
            <span aria-hidden className="flex flex-col gap-1">
              <span className={`block h-px w-4 transition-colors duration-500 ${dark ? "bg-paper" : "bg-ink"}`} />
              <span className={`block h-px w-4 transition-colors duration-500 ${dark ? "bg-paper" : "bg-ink"}`} />
            </span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.menu}
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[60] flex flex-col bg-ink/75 px-6 pt-6 pb-10 text-paper backdrop-blur-2xl backdrop-saturate-150 md:hidden"
          >
            <div className="flex items-center justify-between">
              <Logo tone="paper" className="mt-3 text-[26px]" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                autoFocus
                className="h-11 cursor-pointer rounded-full px-4 text-sm active:scale-95"
              >
                {t.nav.close}
              </button>
            </div>
            <nav aria-label="Mobile" className="mt-auto flex flex-col">
              {routes.map((r, i) => (
                <motion.div
                  key={r.href}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <TransitionLink
                    href={r.href}
                    onClick={() => setOpen(false)}
                    aria-current={pathname === r.href ? "page" : undefined}
                    className={`flex items-center gap-3 py-1 font-display text-[3.2rem] leading-[1.05] font-semibold tracking-tight active:opacity-60 ${
                      pathname === r.href ? "text-brand" : ""
                    }`}
                  >
                    {t.nav[r.key]}
                  </TransitionLink>
                </motion.div>
              ))}
            </nav>
            <div className="mt-10 flex items-center justify-between">
              <LangToggle className="liquid-glass-dark" />
              <TransitionLink
                href="/contact/"
                onClick={() => setOpen(false)}
                className="flex h-11 items-center rounded-full bg-brand px-5 text-sm font-medium text-ink active:scale-95"
              >
                {t.nav.book}
              </TransitionLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
