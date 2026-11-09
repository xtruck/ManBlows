"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "./LangProvider";
import { onIntroDone } from "@/lib/intro";
import { contact } from "@/content/site";

type ServiceKey = "photo" | "video" | "design" | "web";
type Step = "service" | "faq" | "describe" | "kind" | "date" | "place" | "details" | "name" | "done";
type Msg = { from: "bot" | "me"; text: string };
type Brief = { service?: string; serviceKey?: ServiceKey; kind?: string; date?: string; place?: string; details?: string; name?: string };

const TEXT_STEPS: Step[] = ["date", "place", "details", "name"];
// Optional: URL of the Cloudflare Worker (see worker/). Without it the free-question box stays hidden.
const AI_URL = process.env.NEXT_PUBLIC_ASSISTANT_URL ?? "";
type AiMsg = { role: "user" | "assistant"; content: string };
type ApiBrief = { service?: string; kind?: string; date?: string; place?: string; details?: string; name?: string };
const SERVICE_KEYS: ServiceKey[] = ["photo", "video", "design", "web"];
const norm = (v: string) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

/**
 * Guided assistant: answers right away, asks one question at a time, then writes the full request
 * (service, type, date, place, details, name) and opens WhatsApp with it, addressed to Egu.
 * It never talks about money or travel zones: Egu sets those himself in his quote.
 * The guided flow runs in the page (no server, free). When NEXT_PUBLIC_ASSISTANT_URL is set, the
 * visitor can also ask free questions (answered word by word) and describe a project in one
 * sentence, which pre-fills the request. Both go to a Cloudflare Workers AI Worker
 * (worker/index.mjs) that never discusses money; the guided flow keeps working if it is down.
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
  const [asking, setAsking] = useState(false);
  const [aiHistory, setAiHistory] = useState<AiMsg[]>([]);
  const rid = useRef(0); // identifies the latest AI request, so a late answer never lands after a restart
  const list = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => onIntroDone(() => setReady(true)), []);

  // Start (or restart) the conversation, in the current language
  const reset = () => {
    setMsgs([{ from: "bot", text: a.hello }]);
    setBrief({});
    setStep("service");
    setInput("");
    setAiHistory([]);
    rid.current++;
    setAsking(false);
    setShownLang(lang);
  };
  const toggle = () => {
    if (!open && (msgs.length === 0 || shownLang !== lang)) reset();
    setOpen((o) => !o);
  };

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
    if (TEXT_STEPS.includes(step) || step === "describe") field.current?.focus();
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
    else if (step === "place") say(v, a.askDetails, "details", { place: v });
    else if (step === "details") say(v, a.askName, "name", { details: v });
    else if (step === "name") say(v, a.recap, "done", { name: v });
  };

  // A free question, answered by the AI Worker word by word; any failure points to WhatsApp instead
  const askAi = async (value: string) => {
    const v = value.trim();
    if (!v || asking || !AI_URL) return;
    const id = ++rid.current;
    let history: AiMsg[] = [...aiHistory, { role: "user" as const, content: v }].slice(-5);
    while (history.length > 1 && history[0].role === "assistant") history = history.slice(1);
    setMsgs((m) => [...m, { from: "me", text: v }, { from: "bot", text: "" }]);
    setInput("");
    setAsking(true);
    const show = (text: string) => {
      if (rid.current !== id) return;
      setMsgs((m) => {
        const c = [...m];
        c[c.length - 1] = { from: "bot", text };
        return c;
      });
    };
    try {
      const res = await fetch(AI_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "chat", stream: true, messages: history, lang }) });
      if (!res.ok) throw new Error(String(res.status));
      let reply = "";
      if ((res.headers.get("content-type") ?? "").includes("text/event-stream") && res.body) {
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        let shown = "";
        for (;;) {
          const { done, value: chunk } = await reader.read();
          if (done) break;
          buf += dec.decode(chunk, { stream: true });
          const parts = buf.split("\n");
          buf = parts.pop() ?? "";
          for (const part of parts) {
            if (!part.startsWith("data:")) continue;
            let ev: { t?: unknown; reply?: unknown; error?: unknown };
            try {
              ev = JSON.parse(part.slice(5));
            } catch {
              continue;
            }
            if (typeof ev.t === "string") {
              shown += ev.t;
              show(shown);
            } else if (typeof ev.reply === "string") reply = ev.reply;
            else if (ev.error) throw new Error("stream");
          }
        }
      } else {
        const data: { reply?: unknown } = await res.json();
        if (typeof data.reply === "string") reply = data.reply;
      }
      reply = reply.trim();
      if (!reply) throw new Error("empty");
      if (rid.current !== id) return;
      show(reply);
      setAiHistory([...history, { role: "assistant" as const, content: reply }].slice(-5));
    } catch {
      show(a.aiError);
    } finally {
      if (rid.current === id) setAsking(false);
    }
  };

  const f = a.fields;
  const lines = [
    a.msgIntro,
    brief.service && `• ${f.service} : ${brief.service}`,
    brief.kind && `• ${f.kind} : ${brief.kind}`,
    brief.date && `• ${f.date} : ${brief.date}`,
    brief.place && `• ${f.place} : ${brief.place}`,
    brief.details && `• ${f.details} : ${brief.details}`,
    brief.name && `• ${f.name} : ${brief.name}`,
  ].filter(Boolean) as string[];
  // "Describe my project": the AI fills in what the visitor already said; the flow asks only what is missing
  const describeProject = async (value: string) => {
    const v = value.trim();
    if (!v || asking || !AI_URL) return;
    const id = ++rid.current;
    setAsking(true);
    let found: ApiBrief | null = null;
    try {
      const res = await fetch(AI_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "brief", text: v, lang }) });
      if (!res.ok) throw new Error(String(res.status));
      const data: { brief?: ApiBrief } = await res.json();
      found = data.brief ?? {};
    } catch {
      found = null;
    }
    if (rid.current !== id) return;
    setAsking(false);
    if (found === null) return say(v, a.describeFail, "service");
    const key = SERVICE_KEYS.find((k) => k === found.service);
    const patch: Brief = {};
    if (key) {
      patch.serviceKey = key;
      patch.service = a.services.find((x) => x.key === key)?.label;
    }
    // Snap the type to one of the offered choices when it matches; otherwise keep the visitor's words
    if (found.kind) patch.kind = (key && a.kinds[key].find((k) => norm(k) === norm(found.kind ?? ""))) || found.kind;
    for (const field of ["date", "place", "details", "name"] as const) if (found[field]) patch[field] = found[field];
    const noted = [
      patch.service && `• ${f.service} : ${patch.service}`,
      patch.kind && `• ${f.kind} : ${patch.kind}`,
      patch.date && `• ${f.date} : ${patch.date}`,
      patch.place && `• ${f.place} : ${patch.place}`,
      patch.details && `• ${f.details} : ${patch.details}`,
      patch.name && `• ${f.name} : ${patch.name}`,
    ].filter(Boolean) as string[];
    if (noted.length === 0) return say(v, a.describeNone, "service");
    const next: Step = !key ? "service" : !patch.kind ? "kind" : !patch.date ? "date" : !patch.place ? "place" : !patch.details ? "details" : !patch.name ? "name" : "done";
    const asks: Record<string, string> = { service: a.askService, kind: a.askKind, date: a.askDate, place: a.askPlace, details: a.askDetails, name: a.askName, done: a.recap };
    say(v, [`${a.understood}\n${noted.join("\n")}`, asks[next]], next, patch);
  };

  const waLink = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
  const textStep = TEXT_STEPS.includes(step);
  const aiStep = !!AI_URL && (step === "service" || step === "faq");
  const describeStep = !!AI_URL && step === "describe";

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

          <div ref={list} aria-live="polite" aria-busy={asking} data-lenis-prevent className="flex-1 space-y-2.5 overflow-y-auto overscroll-contain px-4 py-4">
            {msgs.map((m, i) => (
              <p
                key={i}
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                  m.from === "bot" ? "rounded-bl-md bg-white text-ink shadow-sm" : "ml-auto rounded-br-md bg-ink text-paper"
                }`}
              >
                {m.text || "…"}
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
              {step === "service" && AI_URL && (
                <>
                  <button type="button" className={`${chip} bg-brand`} onClick={() => say(a.describeCta, a.describeAsk, "describe")}>
                    {a.describeCta}
                  </button>
                  {a.starters.map((q) => (
                    <button key={q} type="button" disabled={asking} className={`${chip} text-ink/70`} onClick={() => askAi(q)}>
                      {q}
                    </button>
                  ))}
                </>
              )}
              {step === "describe" && (
                <button type="button" className={chip} onClick={() => say(a.back, a.hello, "service")}>
                  {a.back}
                </button>
              )}
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

          {(textStep || aiStep || describeStep) && (
            <form
              className="border-t border-ink/10 bg-paper p-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (textStep) submitText(input);
                else if (describeStep) describeProject(input);
                else askAi(input);
              }}
            >
              {aiStep && <p className="px-1 pb-2 text-[11px] leading-snug text-ink/60">{a.aiNote}</p>}
              <div className="flex gap-2">
                <input
                  ref={field}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={textStep ? a.placeholder : describeStep ? a.describePlaceholder : a.askAi}
                  aria-label={textStep ? a.placeholder : describeStep ? a.describePlaceholder : a.askAi}
                  maxLength={describeStep ? 500 : 300}
                  disabled={asking}
                  className="h-11 min-w-0 flex-1 rounded-full border border-ink/15 bg-white px-4 text-base outline-none focus:border-ink/40 disabled:opacity-60"
                />
                <button type="submit" disabled={asking} className="h-11 shrink-0 rounded-full bg-ink px-4 text-sm font-medium text-paper active:scale-95 disabled:opacity-60">
                  {asking ? "…" : a.submit}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}
