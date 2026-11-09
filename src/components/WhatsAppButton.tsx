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
 * during the home page's 3D camera sequence and its tunnel, while the footer (which has the link) is on screen,
 * and whenever a video's playback controls sit under it.
 */
/** The button's corner of the screen (bottom right). */
const ZONE = { width: 260, height: 96 };

/** Height of a video's native control bar, along its bottom edge. */
const CONTROLS = 64;

/** True while an immersive scroll sequence (the home page's tunnel) fills the screen. */
function inSequence() {
  return [...document.querySelectorAll("[data-sequence]")].some((el) => {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight * 0.5 && r.bottom > window.innerHeight * 0.5;
  });
}

/** True when a video's playback controls overlap the button's corner. */
function videoBelow() {
  const top = window.innerHeight - ZONE.height;
  const left = window.innerWidth - ZONE.width;
  return [...document.querySelectorAll<HTMLVideoElement>("video[controls]")].some((v) => {
    const r = v.getBoundingClientRect();
    return r.bottom > top && r.bottom - CONTROLS < window.innerHeight && r.right > left;
  });
}

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
      setClear(pastHero && !footerInView && !videoBelow() && !inSequence());
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
    // A film's player only appears once it's tapped, without any scroll: check again then.
    document.addEventListener("play", schedule, true);
    document.addEventListener("loadedmetadata", schedule, true);
    update();
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("play", schedule, true);
      document.removeEventListener("loadedmetadata", schedule, true);
    };
  }, [pathname]);

  if (pathname === "/contact/") return null;

  const route = routes.find((r) => r.href === pathname);
  const page = route ? t.nav[route.key] : "";
  // Unknown pages (the 404) get the message without a page name rather than "(page )"
  const text = page ? t.whatsapp.message.replace("{page}", page) : t.whatsapp.messageGeneric;
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
