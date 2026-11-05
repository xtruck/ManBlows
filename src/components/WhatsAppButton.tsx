"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLang } from "./LangProvider";
import { contact } from "@/content/site";
import { onIntroDone } from "@/lib/intro";
import { normalize, routes } from "@/lib/routes";

/**
 * Floating WhatsApp button on phones: the studio's bookings come through WhatsApp, so it stays
 * one tap away. It opens a chat with a first message already written, in the visitor's language,
 * naming the page they came from.
 *
 * Hidden: on the contact page (it has its own WhatsApp form), until the intro has finished,
 * during the home page's 3D camera sequence, and while the footer (which has the link) is on screen.
 */
export function WhatsAppButton() {
  const { t } = useLang();
  const pathname = normalize(usePathname());
  const [introDone, setIntroDone] = useState(false);
  const [clear, setClear] = useState(false);

  useEffect(() => onIntroDone(() => setIntroDone(true)), []);

  useEffect(() => {
    let raf = 0;
    let footerInView = false;
    const update = () => {
      raf = 0;
      // On the home page, wait until the scroll-driven camera sequence is over.
      const hero = document.getElementById("top");
      const pastHero = !hero || hero.getBoundingClientRect().bottom < window.innerHeight * 0.5;
      setClear(pastHero && !footerInView);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const footer = document.querySelector("footer");
    const observer = new IntersectionObserver(([entry]) => {
      footerInView = entry.isIntersecting;
      schedule();
    });
    if (footer) observer.observe(footer);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  if (pathname === "/contact/") return null;

  const route = routes.find((r) => r.href === pathname);
  const page = route ? t.nav[route.key] : "";
  const text = t.whatsapp.message.replace("{page}", page);
  const shown = introDone && clear;

  return (
    <a
      href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noopener noreferrer"
      inert={!shown}
      // Same dark glass as the menu bar, so it reads as part of the site rather than a widget.
      className={`liquid-glass-dark glass-rim fixed right-3 z-[55] flex items-center gap-3 rounded-full py-1.5 pr-5 pl-1.5 text-paper transition-[opacity,translate,scale] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-95 motion-reduce:transition-opacity md:hidden ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
      style={{ bottom: "max(0.75rem, calc(env(safe-area-inset-bottom) + 0.5rem))" }}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35)]">
        <WhatsAppGlyph />
      </span>
      <span className="sr-only">{t.whatsapp.label}. </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[11px] tracking-wide text-paper/65">{t.whatsapp.note}</span>
        <span className="text-sm font-medium">{t.whatsapp.title}</span>
      </span>
    </a>
  );
}

/** WhatsApp mark: a speech bubble with a handset inside. */
function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-[22px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2.6 21.4Z" strokeWidth={1.8} />
      <path
        transform="translate(7.1 6.9) scale(0.43)"
        strokeWidth={3.4}
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
      />
    </svg>
  );
}
