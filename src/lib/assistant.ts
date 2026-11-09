// Opens the request assistant (components/Assistant.tsx) from anywhere: the WhatsApp button and the
// "write to us" calls to action go through its questions first, so Egu gets a complete brief.

export type AssistantService = "photo" | "video" | "design" | "web";
export type AssistantOpen = { service?: AssistantService; toggle?: boolean };

const EVENT = "egc:assistant";

// The assistant loads after the page: a request made before it is listening waits here
let listeners = 0;
let pending: AssistantOpen | null = null;

export function openAssistant(detail: AssistantOpen = {}) {
  if (listeners === 0) pending = detail;
  else window.dispatchEvent(new CustomEvent<AssistantOpen>(EVENT, { detail }));
}

export function onAssistantOpen(fn: (detail: AssistantOpen) => void) {
  const handler = (e: Event) => fn((e as CustomEvent<AssistantOpen>).detail ?? {});
  window.addEventListener(EVENT, handler);
  listeners++;
  if (pending) {
    const d = pending;
    pending = null;
    fn(d);
  }
  return () => {
    window.removeEventListener(EVENT, handler);
    listeners--;
  };
}
