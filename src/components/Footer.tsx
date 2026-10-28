"use client";

import { Logo } from "./Logo";
import { useLang } from "./LangProvider";
import { contact } from "@/content/site";

export function Footer() {
  const { t } = useLang();

  return (
    <footer className="bg-ink px-4 pt-24 pb-8 text-paper md:px-8">
      <Logo tone="paper" className="text-[20vw] md:text-[12vw]" />
      <div className="mt-14 flex flex-col gap-6 border-t border-paper/15 pt-6 text-sm text-paper/70 md:flex-row md:items-center md:justify-between">
        <span>
          © 2026 Egu Studio. {t.footer.rights}
        </span>
        <div className="flex gap-6">
          <a href={`https://instagram.com/${contact.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-paper">
            Instagram
          </a>
          <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-paper">
            WhatsApp
          </a>
          <a href="#top" className="hover:text-paper">
            {t.footer.top}
          </a>
        </div>
      </div>
    </footer>
  );
}
