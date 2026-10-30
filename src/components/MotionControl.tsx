"use client";

import { useEffect, useState } from "react";
import { useLang } from "./LangProvider";
import { setMotion, useMotionChoice, useMotionMode, useOsWantsLess } from "@/lib/motion";

/**
 * Keeps <html data-motion> in step with the animation mode, and, when the device asks for
 * fewer animations and the visitor has not chosen yet, explains why the site looks calm and
 * offers one tap to turn the animations on. The choice is remembered (see lib/motion.ts).
 */
export function MotionControl() {
  const { t } = useLang();
  const mode = useMotionMode();
  const chosen = useMotionChoice();
  const osWantsLess = useOsWantsLess();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.motion = mode;
  }, [mode]);

  if (!osWantsLess || chosen || dismissed) return null;

  return (
    <div
      role="region"
      aria-label={t.motion.notice}
      className="liquid-glass-dark fixed right-3 bottom-3 left-3 z-[75] flex flex-col gap-3 rounded-2xl p-4 text-sm text-paper sm:right-auto sm:max-w-sm"
    >
      <p className="leading-snug">{t.motion.notice}</p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMotion(true)}
          className="btn-brand h-10 cursor-pointer rounded-full px-5 text-sm font-medium"
        >
          {t.motion.enable}
        </button>
        <button
          type="button"
          onClick={() => {
            setMotion(false);
            setDismissed(true);
          }}
          className="h-10 cursor-pointer rounded-full px-4 text-paper/75 hover:text-paper"
        >
          {t.motion.keep}
        </button>
      </div>
    </div>
  );
}
