"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Logo } from "./Logo";
import { useLang } from "./LangProvider";
import { getLenis } from "./SmoothScroll";
import type { Lang } from "@/i18n/dict";

function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div role="group" aria-label="Langue / Language" className={`flex rounded-full p-1 text-xs ${className}`}>
      {(["fr", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={`h-8 min-w-10 cursor-pointer rounded-full px-3 font-medium uppercase transition-colors duration-200 ${
            lang === l ? "bg-paper text-ink" : "text-paper/70 hover:text-paper"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function Nav() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#work", label: t.nav.work },
    { href: "#reel", label: t.nav.reel },
    { href: "#about", label: t.nav.about },
    { href: "#contact", label: t.nav.contact },
  ];

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
      <header className="glass-dark fixed inset-x-3 top-3 z-50 flex h-14 items-center justify-between rounded-full pr-2 pl-5 text-paper md:inset-x-8 md:top-5">
        <a href="#top" aria-label="Egu Studio" className="pt-2">
          <Logo tone="paper" className="text-[22px]" />
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-8 text-sm md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-paper/75 transition-colors duration-200 hover:text-paper">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LangToggle className="hidden sm:flex" />
          <a
            href="#contact"
            className="hidden h-10 items-center rounded-full bg-brand px-5 text-sm font-medium text-ink transition-transform duration-200 hover:scale-[1.03] md:flex"
          >
            {t.nav.book}
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="flex h-10 cursor-pointer items-center rounded-full px-4 text-sm md:hidden"
          >
            {t.nav.menu}
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
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[60] flex flex-col bg-ink px-6 pt-6 pb-10 text-paper md:hidden"
          >
            <div className="flex items-center justify-between">
              <Logo tone="paper" className="mt-3 text-[26px]" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                autoFocus
                className="h-11 cursor-pointer rounded-full px-4 text-sm"
              >
                {t.nav.close}
              </button>
            </div>
            <nav aria-label="Mobile" className="mt-auto flex flex-col gap-2">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="font-display text-6xl leading-[1.05] font-semibold tracking-tight"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="mt-10 flex items-center justify-between">
              <LangToggle className="glass-dark" />
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="flex h-11 items-center rounded-full bg-brand px-5 text-sm font-medium text-ink"
              >
                {t.nav.book}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
