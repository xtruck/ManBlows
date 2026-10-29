"use client";

import { Logo } from "./Logo";
import { useLang } from "./LangProvider";
import { getLenis } from "./SmoothScroll";
import { TransitionLink } from "./TransitionProvider";
import { LightLeaks } from "./LightLeaks";
import { contact } from "@/content/site";
import { routes } from "@/lib/routes";

export function Footer() {
  const { t } = useLang();

  const toTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative isolate overflow-hidden bg-ink px-4 pt-24 pb-8 text-paper md:px-8">
      <LightLeaks className="opacity-40" />
      <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
        <Logo tone="paper" className="text-[20vw] md:text-[11vw]" />
        <nav aria-label={t.a11y.footerNav} className="grid grid-cols-2 gap-x-10 gap-y-3 text-lg md:pb-[1.5vw]">
          {routes.map((r) => (
            <TransitionLink key={r.href} href={r.href} className="py-2 text-paper/75 hover:text-paper active:opacity-60">
              {t.nav[r.key]}
            </TransitionLink>
          ))}
        </nav>
      </div>
      <div className="mt-14 flex flex-col gap-6 border-t border-paper/15 pt-6 text-sm text-paper/70 md:flex-row md:items-center md:justify-between">
        <span>© 2026 EGC Studio. {t.footer.rights}</span>
        <div className="flex gap-6">
          <a href={`https://instagram.com/${contact.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-paper">
            Instagram
          </a>
          <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-paper">
            WhatsApp
          </a>
          <button type="button" onClick={toTop} className="cursor-pointer hover:text-paper">
            {t.footer.top}
          </button>
        </div>
      </div>
    </footer>
  );
}
