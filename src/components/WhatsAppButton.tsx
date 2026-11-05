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
      aria-label={t.whatsapp.label}
      inert={!shown}
      className={`fixed right-4 z-[55] flex h-14 items-center gap-2.5 rounded-full bg-[#25d366] pr-5 pl-4 text-sm font-semibold text-ink shadow-lg shadow-black/25 transition-[opacity,translate] duration-300 ease-out active:scale-95 motion-reduce:transition-opacity md:hidden ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
      style={{ bottom: "max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))" }}
    >
      <svg viewBox="0 0 24 24" aria-hidden className="size-6" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4.1A8 8 0 1 1 20 11.6z" />
        <path d="M9.2 8.4c0 3.2 2.6 5.8 5.8 5.8l1.1-1.2-1.8-1.1-.9.8a3.6 3.6 0 0 1-1.9-1.9l.8-.9-1.1-1.8z" />
      </svg>
      WhatsApp
    </a>
  );
}
