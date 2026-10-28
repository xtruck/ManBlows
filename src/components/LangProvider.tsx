"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";
import { dict, type Dict, type Lang } from "@/i18n/dict";

type LangContext = { lang: Lang; t: Dict; setLang: (lang: Lang) => void };

const Ctx = createContext<LangContext | null>(null);

// The chosen language lives in localStorage; the server always renders French.
const KEY = "egu-lang";
const listeners = new Set<() => void>();
let memory: Lang = "fr"; // fallback when storage is blocked

function readLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "fr" || saved === "en") return saved;
  } catch {}
  return memory;
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, readLang, () => "fr" as Lang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    memory = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {}
    listeners.forEach((fn) => fn());
  }, []);

  return <Ctx.Provider value={{ lang, t: dict[lang], setLang }}>{children}</Ctx.Provider>;
}

export function useLang() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
