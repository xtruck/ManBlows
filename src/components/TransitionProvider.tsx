"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { getLenis } from "./SmoothScroll";
import { useLang } from "./LangProvider";
import { normalize, routes } from "@/lib/routes";
import { motionMode } from "@/lib/motion";
import { refreshScrollTriggers } from "@/lib/scroll";

type TransitionContext = { navigate: (href: string) => void };

/** Resolves when the pictures on screen have loaded (or failed), or after `max` ms at the latest. */
function whenVisibleImagesReady(max: number) {
  return new Promise<void>((resolve) => {
    const pending = [...document.querySelectorAll<HTMLImageElement>("main img")].filter((img) => {
      if (img.complete) return false;
      const r = img.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
    });
    if (!pending.length) return resolve();
    let left = pending.length;
    const done = () => --left <= 0 && resolve();
    pending.forEach((img) => {
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    });
    window.setTimeout(resolve, max);
  });
}

/** Writes `text` into `el` as one span per letter, so the letters can rise one after the other. */
function spell(el: HTMLElement | null, text: string) {
  if (!el) return [];
  el.textContent = "";
  return [...text].map((ch) => {
    const span = document.createElement("span");
    span.className = "inline-block";
    span.textContent = ch === " " ? " " : ch;
    el.appendChild(span);
    return span;
  });
}

const Ctx = createContext<TransitionContext>({ navigate: () => {} });

/**
 * Page changes run behind four bands, one per craft (Photo, Vidéo, Design, Web). A yellow layer
 * rises first and the ink follows it, so each band arrives with a brand-yellow edge; the band of
 * the destination's craft lights up. The next page's name is spelled letter by letter, with its
 * number and a short line, and a bar fills while that page and its pictures load. Then the ink
 * lifts away and the yellow trails behind it, wiping once across the new page.
 */
export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = normalize(usePathname());
  const { t } = useLang();
  const curtain = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const meta = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const pending = useRef(false);

  const navigate = useCallback(
    (href: string) => {
      // A link may carry a hash (/travaux/#photos): compare the page only, keep the hash for the target
      const [path, hash] = href.split("#");
      const target = normalize(path || pathname);
      if (target === pathname) {
        if (hash) {
          const section = document.getElementById(hash);
          if (section) {
            // A section of this page (e.g. #offres): scroll to it smoothly
            const lenis = getLenis();
            if (lenis) lenis.scrollTo(section, { offset: -90 });
            else section.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            window.location.hash = hash; // a page filter (e.g. #photos): the page reacts to the hash itself
          }
          return;
        }
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (pending.current) return;
      const el = curtain.current;
      if (!el || motionMode() === "gentle") {
        router.push(href);
        return;
      }
      pending.current = true;
      const index = routes.findIndex((r) => r.href === target);
      const route = index >= 0 ? routes[index] : undefined;
      const letters = spell(label.current, route ? t.nav[route.key] : "");
      if (num.current) num.current.textContent = route ? `${String(index + 1).padStart(2, "0")} / ${String(routes.length).padStart(2, "0")}` : "";
      if (line.current) line.current.textContent = route ? t.routeLines[route.key] : "";
      // Light up the band of the destination's craft (none for Accueil, Travaux, À propos, Contact)
      const craft = route && "craft" in route ? route.craft : -1;
      el.querySelectorAll<HTMLElement>("[data-band-wrap]").forEach((b, i) => (b.dataset.active = String(i === craft)));
      getLenis()?.stop();
      gsap
        .timeline()
        .set(el, { visibility: "visible" })
        .set(bar.current, { scaleX: 0 })
        .fromTo(el.querySelectorAll("[data-band-lead]"), { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: "expo.inOut", stagger: 0.06 }, 0)
        .fromTo(el.querySelectorAll("[data-band]"), { yPercent: 100 }, { yPercent: 0, duration: 0.55, ease: "expo.inOut", stagger: 0.06 }, 0.08)
        .fromTo(letters, { yPercent: 115 }, { yPercent: 0, duration: 0.5, ease: "expo.out", stagger: 0.025 }, 0.42)
        .fromTo(meta.current, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, 0.5)
        // Most of the bar fills while the route changes; the rest once the new page is ready
        .to(bar.current, { scaleX: 0.7, duration: 0.6, ease: "power2.out" }, 0.45)
        .add(() => router.push(href), 0.62);
    },
    [pathname, router, t],
  );

  // Once the new route has rendered, start it at the top and lift the curtain.
  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    const el = curtain.current;
    if (!el) return;
    // Start at the top, or at the section named in the link (e.g. /#offres). The sections settle
    // a moment after the route changes, so the position is re-checked a few times (and we stop
    // as soon as the visitor scrolls on their own).
    const lenis = getLenis();
    const hashId = window.location.hash.slice(1);
    const timers: number[] = [];
    let last = -1;
    const align = (attempt: number) => {
      const anchor = hashId ? document.getElementById(hashId) : null;
      const top = anchor ? Math.max(0, anchor.getBoundingClientRect().top + window.scrollY - 90) : 0;
      if (last !== -1 && Math.abs(window.scrollY - last) > 40) return; // the visitor took over
      // Lenis still knows the previous page's height and would clamp the target to it
      lenis?.resize();
      window.scrollTo(0, top);
      lenis?.scrollTo(top, { immediate: true, force: true });
      last = top;
      if (anchor && attempt < 6) timers.push(window.setTimeout(() => align(attempt + 1), 350));
    };
    align(0);
    lenis?.start();
    requestAnimationFrame(() => refreshScrollTriggers());
    // Lift the curtain once the new page's visible pictures are in (at most 0.7 s), so nothing
    // pops in after it has gone
    let cancelled = false;
    let lift: gsap.core.Timeline | null = null;
    whenVisibleImagesReady(700).then(() => {
      if (cancelled) return;
      const letters = label.current ? [...label.current.children] : [];
      lift = gsap
        .timeline()
        .to(bar.current, { scaleX: 1, duration: 0.25, ease: "power2.inOut" })
        .to(letters, { yPercent: -115, duration: 0.32, ease: "power2.in", stagger: 0.015 }, 0.15)
        .to(meta.current, { autoAlpha: 0, y: -10, duration: 0.25, ease: "power2.in" }, 0.15)
        .to(el.querySelectorAll("[data-band]"), { yPercent: -100, duration: 0.7, ease: "expo.inOut", stagger: 0.06 }, 0.32)
        // The yellow follows the ink a beat later: one bright wipe across the new page
        .to(el.querySelectorAll("[data-band-lead]"), { yPercent: -100, duration: 0.7, ease: "expo.inOut", stagger: 0.06 }, 0.42)
        .set(el, { visibility: "hidden" });
    });
    return () => {
      cancelled = true;
      // Never leave the curtain down if the page changes again mid-way
      if (lift) lift.progress(1);
      else gsap.set(el, { visibility: "hidden" });
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [pathname]);

  return (
    <Ctx.Provider value={{ navigate }}>
      {children}
      <div ref={curtain} aria-hidden className="page-curtain invisible fixed inset-0 z-[90] flex items-end px-5 pb-14 text-paper md:px-10 md:pb-20">
        <div className="absolute inset-0 flex">
          {t.crafts.map((c, i) => (
            <div key={c.key} data-band-wrap data-active="false" className="relative h-full flex-1 overflow-hidden">
              <span data-band-lead className="absolute inset-0 block bg-brand" />
              <div data-band className="curtain-band absolute inset-x-0 top-1.5 bottom-0 bg-ink shadow-[-1px_0_0_rgb(255_255_255/0.06)]">
                <span className="curtain-tag absolute top-6 left-3 text-[10px] tracking-[0.2em] text-paper/40 uppercase md:left-6 md:text-xs">
                  0{i + 1} {c.name}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="relative flex w-full min-w-0 flex-col gap-4 md:gap-6">
          <div ref={meta} className="flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] text-paper/60 uppercase md:text-xs">
            <span ref={num} className="text-brand tabular-nums" />
            <span aria-hidden className="block h-px w-8 bg-paper/30" />
            <span ref={line} />
          </div>
          <div className="overflow-hidden pb-[0.06em]">
            <span
              ref={label}
              className="block font-display text-[clamp(3rem,12vw,11rem)] leading-[0.95] font-semibold tracking-[-0.045em] whitespace-nowrap"
            />
          </div>
          <span className="relative block h-[2px] w-full max-w-[28rem] bg-paper/15">
            <span ref={bar} className="absolute inset-0 block origin-left bg-brand" />
          </span>
        </div>
      </div>
    </Ctx.Provider>
  );
}

type TransitionLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & { href: string };

/** A Link that plays the curtain transition instead of an instant page swap. */
export function TransitionLink({ href, onClick, ...rest }: TransitionLinkProps) {
  const { navigate } = useContext(Ctx);
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(href);
      }}
    />
  );
}
