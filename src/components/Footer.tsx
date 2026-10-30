"use client";

import { Logo } from "./Logo";
import { useLang } from "./LangProvider";
import { getLenis } from "./SmoothScroll";
import { TransitionLink } from "./TransitionProvider";
import { LightLeaks } from "./LightLeaks";
import { contact } from "@/content/site";
import { routes } from "@/lib/routes";
import { setMotion, useMotionMode } from "@/lib/motion";

/** Outline icons, drawn for this site. Decorative: the text next to them says what they are. */
const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" aria-hidden className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const WhatsAppIcon = () => (
  <Icon>
    <path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4.1A8 8 0 1 1 20 11.6z" />
    <path d="M9.2 8.4c0 3.2 2.6 5.8 5.8 5.8l1.1-1.2-1.8-1.1-.9.8a3.6 3.6 0 0 1-1.9-1.9l.8-.9-1.1-1.8z" />
  </Icon>
);
const MailIcon = () => (
  <Icon>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
    <path d="M4 7.5l8 6 8-6" />
  </Icon>
);
const InstagramIcon = () => (
  <Icon>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" />
  </Icon>
);
const TikTokIcon = () => (
  <Icon>
    <path d="M14.5 3.5v10.2a3.6 3.6 0 1 1-3.6-3.6" />
    <path d="M14.5 3.5c.3 2.3 1.9 3.9 4.5 4.2" />
  </Icon>
);
const PinIcon = () => (
  <Icon>
    <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" />
    <circle cx="12" cy="11" r="2.2" />
  </Icon>
);

const title = "text-xs font-medium tracking-[0.2em] text-paper/50 uppercase";
const link = "block py-1.5 text-paper/80 transition-colors hover:text-paper active:opacity-60";

export function Footer() {
  const { t } = useLang();
  const mode = useMotionMode();
  const f = t.footer;

  const toTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const services = [
    { label: t.disciplines.items[0].name, href: "/travaux/#photos" },
    { label: t.disciplines.items[1].name, href: "/films/" },
    { label: t.disciplines.items[2].name, href: "/travaux/#design" },
    { label: f.offers, href: "/#offres" },
  ];

  const reach = [
    { icon: <WhatsAppIcon />, label: contact.whatsappLabel, href: `https://wa.me/${contact.whatsapp}`, external: true },
    { icon: <MailIcon />, label: contact.email, href: `mailto:${contact.email}`, external: false },
    { icon: <InstagramIcon />, label: `@${contact.instagram}`, href: `https://instagram.com/${contact.instagram}`, external: true },
    { icon: <TikTokIcon />, label: `@${contact.tiktok}`, href: `https://www.tiktok.com/@${contact.tiktok}`, external: true },
  ];

  return (
    <footer className="relative isolate overflow-hidden bg-ink px-4 pt-20 pb-6 text-paper md:px-8 md:pt-28">
      <LightLeaks className="opacity-40" />

      <div className="grid gap-14 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <Logo tone="paper" className="text-[3.4rem]" />
          <p className="mt-8 max-w-[32ch] text-xl leading-snug text-paper/90">{f.tagline}</p>
          <p className="mt-3 text-sm text-paper/55">{f.descriptor}</p>
          <TransitionLink
            href="/contact/"
            data-magnetic
            className="btn-brand mt-8 inline-flex h-12 items-center rounded-full px-7 text-sm font-medium"
          >
            {t.nav.book}
          </TransitionLink>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:col-span-7 md:grid-cols-[1fr_1fr_1.5fr]">
          <nav aria-label={f.explore}>
            <h2 className={title}>{f.explore}</h2>
            <ul className="mt-4">
              {routes.map((r) => (
                <li key={r.href}>
                  <TransitionLink href={r.href} className={link}>
                    {t.nav[r.key]}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={f.services}>
            <h2 className={title}>{f.services}</h2>
            <ul className="mt-4">
              {services.map((s) => (
                <li key={s.href}>
                  <TransitionLink href={s.href} className={link}>
                    {s.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 md:col-span-1">
            <h2 className={title}>{t.nav.contact}</h2>
            <ul className="mt-4">
              {reach.map((r) => (
                <li key={r.href}>
                  <a
                    href={r.href}
                    {...(r.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group flex items-center gap-3 py-1.5 text-paper/80 transition-colors hover:text-paper"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-paper/20 transition-colors group-hover:border-brand group-hover:text-brand">
                      {r.icon}
                    </span>
                    <span className="min-w-0 break-words">{r.label}</span>
                  </a>
                </li>
              ))}
              <li className="flex items-center gap-3 py-1.5 text-paper/55">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-paper/10">
                  <PinIcon />
                </span>
                <span>{f.location}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* The signature, big, like the mark on a camera body */}
      <div className="mt-16 md:mt-24">
        <Logo tone="paper" className="text-[22vw] md:text-[13vw]" />
      </div>

      <div className="mt-10 flex flex-col gap-5 border-t border-paper/15 pt-6 text-sm text-paper/65 md:flex-row md:items-center md:justify-between">
        <span>
          © 2026 EGC Studio. {f.rights}
        </span>
        <div className="flex items-center justify-between gap-6 md:justify-end">
          {/* Visitors can turn the full animations on or off on this device (see lib/motion.ts) */}
          <button
            type="button"
            aria-pressed={mode === "full"}
            onClick={() => setMotion(mode !== "full")}
            className="cursor-pointer transition-colors hover:text-paper"
          >
            {mode === "full" ? t.motion.on : t.motion.off}
          </button>
          <button
            type="button"
            onClick={toTop}
            aria-label={f.top}
            className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-paper/25 text-paper transition-colors hover:border-brand hover:text-brand active:scale-95"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M6 11l6-6 6 6" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
