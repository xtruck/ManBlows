"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "./SmoothScroll";
import { useLang } from "./LangProvider";
import { normalize, routes } from "@/lib/routes";
import { motionMode } from "@/lib/motion";

type TransitionContext = { navigate: (href: string) => void };

const Ctx = createContext<TransitionContext>({ navigate: () => {} });

/**
 * Page changes run behind an ink curtain: it rises with the next page's name,
 * the route changes underneath, then it lifts away with a brand-yellow edge.
 */
export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = normalize(usePathname());
  const { t } = useLang();
  const curtain = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
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
      const route = routes.find((r) => r.href === target);
      if (label.current) label.current.textContent = route ? t.nav[route.key] : "";
      getLenis()?.stop();
      gsap
        .timeline()
        .set(el, { visibility: "visible", yPercent: 100 })
        .to(el, { yPercent: 0, duration: 0.6, ease: "expo.inOut" })
        .fromTo(label.current, { yPercent: 110 }, { yPercent: 0, duration: 0.45, ease: "power3.out" }, "-=0.3")
        .add(() => router.push(href));
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
    requestAnimationFrame(() => ScrollTrigger.refresh());
    gsap
      .timeline({ delay: 0.12 })
      .to(label.current, { yPercent: -110, duration: 0.35, ease: "power2.in" })
      .to(el, { yPercent: -100, duration: 0.75, ease: "expo.inOut" }, "-=0.15")
      .set(el, { visibility: "hidden", yPercent: 100 });
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [pathname]);

  return (
    <Ctx.Provider value={{ navigate }}>
      {children}
      <div
        ref={curtain}
        aria-hidden
        className="invisible fixed inset-0 z-[90] flex items-end bg-ink px-5 pb-12 text-paper md:px-10 md:pb-16"
      >
        <span className="absolute inset-x-0 top-0 h-1.5 bg-brand" />
        <div className="overflow-hidden">
          <span
            ref={label}
            className="block font-display text-[clamp(3.2rem,13vw,11rem)] leading-[0.95] font-semibold tracking-[-0.045em]"
          />
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
