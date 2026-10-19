"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { NavLink } from "@/content/types";

type Props = { name: string; shortName: string; nav: NavLink[]; cta: NavLink };

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Header({ name, shortName, nav, cta }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [panelTop, setPanelTop] = useState(64);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close the menu after navigation.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    // The demo banner may still be visible above the sticky header: start the panel right under the header.
    setPanelTop(Math.max(0, headerRef.current?.getBoundingClientRect().bottom ?? 64));
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="container-site flex h-16 items-center justify-between gap-4 md:h-20">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={`${name}, accueil`}>
          <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent font-display text-sm font-bold text-accent-ink">
            {shortName.slice(0, 4)}
          </span>
          <span className="line-clamp-2 font-display text-[0.95rem] font-semibold leading-tight sm:text-lg">{name}</span>
        </Link>

        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(pathname, l.href) ? "page" : undefined}
                  className="rounded-full px-3 py-2 text-sm font-semibold text-muted transition hover:text-ink aria-[current=page]:text-accent"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href={cta.href} className="btn btn-primary hidden min-h-11 px-5 text-sm sm:inline-flex">
            {cta.label}
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="btn btn-ghost min-h-11 px-4 text-sm lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden="true" className="relative block h-3 w-4">
              <span className={`absolute left-0 h-0.5 w-4 bg-current transition ${open ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 top-1.5 h-0.5 w-4 bg-current transition ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 h-0.5 w-4 bg-current transition ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
            </span>
            {open ? "Fermer" : "Menu"}
          </button>
        </div>
      </div>
    </header>

      {/* Outside <header>: its backdrop-filter would otherwise trap this fixed panel inside the header box. */}
      <div
        id="menu-mobile"
        ref={panelRef}
        hidden={!open}
        style={{ top: panelTop }}
        className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto border-t border-line bg-bg lg:hidden"
      >
        <nav aria-label="Navigation mobile" className="container-site py-6">
          <ul className="flex flex-col">
            {nav.map((l) => (
              <li key={l.href} className="border-b border-line">
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(pathname, l.href) ? "page" : undefined}
                  className="flex min-h-14 items-center justify-between font-display text-2xl aria-[current=page]:text-accent"
                >
                  {l.label}
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href={cta.href} onClick={() => setOpen(false)} className="btn btn-primary mt-8 w-full">
            {cta.label}
          </Link>
        </nav>
      </div>
    </>
  );
}
