"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLang } from "./LangProvider";
import { Avatar, Icon, Progress, RequestCard, TypingDots, type IconName } from "./assistant/parts";
import { onIntroDone } from "@/lib/intro";
import { contact } from "@/content/site";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { useMedia } from "@/lib/useMedia";
import { normalize } from "@/lib/routes";

type ServiceKey = "photo" | "video" | "design" | "web";
type Step = "service" | "faq" | "describe" | "kind" | "date" | "place" | "details" | "name" | "done";
type Msg = { from: "bot" | "me"; text: string };
type Brief = { service?: string; serviceKey?: ServiceKey; kind?: string; date?: string; place?: string; details?: string; name?: string };

const TEXT_STEPS: Step[] = ["date", "place", "details", "name"];
// The steps shown in the progress bar, in order
const FLOW: Step[] = ["kind", "date", "place", "details", "name"];
// Optional: URL of the Cloudflare Worker (see worker/). Without it the AI features stay hidden.
const AI_URL = process.env.NEXT_PUBLIC_ASSISTANT_URL ?? "";
type AiMsg = { role: "user" | "assistant"; content: string };
type ApiBrief = { service?: string; kind?: string; date?: string; place?: string; details?: string; name?: string };
const SERVICE_KEYS: ServiceKey[] = ["photo", "video", "design", "web"];
// A gentle prompt, once per visit, where a visitor is most likely about to ask for something
const TEASER_PAGES: Record<string, "web" | "contact"> = { "/web/": "web", "/contact/": "contact" };
const TEASER_AFTER_MS = 20_000;
const TEASER_FOR_MS = 15_000;
const TEASER_KEY = "egc-assistant-teaser";
const norm = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/**
 * Guided assistant: answers right away, asks one question at a time, then writes the full request
 * (service, type, date, place, details, name) and opens WhatsApp with it, addressed to Egu.
 * It never talks about money or travel zones: Egu sets those himself in his quote.
 * The guided flow runs in the page (no server, free). When NEXT_PUBLIC_ASSISTANT_URL is set, the
 * visitor can also ask free questions (answered word by word) and describe a project in one
 * sentence, which pre-fills the request. Both go to a Cloudflare Workers AI Worker
 * (worker/index.mjs) that never discusses money; the guided flow keeps working if it is down.
 *
 * On phones it is a bottom sheet over a dimmed page (focus stays inside); on larger screens a
 * floating card beside the page. A human is always one tap away ("Écrire à Egu").
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
  const panel = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const wide = useMedia("(min-width: 768px)");
  const pathname = normalize(usePathname());
  const teaserTopic = TEASER_PAGES[pathname];
  const [teaserOn, setTeaserOn] = useState<string | null>(null); // the page the prompt is showing on
  const markTeaser = () => {
    try {
      sessionStorage.setItem(TEASER_KEY, "1");
    } catch {
      // private mode: the prompt may show again, that is all
    }
  };

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
    if (!open) {
      markTeaser();
      setTeaserOn(null);
    }
    setOpen((o) => !o);
  };

  // The prompt: after a while on the Web or Contact page, if the visitor has not met it or opened the assistant
  useEffect(() => {
    if (!ready || !teaserTopic || open) return;
    try {
      if (sessionStorage.getItem(TEASER_KEY)) return;
    } catch {
      // no storage: show it anyway
    }
    const show = setTimeout(() => {
      markTeaser();
      setTeaserOn(pathname);
    }, TEASER_AFTER_MS);
    const hide = setTimeout(() => setTeaserOn(null), TEASER_AFTER_MS + TEASER_FOR_MS);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [ready, teaserTopic, open, pathname]);

  // On a phone the sheet traps focus (it is modal); on a larger screen the page stays usable
  useFocusTrap(panel, open && !wide);

  // Focus moves into the panel when it opens and back to the launcher when it closes
  useEffect(() => {
    if (open) panel.current?.focus({ preventScroll: true });
    else if (wasOpen.current) launcher.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    // The start screen is read from the top; once the conversation runs, the newest message stays in view
    const atStart = step === "service" && msgs.length <= 1;
    list.current?.scrollTo({ top: atStart ? 0 : list.current.scrollHeight, behavior: atStart || asking ? "auto" : "smooth" });
    if (TEXT_STEPS.includes(step) || step === "describe") field.current?.focus();
  }, [msgs, step, asking, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // `me` is what the visitor said (null when it is already on screen)
  const say = (me: string | null, bot: string | string[], next: Step, patch: Brief = {}) => {
    setBrief((b) => ({ ...b, ...patch }));
    setMsgs((m) => [...m, ...(me === null ? [] : [{ from: "me" as const, text: me }]), ...[bot].flat().map((text) => ({ from: "bot" as const, text }))]);
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
  const rows = (b: Brief): [string, string][] =>
    (
      [
        [f.service, b.service],
        [f.kind, b.kind],
        [f.date, b.date],
        [f.place, b.place],
        [f.details, b.details],
        [f.name, b.name],
      ] as [string, string | undefined][]
    ).filter((r): r is [string, string] => !!r[1]);
  const lines = [a.msgIntro, ...rows(brief).map(([k, v]) => `• ${k} : ${v}`)];

  // "Describe my project": the AI fills in what the visitor already said; the flow asks only what is missing
  const describeProject = async (value: string) => {
    const v = value.trim();
    if (!v || asking || !AI_URL) return;
    const id = ++rid.current;
    setMsgs((m) => [...m, { from: "me", text: v }, { from: "bot", text: "" }]);
    setInput("");
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
    setMsgs((m) => m.slice(0, -1)); // the typing bubble
    if (found === null) return say(null, a.describeFail, "service");
    const key = SERVICE_KEYS.find((k) => k === found.service);
    const patch: Brief = {};
    if (key) {
      patch.serviceKey = key;
      patch.service = a.services.find((x) => x.key === key)?.label;
    }
    // Snap the type to one of the offered choices when it matches; otherwise keep the visitor's words
    if (found.kind) patch.kind = (key && a.kinds[key].find((k) => norm(k) === norm(found.kind ?? ""))) || found.kind;
    for (const field of ["date", "place", "details", "name"] as const) if (found[field]) patch[field] = found[field];
    const noted = rows(patch);
    if (noted.length === 0) return say(null, a.describeNone, "service");
    const next: Step = !key ? "service" : !patch.kind ? "kind" : !patch.date ? "date" : !patch.place ? "place" : !patch.details ? "details" : !patch.name ? "name" : "done";
    const asks: Record<string, string> = { service: a.askService, kind: a.askKind, date: a.askDate, place: a.askPlace, details: a.askDetails, name: a.askName, done: a.recap };
    say(null, [`${a.understood}\n${noted.map(([k, x]) => `• ${k} : ${x}`).join("\n")}`, asks[next]], next, patch);
  };

  const waLink = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
  const humanLink = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(a.humanMsg)}`;
  const textStep = TEXT_STEPS.includes(step);
  const aiStep = !!AI_URL && (step === "service" || step === "faq");
  const describeStep = !!AI_URL && step === "describe";
  const showForm = textStep || aiStep || describeStep;
  const started = msgs.length > 1; // after the first exchange the big start menu gives way to quick replies
  const flowIndex = FLOW.indexOf(step);
  const inFlow = flowIndex >= 0 || step === "done";
  const placeholder = textStep ? a.placeholder : describeStep ? a.describePlaceholder : a.askAi;
  const close = () => setOpen(false);
  const teaserVisible = !open && teaserTopic !== undefined && teaserOn === pathname;
  // From the prompt: the Web page goes straight to a website request, the Contact page to the start
  const openFromTeaser = () => {
    reset();
    if (teaserTopic === "web") {
      const label = a.services.find((x) => x.key === "web")?.label ?? "";
      say(label, a.askKind, "kind", { service: label, serviceKey: "web" });
    }
    markTeaser();
    setTeaserOn(null);
    setOpen(true);
  };

  const chip = "rounded-full bg-white px-3.5 py-2 text-left text-sm text-ink shadow-sm ring-1 ring-ink/10 transition hover:ring-ink/35 active:scale-95 disabled:opacity-50";
  const tile = "group flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left text-sm font-medium text-ink shadow-sm ring-1 ring-ink/10 transition hover:ring-ink/35 active:scale-[0.98] disabled:opacity-50";
  const label = "px-0.5 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase";
  const questionLabel = a.services.find((s) => s.key === "question")?.label ?? "";

  return (
    <>
      {!(open && !wide) && (
        <button
          ref={launcher}
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls="egc-assistant"
          className={`fixed bottom-4 left-4 z-[60] flex h-12 items-center gap-2 rounded-full bg-ink pr-4 pl-2.5 text-sm font-medium text-paper shadow-xl ring-1 shadow-black/30 ring-paper/15 transition-all duration-500 hover:scale-[1.03] active:scale-95 md:bottom-6 md:left-6 ${
            ready ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
          }`}
        >
          <span aria-hidden className="flex size-7 items-center justify-center rounded-full bg-brand text-ink">
            <Icon name="chat" className="size-4" />
          </span>
          <span className="hidden sm:inline">{a.open}</span>
          <span className="sm:hidden">{lang === "en" ? "Ask" : "Questions"}</span>
        </button>
      )}

      {teaserVisible && teaserTopic && (
        <div className="assistant-msg fixed bottom-20 left-4 z-[60] max-w-[min(17rem,calc(100vw-2rem))] md:bottom-24 md:left-6">
          <button type="button" onClick={openFromTeaser} className="block w-full rounded-2xl rounded-bl-md bg-white px-4 py-3 text-left text-ink shadow-xl ring-1 ring-ink/10 transition hover:ring-ink/30 active:scale-[0.98]">
            <span className="block pr-4 text-sm font-semibold">{a.teaser[teaserTopic].title}</span>
            <span className="mt-0.5 block text-xs leading-snug text-muted">{AI_URL ? a.teaser[teaserTopic].ai : a.teaser[teaserTopic].plain}</span>
          </button>
          <button type="button" onClick={() => setTeaserOn(null)} aria-label={a.teaser.dismiss} title={a.teaser.dismiss} className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-ink text-paper shadow-md ring-1 ring-paper/20 transition active:scale-90">
            <Icon name="close" className="size-3.5" />
          </button>
        </div>
      )}

      {open && (
        <>
          {/* Phones: the page dims behind the sheet, and a tap outside closes it */}
          <div aria-hidden onClick={close} className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px] md:hidden" />
          <div
            ref={panel}
            id="egc-assistant"
            role="dialog"
            aria-modal={!wide}
            aria-label={a.title}
            tabIndex={-1}
            className="assistant-panel fixed inset-x-0 bottom-0 z-[61] flex h-[min(42rem,calc(100svh-2rem))] flex-col overflow-hidden rounded-t-3xl bg-paper text-ink shadow-2xl ring-1 shadow-black/50 ring-ink/10 outline-none md:inset-x-auto md:bottom-24 md:left-6 md:h-[min(44rem,calc(100svh-8rem))] md:w-[25rem] md:rounded-3xl"
          >
            <header className="bg-ink px-4 pt-3.5 pb-3.5 text-paper">
              <div className="flex items-center gap-3">
                <Avatar />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-display text-[15px] leading-tight font-semibold">
                    <span className="truncate">{a.title}</span>
                    {AI_URL && <span className="shrink-0 rounded-full bg-brand px-1.5 py-0.5 text-[10px] leading-none font-bold text-ink">{a.aiBadge}</span>}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-paper/75">
                    <span aria-hidden className="size-1.5 rounded-full bg-emerald-400" />
                    {a.subtitle}
                  </p>
                </div>
                <button type="button" onClick={reset} aria-label={a.restart} title={a.restart} className="flex size-9 items-center justify-center rounded-full text-paper/80 transition hover:bg-paper/10 hover:text-paper">
                  <Icon name="restart" className="size-[18px]" />
                </button>
                <button type="button" onClick={close} aria-label={a.close} className="flex size-9 items-center justify-center rounded-full text-paper/80 transition hover:bg-paper/10 hover:text-paper">
                  <Icon name="close" className="size-[18px]" />
                </button>
              </div>
              {inFlow && <Progress step={step === "done" ? FLOW.length : flowIndex + 1} total={FLOW.length} label={step === "done" ? a.ready : a.progress.replace("{n}", String(flowIndex + 1)).replace("{total}", String(FLOW.length))} />}
            </header>

            <div ref={list} role="log" aria-label={a.title} aria-live="polite" aria-busy={asking} data-lenis-prevent className="flex-1 space-y-2 overflow-y-auto overscroll-contain px-4 py-4">
              {msgs.map((m, i) => {
                const bot = m.from === "bot";
                const firstOfRun = bot && (i === 0 || msgs[i - 1].from !== "bot");
                return (
                  <div key={i} className={`assistant-msg flex items-end gap-2 ${bot ? "" : "justify-end"}`}>
                    {bot && <span className="w-6 shrink-0">{firstOfRun && <Avatar size="sm" />}</span>}
                    <p
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                        bot ? `bg-white text-ink shadow-sm ring-1 ring-ink/5 ${firstOfRun ? "rounded-bl-md" : ""}` : "rounded-br-md bg-ink text-paper"
                      }`}
                    >
                      {m.text || <TypingDots label={a.typing} />}
                    </p>
                  </div>
                );
              })}

              {/* The start screen: three clear ways in */}
              {step === "service" && !started && (
                <div className="assistant-msg space-y-4 pt-2">
                  {AI_URL && (
                    <button type="button" disabled={asking} onClick={() => say(a.describeCta, a.describeAsk, "describe")} className="flex w-full items-center gap-3 rounded-2xl bg-brand p-3.5 text-left text-ink shadow-md transition hover:brightness-95 active:scale-[0.98] disabled:opacity-50">
                      <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-brand">
                        <Icon name="sparkle" className="size-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">{a.describeCta}</span>
                        <span className="block text-xs text-ink/75">{a.describeHint}</span>
                      </span>
                      <Icon name="chevron" className="size-4 shrink-0 text-ink/60" />
                    </button>
                  )}
                  <section aria-label={a.groupRequest} className="space-y-2">
                    <p className={label}>{a.groupRequest}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {a.services
                        .filter((s) => s.key !== "question")
                        .map((s) => (
                          <button key={s.key} type="button" disabled={asking} onClick={() => pickService(s.key, s.label)} className={tile}>
                            <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-paper-2 text-ink transition group-hover:bg-brand">
                              <Icon name={s.key as IconName} className="size-[18px]" />
                            </span>
                            {s.label}
                          </button>
                        ))}
                    </div>
                  </section>
                  <section aria-label={a.groupAsk} className="space-y-2">
                    <p className={label}>{a.groupAsk}</p>
                    <div className="space-y-1.5">
                      <button type="button" disabled={asking} onClick={() => pickService("question", questionLabel)} className={`${tile} !py-2.5 font-normal`}>
                        <Icon name="question" className="size-[18px] shrink-0 text-muted" />
                        <span className="min-w-0 flex-1">{questionLabel}</span>
                        <Icon name="chevron" className="size-4 shrink-0 text-muted" />
                      </button>
                      {AI_URL &&
                        a.starters.map((q) => (
                          <button key={q} type="button" disabled={asking} onClick={() => askAi(q)} className={`${tile} !py-2.5 font-normal`}>
                            <Icon name="chat" className="size-[18px] shrink-0 text-muted" />
                            <span className="min-w-0 flex-1">{q}</span>
                            <Icon name="chevron" className="size-4 shrink-0 text-muted" />
                          </button>
                        ))}
                    </div>
                  </section>
                </div>
              )}

              {/* Later in the conversation: the same choices, as compact quick replies */}
              {step === "service" && started && (
                <div className="assistant-msg flex flex-wrap gap-2 pt-1">
                  {AI_URL && (
                    <button type="button" disabled={asking} onClick={() => say(a.describeCta, a.describeAsk, "describe")} className={`${chip} flex items-center gap-1.5 !bg-brand font-medium !ring-0`}>
                      <Icon name="sparkle" className="size-4" />
                      {a.describeCta}
                    </button>
                  )}
                  {a.services.map((s) => (
                    <button key={s.key} type="button" disabled={asking} onClick={() => pickService(s.key, s.label)} className={chip}>
                      {s.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Choices for the other steps */}
              {step !== "service" && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {step === "faq" && (
                    <button type="button" className={`${chip} !bg-brand !ring-0 font-medium`} onClick={() => say(a.startRequest, a.hello, "service")}>
                      {a.startRequest}
                    </button>
                  )}
                  {step === "describe" && (
                    <button type="button" className={chip} onClick={() => say(a.back, a.hello, "service")}>
                      {a.back}
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
                    <div className="w-full space-y-3 pt-1">
                      <RequestCard title={a.yourRequest} rows={rows(brief)} />
                      <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25d366] text-sm font-semibold text-ink shadow-md transition hover:brightness-95 active:scale-95">
                        <Icon name="whatsapp" className="size-5" />
                        {a.send}
                      </a>
                      <button type="button" className="w-full text-center text-xs text-muted underline-offset-4 hover:underline" onClick={reset}>
                        {a.restart}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {showForm && (
              <form
                className="border-t border-ink/10 bg-paper px-3 pt-3 pb-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (textStep) submitText(input);
                  else if (describeStep) describeProject(input);
                  else askAi(input);
                }}
              >
                <div className="flex items-center gap-2 rounded-full bg-white pr-1.5 pl-4 shadow-sm ring-1 ring-ink/15 transition focus-within:ring-ink/40">
                  <input
                    ref={field}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={placeholder}
                    aria-label={placeholder}
                    maxLength={describeStep ? 500 : 300}
                    disabled={asking}
                    className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted/80 disabled:opacity-60"
                  />
                  <button type="submit" disabled={asking || !input.trim()} aria-label={a.submit} title={a.submit} className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition active:scale-90 disabled:bg-ink/25">
                    <Icon name="send" className="size-[18px]" />
                  </button>
                </div>
              </form>
            )}

            {/* Always visible: who answers, and the way to a human */}
            <footer className="flex items-center justify-between gap-3 border-t border-ink/10 bg-paper-2/70 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
              <p className="min-w-0 text-[11px] leading-snug text-muted">{AI_URL ? a.aiNote : a.trust}</p>
              <a href={humanLink} target="_blank" rel="noopener noreferrer" className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[11px] font-medium text-paper transition active:scale-95">
                <Icon name="whatsapp" className="size-3.5" />
                {a.human}
              </a>
            </footer>
          </div>
        </>
      )}
    </>
  );
}
