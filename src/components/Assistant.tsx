"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLang } from "./LangProvider";
import { Avatar, Icon, Progress, RequestCard, TypingDots, type IconName, type RequestSection } from "./assistant/parts";
import { onIntroDone } from "@/lib/intro";
import { contact } from "@/content/site";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { useMedia } from "@/lib/useMedia";
import { normalize } from "@/lib/routes";
import { onAssistantOpen, type AssistantOpen, type AssistantService } from "@/lib/assistant";

type ServiceKey = AssistantService;
type Mode = "service" | "faq" | "describe" | "ask" | "done";
type Msg = { from: "bot" | "me"; text: string };
type QId =
  | "kind"
  | "date"
  | "place"
  | "guests"
  | "photoCover"
  | "photoDelivery"
  | "videoType"
  | "videoLength"
  | "designItems"
  | "designMaterial"
  | "webType"
  | "webHave"
  | "webPages"
  | "name";
type Answers = Partial<Record<QId, string>>;
type Row = [string, string];

const SERVICE_KEYS: ServiceKey[] = ["photo", "video", "design", "web"];
/**
 * Every question the request can ask, in the order they come. Which ones a visitor sees depends on
 * the services chosen (see applies): the shared ones (project, date, place, people, name) once, then
 * at most two or three quick ones per service. multi: several chips can be ticked; optional: "Passer";
 * typed: the answer is usually written, so the field takes the focus.
 */
const QUESTIONS: { id: QId; group: "shared" | ServiceKey; multi?: boolean; optional?: boolean; typed?: boolean }[] = [
  { id: "kind", group: "shared" },
  { id: "date", group: "shared", typed: true },
  { id: "place", group: "shared", typed: true },
  { id: "guests", group: "shared", optional: true },
  { id: "photoCover", group: "photo", multi: true },
  { id: "photoDelivery", group: "photo", multi: true, optional: true },
  { id: "videoType", group: "video", multi: true },
  { id: "videoLength", group: "video", optional: true },
  { id: "designItems", group: "design", multi: true },
  { id: "designMaterial", group: "design", optional: true },
  { id: "webType", group: "web" },
  { id: "webHave", group: "web", multi: true, optional: true },
  { id: "webPages", group: "web", optional: true, typed: true },
  { id: "name", group: "shared", typed: true },
];
const Q = Object.fromEntries(QUESTIONS.map((q) => [q.id, q])) as Record<QId, (typeof QUESTIONS)[number]>;
// Photo and video happen on site: only they need a place and a number of people
const onSite = (s: ServiceKey[]) => s.includes("photo") || s.includes("video");
const applies = (id: QId, s: ServiceKey[]) => {
  const g = Q[id].group;
  if (g !== "shared") return s.includes(g);
  if (id === "kind") return s.some((k) => k !== "web"); // a website alone is described by its type
  if (id === "place" || id === "guests") return onSite(s);
  return true;
};
// The questions still to ask for these services, given what is already known
const planFor = (s: ServiceKey[], known: Answers) => QUESTIONS.filter((q) => applies(q.id, s) && !known[q.id]).map((q) => q.id);
const PER_SERVICE: Record<ServiceKey, QId[]> = {
  photo: ["photoCover", "photoDelivery"],
  video: ["videoType", "videoLength"],
  design: ["designItems", "designMaterial"],
  web: ["webType", "webHave", "webPages"],
};

// Optional: URL of the Cloudflare Worker (see worker/). Without it the AI features stay hidden.
const AI_URL = process.env.NEXT_PUBLIC_ASSISTANT_URL ?? "";
type AiMsg = { role: "user" | "assistant"; content: string };
type ApiBrief = {
  services?: unknown;
  service?: unknown; // older Workers answered a single service
  kind?: unknown;
  date?: unknown;
  place?: unknown;
  guests?: unknown;
  name?: unknown;
  details?: unknown;
  photo?: { cover?: unknown };
  video?: { type?: unknown; length?: unknown };
  design?: { items?: unknown };
  web?: { type?: unknown; pages?: unknown };
};
// A gentle prompt, once per visit, where a visitor is most likely about to ask for something
const TEASER_PAGES: Record<string, "web" | "contact"> = { "/web/": "web", "/contact/": "contact" };
const TEASER_AFTER_MS = 20_000;
const TEASER_FOR_MS = 15_000;
const TEASER_KEY = "egc-assistant-teaser";
const norm = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/**
 * Guided assistant: answers right away, asks one question at a time, then writes the full request
 * and opens WhatsApp with it, addressed to Egu.
 * The visitor picks one or several services (photo, video, graphic design, website). The questions
 * follow that choice: the shared ones once (project, date, place for on-site work, number of people,
 * name), then a couple of quick ones per service. The message and the recap card are grouped by service.
 * It never talks about money, budget or travel zones: Egu sets those himself in his quote.
 * The guided flow runs in the page (no server, free). When NEXT_PUBLIC_ASSISTANT_URL is set, the
 * visitor can also ask free questions (answered word by word) and describe a project in one
 * sentence, which pre-fills the request (several services included) so only what is missing is
 * asked. Both go to a Cloudflare Workers AI Worker (worker/index.mjs) that never discusses money;
 * the guided flow keeps working if it is down.
 *
 * It has no button of its own: the WhatsApp button and the WhatsApp calls to action open it
 * (lib/assistant.ts), so a WhatsApp message reaches Egu as a complete brief. A caller can pre-select
 * a service (the Web page pre-selects "Site web"); the visitor can still add others.
 *
 * On phones it is a bottom sheet over a dimmed page (focus stays inside); on larger screens a
 * floating card beside the page. A human is always one tap away ("Écrire à Egu").
 */
export function Assistant() {
  const { t, lang } = useLang();
  const a = t.assistant;
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("service");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [services, setServices] = useState<ServiceKey[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [note, setNote] = useState(""); // anything else the visitor said in a one-sentence description
  const [plan, setPlan] = useState<QId[]>([]);
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState<string[]>([]); // ticked chips of a multiple-choice question
  const [input, setInput] = useState("");
  const [shownLang, setShownLang] = useState(lang);
  const [asking, setAsking] = useState(false);
  const [aiHistory, setAiHistory] = useState<AiMsg[]>([]);
  const rid = useRef(0); // identifies the latest AI request, so a late answer never lands after a restart
  const list = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null); // what opened it, to give the focus back
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

  const serviceLabel = (k: ServiceKey) => a.services.find((x) => x.key === k)?.label ?? k;
  const labelsOf = (s: ServiceKey[]) => s.map(serviceLabel).join(", ");
  const questionOf = (id: QId, s: ServiceKey[]) => (id === "date" && !onSite(s) ? a.questions.deadline : a.questions[id]);
  const optionsOf = (id: QId, s: ServiceKey[]): readonly string[] => {
    if (id === "kind") return a.kinds.filter((k) => s.some((x) => (k.for as readonly string[]).includes(x))).map((k) => k.label);
    if (id === "date") return onSite(s) ? a.options.date : a.options.deadline;
    if (id === "place" || id === "webPages" || id === "name") return [];
    return a.options[id];
  };

  // Start (or restart) the conversation, in the current language, with a service already chosen when the caller knows it
  const reset = (preset?: ServiceKey) => {
    setMsgs([{ from: "bot", text: a.hello }, ...(preset ? [{ from: "bot" as const, text: a.preset.replace("{service}", serviceLabel(preset)) }] : [])]);
    setServices(preset ? [preset] : []);
    setAnswers({});
    setNote("");
    setPlan([]);
    setQi(0);
    setSel([]);
    setMode("service");
    setInput("");
    setAiHistory([]);
    rid.current++;
    setAsking(false);
    setShownLang(lang);
  };
  // Opened from the WhatsApp button or a call to action (lib/assistant.ts)
  const handle = useRef<(d: AssistantOpen) => void>(() => {});
  useEffect(() => {
    handle.current = ({ service, toggle }) => {
      if (toggle && open) return setOpen(false);
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (service && SERVICE_KEYS.includes(service)) reset(service);
      else if (msgs.length === 0 || shownLang !== lang) reset();
      markTeaser();
      setTeaserOn(null);
      setOpen(true);
    };
  });
  useEffect(() => onAssistantOpen((d) => handle.current(d)), []);

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

  // Focus moves into the panel when it opens and back to what opened it when it closes
  useEffect(() => {
    if (open) panel.current?.focus({ preventScroll: true });
    else if (wasOpen.current) opener.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  const current: QId | undefined = mode === "ask" ? plan[qi] : undefined;
  const started = msgs.some((m) => m.from === "me"); // after the first answer the big start menu gives way to quick replies

  useEffect(() => {
    // The start screen is read from the top; once the conversation runs, the newest message stays in view
    const atStart = mode === "service" && !started;
    list.current?.scrollTo({ top: atStart ? 0 : list.current.scrollHeight, behavior: atStart || asking ? "auto" : "smooth" });
    // Only questions usually answered in words take the focus (on a phone, the keyboard would hide the chips)
    if ((current && Q[current].typed) || mode === "describe") field.current?.focus();
  }, [msgs, mode, current, asking, open, started]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // `me` is what the visitor said (null when it is already on screen)
  const say = (me: string | null, bot: string | string[], next: Mode) => {
    setMsgs((m) => [...m, ...(me === null ? [] : [{ from: "me" as const, text: me }]), ...[bot].flat().map((text) => ({ from: "bot" as const, text }))]);
    setMode(next);
    setInput("");
    setSel([]);
  };

  // The questions for these services, minus what is already known; straight to the recap when nothing is missing
  const startPlan = (me: string | null, s: ServiceKey[], known: Answers, before: string[] = []) => {
    const p = planFor(s, known);
    setPlan(p);
    setQi(0);
    if (p.length === 0) say(me, [...before, a.recap], "done");
    else say(me, [...before, questionOf(p[0], s)], "ask");
  };

  const toggleService = (k: ServiceKey) => setServices((s) => (s.includes(k) ? s.filter((x) => x !== k) : SERVICE_KEYS.filter((x) => x === k || s.includes(x))));
  const confirmServices = () => {
    if (services.length === 0 || asking) return;
    startPlan(labelsOf(services), services, answers);
  };
  const openFaq = (labelText: string) => say(labelText, [a.faqIntro, ...a.faq.map((f) => `${f.q}\n${f.a}`), a.faqThen], "faq");

  // One answer (null: skipped), then the next question or the recap
  const answer = (value: string | null) => {
    if (!current) return;
    const v = value?.trim() ?? "";
    if (!v && !Q[current].optional) return;
    if (v) setAnswers((x) => ({ ...x, [current]: v }));
    const next = qi + 1;
    setQi(next);
    if (next >= plan.length) say(v || a.skip, a.recap, "done");
    else say(v || a.skip, questionOf(plan[next], services), "ask");
  };
  // A multiple-choice answer: the ticked chips, plus anything typed
  const multiValue = () => [...sel, input.trim()].filter(Boolean).join(", ");

  const submitText = () => {
    if (!current) return;
    if (Q[current].multi) answer(multiValue());
    else answer(input);
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

  // The request, grouped: services and project, one block per service, then the practical details
  const f = a.fields;
  const sectionsOf = (s: ServiceKey[], x: Answers, extra: string): RequestSection[] => {
    const rowsOf = (ids: QId[]) => ids.filter((id) => x[id]).map((id): Row => [id === "date" && !onSite(s) ? f.deadline : f[id], x[id] ?? ""]);
    const head: Row[] = [];
    if (s.length > 0) head.push([f.services, labelsOf(s)]);
    if (x.kind) head.push([f.kind, x.kind]);
    const practical = rowsOf(["date", "place", "guests", "name"]);
    if (extra) practical.push([f.details, extra]);
    return [
      { rows: head },
      ...s.map((k): RequestSection => ({ title: serviceLabel(k), icon: k as IconName, rows: rowsOf(PER_SERVICE[k]) })),
      { title: a.practical, icon: "info" as IconName, rows: practical },
    ].filter((sec) => sec.rows.length > 0);
  };
  const sections = sectionsOf(services, answers, note);
  const sep = lang === "fr" ? " : " : ": ";
  const bullets = (rows: Row[]) => rows.map(([k, v]) => `• ${k}${sep}${v}`);
  // Plain text for WhatsApp: a bullet per answer, a *bold* title per block
  const lines = [a.msgIntro, ...sections.flatMap((sec) => ["", ...(sec.title ? [`*${sec.title}*`] : []), ...bullets(sec.rows)])];

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
      found = data.brief && typeof data.brief === "object" ? data.brief : {};
    } catch {
      found = null;
    }
    if (rid.current !== id) return;
    setAsking(false);
    setMsgs((m) => m.slice(0, -1)); // the typing bubble
    if (found === null) return say(null, a.describeFail, "service");
    const named = [found.services, found.service].flat();
    const s = SERVICE_KEYS.filter((k) => named.includes(k));
    const known: Answers = {};
    // Snap a value to one of the offered choices when it matches; otherwise keep the visitor's words
    const put = (q: QId, raw: unknown) => {
      if (typeof raw !== "string" || !raw.trim()) return;
      const w = raw.trim().slice(0, 120);
      known[q] = optionsOf(q, s).find((o) => norm(o) === norm(w)) ?? w;
    };
    // A website alone has no "project" question: what the AI calls its type is the type of site
    put(s.length === 1 && s[0] === "web" ? "webType" : "kind", found.kind);
    put("date", found.date);
    put("place", found.place);
    put("guests", found.guests);
    put("name", found.name);
    put("photoCover", found.photo?.cover);
    put("videoType", found.video?.type);
    put("videoLength", found.video?.length);
    put("designItems", found.design?.items);
    put("webType", found.web?.type);
    put("webPages", found.web?.pages);
    const extra = typeof found.details === "string" ? found.details.trim().slice(0, 200) : "";
    setAnswers(known);
    setNote(extra);
    setServices(s);
    const noted = sectionsOf(s, known, extra);
    if (noted.length === 0) return say(null, a.describeNone, "service");
    const summary = `${a.understood}\n${noted.map((sec) => [...(sec.title ? [sec.title] : []), ...bullets(sec.rows)].join("\n")).join("\n")}`;
    if (s.length === 0) return say(null, [summary, a.askService], "service");
    startPlan(null, s, known, [summary]);
  };

  const waLink = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
  const humanLink = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(a.humanMsg)}`;
  const askStep = mode === "ask" && !!current;
  const aiStep = !!AI_URL && (mode === "service" || mode === "faq");
  const describeStep = !!AI_URL && mode === "describe";
  const showForm = askStep || aiStep || describeStep;
  const options = current ? optionsOf(current, services) : [];
  const total = Math.max(plan.length, 1);
  const inFlow = mode === "ask" || (mode === "done" && plan.length > 0);
  const placeholder = askStep ? (options.length > 0 ? a.orType : a.placeholder) : describeStep ? a.describePlaceholder : a.askAi;
  const close = () => setOpen(false);
  const teaserVisible = !open && teaserTopic !== undefined && teaserOn === pathname;
  // From the prompt: the Web page pre-selects a website, the Contact page goes to the start
  const openFromTeaser = () => {
    reset(teaserTopic === "web" ? "web" : undefined);
    markTeaser();
    setTeaserOn(null);
    setOpen(true);
  };

  const chip = "rounded-full bg-white px-3.5 py-2 text-left text-sm text-ink shadow-sm ring-1 ring-ink/10 transition hover:ring-ink/35 active:scale-95 disabled:opacity-50";
  const chipOn = "!bg-ink !text-paper !ring-ink";
  const tile = "group flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left text-sm font-medium text-ink shadow-sm ring-1 ring-ink/10 transition hover:ring-ink/35 active:scale-[0.98] disabled:opacity-50";
  const label = "px-0.5 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase";
  const questionLabel = a.services.find((s) => s.key === "question")?.label ?? "";
  const continueLabel = services.length > 1 ? `${a.continue} (${services.length})` : a.continue;
  const canGo = mode === "ask" && current && Q[current].multi ? sel.length > 0 || !!input.trim() : false;

  return (
    <>
      {teaserVisible && teaserTopic && (
        <div className="assistant-msg fixed right-3 bottom-20 z-[60] max-w-[min(17rem,calc(100vw-2rem))] md:right-6 md:bottom-24">
          <button type="button" onClick={openFromTeaser} className="block w-full rounded-2xl rounded-br-md bg-white px-4 py-3 text-left text-ink shadow-xl ring-1 ring-ink/10 transition hover:ring-ink/30 active:scale-[0.98]">
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
            className="assistant-panel fixed inset-x-0 bottom-0 z-[61] flex h-[min(42rem,calc(100svh-2rem))] flex-col overflow-hidden rounded-t-3xl bg-paper text-ink shadow-2xl ring-1 shadow-black/50 ring-ink/10 outline-none md:inset-x-auto md:right-6 md:bottom-24 md:h-[min(44rem,calc(100svh-8rem))] md:w-[25rem] md:rounded-3xl"
          >
            <header className="bg-ink px-4 pt-3.5 pb-3.5 text-paper">
              <div className="flex items-center gap-3">
                <Avatar />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-display text-[15px] leading-tight font-semibold">
                    <span className="min-w-0 leading-tight">{a.title}</span>
                    {AI_URL && <span className="shrink-0 rounded-full bg-brand px-1.5 py-0.5 text-[10px] leading-none font-bold text-ink">{a.aiBadge}</span>}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-paper/75">
                    <span aria-hidden className="size-1.5 rounded-full bg-brand" />
                    {a.subtitle}
                  </p>
                </div>
                <button type="button" onClick={() => reset()} aria-label={a.restart} title={a.restart} className="flex size-9 items-center justify-center rounded-full text-paper/80 transition hover:bg-paper/10 hover:text-paper">
                  <Icon name="restart" className="size-[18px]" />
                </button>
                <button type="button" onClick={close} aria-label={a.close} className="flex size-9 items-center justify-center rounded-full text-paper/80 transition hover:bg-paper/10 hover:text-paper">
                  <Icon name="close" className="size-[18px]" />
                </button>
              </div>
              {inFlow && (
                <Progress
                  step={mode === "done" ? total : qi + 1}
                  total={total}
                  label={mode === "done" ? a.ready : a.progress.replace("{n}", String(qi + 1)).replace("{total}", String(total))}
                />
              )}
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

              {/* The start screen: describe, pick one or several services, or ask a question */}
              {mode === "service" && !started && (
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
                    <p className={label}>
                      {a.groupRequest} <span className="font-normal tracking-normal normal-case">· {a.pickHint}</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {SERVICE_KEYS.map((k) => {
                        const on = services.includes(k);
                        return (
                          <button
                            key={k}
                            type="button"
                            aria-pressed={on}
                            disabled={asking}
                            onClick={() => toggleService(k)}
                            className={`${tile} ${on ? "!ring-2 !ring-ink" : ""}`}
                          >
                            <span aria-hidden className={`flex size-8 shrink-0 items-center justify-center rounded-full transition ${on ? "bg-brand text-ink" : "bg-paper-2 text-ink group-hover:bg-brand"}`}>
                              <Icon name={on ? "check" : (k as IconName)} className="size-[18px]" />
                            </span>
                            <span className="min-w-0">{serviceLabel(k)}</span>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      disabled={asking || services.length === 0}
                      onClick={confirmServices}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink text-sm font-semibold text-paper shadow-md transition active:scale-[0.98] disabled:bg-ink/25 disabled:shadow-none"
                    >
                      {continueLabel}
                      <Icon name="chevron" className="size-4" />
                    </button>
                  </section>
                  <section aria-label={a.groupAsk} className="space-y-2">
                    <p className={label}>{a.groupAsk}</p>
                    <div className="space-y-1.5">
                      <button type="button" disabled={asking} onClick={() => openFaq(questionLabel)} className={`${tile} !py-2.5 font-normal`}>
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
              {mode === "service" && started && (
                <div className="assistant-msg flex flex-wrap gap-2 pt-1">
                  {SERVICE_KEYS.map((k) => {
                    const on = services.includes(k);
                    return (
                      <button key={k} type="button" aria-pressed={on} disabled={asking} onClick={() => toggleService(k)} className={`${chip} flex items-center gap-1.5 ${on ? chipOn : ""}`}>
                        {on && <Icon name="check" className="size-4" />}
                        {serviceLabel(k)}
                      </button>
                    );
                  })}
                  <button type="button" disabled={asking || services.length === 0} onClick={confirmServices} className={`${chip} flex items-center gap-1 !bg-brand font-semibold !ring-0`}>
                    {continueLabel}
                    <Icon name="chevron" className="size-4" />
                  </button>
                  <span className="basis-full" aria-hidden />
                  {AI_URL && (
                    <button type="button" disabled={asking} onClick={() => say(a.describeCta, a.describeAsk, "describe")} className={`${chip} flex items-center gap-1.5`}>
                      <Icon name="sparkle" className="size-4" />
                      {a.describeCta}
                    </button>
                  )}
                  <button type="button" disabled={asking} onClick={() => openFaq(questionLabel)} className={chip}>
                    {questionLabel}
                  </button>
                </div>
              )}

              {/* Choices for the other steps */}
              {mode !== "service" && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {mode === "faq" && (
                    <button type="button" className={`${chip} !bg-brand font-medium !ring-0`} onClick={() => say(a.startRequest, a.hello, "service")}>
                      {a.startRequest}
                    </button>
                  )}
                  {mode === "describe" && (
                    <button type="button" className={chip} onClick={() => say(a.back, a.hello, "service")}>
                      {a.back}
                    </button>
                  )}
                  {askStep &&
                    current &&
                    options.map((o) => {
                      if (!Q[current].multi)
                        return (
                          <button key={o} type="button" className={chip} onClick={() => answer(o)}>
                            {o}
                          </button>
                        );
                      const on = sel.includes(o);
                      return (
                        <button key={o} type="button" aria-pressed={on} className={`${chip} flex items-center gap-1.5 ${on ? chipOn : ""}`} onClick={() => setSel((x) => (on ? x.filter((y) => y !== o) : [...x, o]))}>
                          {on && <Icon name="check" className="size-4" />}
                          {o}
                        </button>
                      );
                    })}
                  {askStep && current && Q[current].multi && (
                    <button type="button" disabled={!canGo} className={`${chip} flex items-center gap-1 !bg-brand font-semibold !ring-0`} onClick={() => answer(multiValue())}>
                      {a.continue}
                      <Icon name="chevron" className="size-4" />
                    </button>
                  )}
                  {askStep && current && Q[current].optional && (
                    <button type="button" className={`${chip} text-muted`} onClick={() => answer(null)}>
                      {a.skip}
                    </button>
                  )}
                  {mode === "done" && (
                    <div className="w-full space-y-3 pt-1">
                      <RequestCard title={a.yourRequest} sections={sections} />
                      <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25d366] text-sm font-semibold text-ink shadow-md transition hover:brightness-95 active:scale-95">
                        <Icon name="whatsapp" className="size-5" />
                        {a.send}
                      </a>
                      <button type="button" className="w-full text-center text-xs text-muted underline-offset-4 hover:underline" onClick={() => reset()}>
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
                  if (askStep) submitText();
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
                    aria-label={askStep && current ? questionOf(current, services) : placeholder}
                    maxLength={describeStep ? 500 : 300}
                    disabled={asking}
                    className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted/80 disabled:opacity-60"
                  />
                  <button type="submit" disabled={asking || !(input.trim() || (askStep && sel.length > 0))} aria-label={a.submit} title={a.submit} className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition active:scale-90 disabled:bg-ink/25">
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
