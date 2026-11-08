"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "./LangProvider";
import { onIntroDone } from "@/lib/intro";
import { contact } from "@/content/site";

type ServiceKey = "photo" | "video" | "design" | "web";
type Step = "service" | "faq" | "kind" | "date" | "place" | "budget" | "budgetAmount" | "details" | "name" | "done";
type Msg = { from: "bot" | "me"; text: string };
type Brief = { service?: string; serviceKey?: ServiceKey; kind?: string; date?: string; place?: string; budget?: string; details?: string; name?: string };

const TEXT_STEPS: Step[] = ["date", "place", "budgetAmount", "details", "name"];

/**
 * Guided assistant: answers right away, asks one question at a time, then writes the full request
 * (service, type, date, place, budget, details, name) and opens WhatsApp with it, addressed to Egu.
 * No AI and no server: it runs in the page, so it is free and never invents a price or a date.
 */
export function Assistant() {
  const { t, lang } = useLang();
  const a = t.assistant;
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("service");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [brief, setBrief] = useState<Brief>({});
  const [input, setInput] = useState("");
  const [shownLang, setShownLang] = useState(lang);
  const list = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => onIntroDone(() => setReady(true)), []);

  // Start (or restart) the conversation, in the current language
  const reset = () => {
    setMsgs([{ from: "bot", text: a.hello }]);
    setBrief({});
    setStep("service");
    setInput("");
    setShownLang(lang);
  };
  const toggle = () => {
    if (!open && (msgs.length === 0 || shownLang !== lang)) reset();
    setOpen((o) => !o);
  };

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
    if (TEXT_STEPS.includes(step)) field.current?.focus();
  }, [msgs, step]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const say = (me: string, bot: string | string[], next: Step, patch: Brief = {}) => {
    setBrief((b) => ({ ...b, ...patch }));
    setMsgs((m) => [...m, { from: "me", text: me }, ...[bot].flat().map((text) => ({ from: "bot" as const, text }))]);
    setStep(next);
    setInput("");
  };

  const pickService = (key: string, label: string) => {
    if (key === "question") say(label, [a.faqIntro, ...a.faq.map((f) => `${f.q}\n${f.a}`), a.faqThen], "faq");
    else say(label, a.askKind, "kind", { service: label, serviceKey: key as ServiceKey });
  };

  const submitText = (value: string) => {
    const v = value.trim();
    if (!v) return;
    if (step === "date") say(v, a.askPlace, "place", { date: v });
    else if (step === "place") say(v, a.askBudget, "budget", { place: v });
    else if (step === "budgetAmount") say(v, a.askDetails, "details", { budget: v });
    else if (step === "details") say(v, a.askName, "name", { details: v });
    else if (step === "name") say(v, a.recap, "done", { name: v });
  };

  const f = a.fields;
  const lines = [
    a.msgIntro,
    brief.service && `• ${f.service} : ${brief.service}`,
    brief.kind && `• ${f.kind} : ${brief.kind}`,
    brief.date && `• ${f.date} : ${brief.date}`,
    brief.place && `• ${f.place} : ${brief.place}`,
    brief.budget && `• ${f.budget} : ${brief.budget}`,
    brief.details && `• ${f.details} : ${brief.details}`,
    brief.name && `• ${f.name} : ${brief.name}`,
  ].filter(Boolean) as string[];
  const waLink = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
  const textStep = TEXT_STEPS.includes(step);

  const chip = "rounded-full border border-ink/15 bg-white px-3.5 py-2 text-left text-sm text-ink transition-colors hover:border-ink/40 active:scale-95";

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="egc-assistant"
        className={`fixed bottom-4 left-4 z-[60] flex h-12 items-center gap-2 rounded-full bg-ink pr-4 pl-2.5 text-sm font-medium text-paper shadow-xl ring-1 shadow-black/30 ring-paper/15 transition-all duration-500 hover:scale-[1.03] active:scale-95 md:bottom-6 md:left-6 ${
          ready ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
      >
        <span aria-hidden className="flex size-7 items-center justify-center rounded-full bg-brand text-ink">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 5h16v11H9l-5 4z" />
          </svg>
        </span>
        <span className="hidden sm:inline">{a.open}</span>
        <span className="sm:hidden">{lang === "en" ? "Ask" : "Questions"}</span>
      </button>

      {open && (
        <div
          id="egc-assistant"
          role="dialog"
          aria-label={a.title}
          className="fixed inset-x-3 bottom-20 z-[61] flex max-h-[min(36rem,calc(100svh-7rem))] flex-col overflow-hidden rounded-3xl bg-paper text-ink shadow-2xl ring-1 shadow-black/40 ring-ink/10 sm:inset-x-auto sm:left-6 sm:w-[24rem] md:bottom-24"
        >
          <div className="flex items-center gap-3 bg-ink px-4 py-3 text-paper">
            <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand font-display text-xs font-bold text-ink">EGC</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{a.title}</p>
              <p className="truncate text-xs text-paper/65">{a.subtitle}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={a.close} className="flex size-9 items-center justify-center rounded-full hover:bg-paper/10">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div ref={list} aria-live="polite" data-lenis-prevent className="flex-1 space-y-2.5 overflow-y-auto overscroll-contain px-4 py-4">
            {msgs.map((m, i) => (
              <p
                key={i}
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                  m.from === "bot" ? "rounded-bl-md bg-white text-ink shadow-sm" : "ml-auto rounded-br-md bg-ink text-paper"
                }`}
              >
                {m.text}
              </p>
            ))}

            {/* Choices for the current step */}
            <div className="flex flex-wrap gap-2 pt-1">
              {step === "service" &&
                a.services.map((s) => (
                  <button key={s.key} type="button" className={chip} onClick={() => pickService(s.key, s.label)}>
                    {s.label}
                  </button>
                ))}
              {step === "faq" && (
                <button type="button" className={`${chip} bg-brand`} onClick={() => say(a.startRequest, a.hello, "service")}>
                  {a.startRequest}
                </button>
              )}
              {step === "kind" &&
                brief.serviceKey &&
                a.kinds[brief.serviceKey].map((k) => (
                  <button key={k} type="button" className={chip} onClick={() => say(k, a.askDate, "date", { kind: k })}>
                    {k}
                  </button>
                ))}
              {step === "budget" && (
                <>
                  <button type="button" className={chip} onClick={() => say(a.budgets[0], a.askDetails, "details", { budget: a.budgets[0] })}>
                    {a.budgets[0]}
                  </button>
                  <button type="button" className={chip} onClick={() => say(a.budgets[1], a.askBudgetAmount, "budgetAmount")}>
                    {a.budgets[1]}
                  </button>
                </>
              )}
              {step === "details" && (
                <button type="button" className={chip} onClick={() => say(a.skip, a.askName, "name")}>
                  {a.skip}
                </button>
              )}
              {step === "done" && (
                <div className="w-full space-y-2">
                  <p className="rounded-2xl bg-white p-3 text-xs leading-relaxed whitespace-pre-line text-ink/80 shadow-sm">{lines.slice(1).join("\n")}</p>
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex h-12 w-full items-center justify-center rounded-full bg-[#25d366] text-sm font-semibold text-ink shadow-md active:scale-95">
                    {a.send}
                  </a>
                  <button type="button" className="w-full text-center text-xs text-ink/60 underline-offset-4 hover:underline" onClick={reset}>
                    {a.restart}
                  </button>
                </div>
              )}
            </div>
          </div>

          {textStep && (
            <form
              className="flex gap-2 border-t border-ink/10 bg-paper p-3"
              onSubmit={(e) => {
                e.preventDefault();
                submitText(input);
              }}
            >
              <input
                ref={field}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={a.placeholder}
                aria-label={a.placeholder}
                maxLength={300}
                className="h-11 min-w-0 flex-1 rounded-full border border-ink/15 bg-white px-4 text-base outline-none focus:border-ink/40"
              />
              <button type="submit" className="h-11 shrink-0 rounded-full bg-ink px-4 text-sm font-medium text-paper active:scale-95">
                {a.submit}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
