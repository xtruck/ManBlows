"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Logo } from "./Logo";
import { useLang } from "./LangProvider";
import { getLenis } from "./SmoothScroll";
import { TransitionLink } from "./TransitionProvider";
import { normalize, routes } from "@/lib/routes";
import { useFocusTrap } from "@/lib/useFocusTrap";
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
          className={`h-8 min-w-10 cursor-pointer rounded-full px-3 font-medium uppercase transition-colors duration-300 ${
            lang === l ? "bg-paper text-ink" : "text-paper/70 hover:text-paper"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

const pages = routes.filter((r) => r.key !== "home");

/** Dark liquid-glass bar, readable over every section; full links from laptop width up. */
export function Nav() {
  const { t } = useLang();
  const pathname = normalize(usePathname());
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  useFocusTrap(menu, open);

  useEffect(() => {
    const lenis = getLenis();
    if (open) lenis?.stop();
    else lenis?.start();
    // Give focus back to the Menu button when the dialog closes.
    if (!open && wasOpen.current) menuButton.current?.focus();
    wasOpen.current = open;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="liquid-glass-dark glass-rim fixed inset-x-3 top-3 z-50 flex h-14 items-center justify-between gap-4 rounded-full pr-2 pl-5 text-paper md:inset-x-6 md:top-5 xl:inset-x-8">
        <TransitionLink href="/" aria-label="EGC Studio" className="shrink-0 pt-2">
          <Logo tone="paper" className="text-[22px]" />
        </TransitionLink>

        <nav aria-label={t.a11y.mainNav} className="hidden items-center gap-1 text-sm lg:flex">
          {pages.map((p) => {
            const active = pathname === p.href;
            return (
              <TransitionLink
                key={p.href}
                href={p.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-full px-4 py-2.5 transition-colors duration-300 ${
                  active ? "bg-paper/10 text-paper" : "text-paper/70 hover:bg-paper/5 hover:text-paper"
                }`}
              >
                {t.nav[p.key]}
                {active && <span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-brand" />}
              </TransitionLink>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <LangToggle className="hidden sm:flex" />
          <TransitionLink
            href="/contact/"
            data-magnetic
            className="btn-brand hidden h-10 items-center rounded-full px-5 text-sm font-medium whitespace-nowrap md:flex"
          >
            {t.nav.book}
          </TransitionLink>
          <button
            ref={menuButton}
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="flex h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-sm active:scale-95 lg:hidden"
          >
            {t.nav.menu}
            <span aria-hidden className="flex flex-col gap-1">
              <span className="block h-px w-4 bg-paper" />
              <span className="block h-px w-4 bg-paper" />
            </span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menu}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.menu}
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-ink/80 px-6 pt-6 pb-10 text-paper backdrop-blur-2xl backdrop-saturate-150 lg:hidden"
          >
            <span aria-hidden className="leak leak-yellow -top-24 -right-24 size-80" />
            <span aria-hidden className="leak leak-coral -bottom-32 -left-24 size-96" />
            <div className="relative flex items-center justify-between">
              <Logo tone="paper" className="mt-3 text-[26px]" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                autoFocus
                className="liquid-glass-dark h-11 cursor-pointer rounded-full px-5 text-sm active:scale-95"
              >
                {t.nav.close}
              </button>
            </div>
            <nav aria-label={t.a11y.mainNav} className="relative mt-auto flex flex-col">
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
            <div className="relative mt-10 flex items-center justify-between">
              <LangToggle className="liquid-glass-dark" />
              <TransitionLink
                href="/contact/"
                onClick={() => setOpen(false)}
                className="btn-brand flex h-11 items-center rounded-full px-5 text-sm font-medium"
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
