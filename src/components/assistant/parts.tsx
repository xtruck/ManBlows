import type { ReactNode } from "react";

/** Small stroke icons for the assistant (24 x 24, drawn with currentColor). */
const paths = {
  photo: (
    <>
      <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  video: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 5v14M16 5v14M4 9h4M4 15h4M16 9h4M16 15h4" />
    </>
  ),
  design: (
    <>
      <path d="M4 20l1-4L16 5l3 3L8 19z" />
      <path d="M14 7l3 3" />
    </>
  ),
  web: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16" />
    </>
  ),
  sparkle: (
    <>
      <path d="M11 3l1.8 5.2L18 10l-5.2 1.8L11 17l-1.8-5.2L4 10l5.2-1.8z" />
      <path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
    </>
  ),
  question: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5M12 16.6v.1" />
    </>
  ),
  send: <path d="M12 19V5M5.5 11.5L12 5l6.5 6.5" />,
  restart: (
    <>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.3-5.4" />
      <path d="M4.5 4.5v4h4" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  chevron: <path d="M9.5 6l6 6-6 6" />,
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  whatsapp: (
    <>
      <path d="M4 20l1.3-4.1A8.5 8.5 0 1 1 8.3 19z" />
      <path d="M9.3 8.7c.3 2.3 2.4 4.4 4.7 4.8l1.3-1.2-1.9-1-.9.7c-.8-.3-1.6-1.1-1.9-1.9l.7-.9-1-1.9z" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof paths;

export function Icon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

/** The studio's round mark, in the yellow of the logo. */
export function Avatar({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-brand font-display font-bold text-ink ${
        size === "md" ? "size-10 text-xs ring-2 ring-paper/15" : "size-6 text-[8px]"
      }`}
    >
      EGC
    </span>
  );
}

/** Three bouncing dots while the assistant is working on an answer. */
export function TypingDots({ label }: { label: string }) {
  return (
    <span role="status" aria-label={label} className="flex h-5 items-center gap-1">
      <span className="assistant-dot size-1.5 rounded-full bg-ink/60" />
      <span className="assistant-dot size-1.5 rounded-full bg-ink/60" />
      <span className="assistant-dot size-1.5 rounded-full bg-ink/60" />
    </span>
  );
}

/** Where the visitor is in the request: five segments and a line of text. */
export function Progress({ step, total, label }: { step: number; total: number; label: string }) {
  return (
    <div className="mt-3">
      <div aria-hidden className="flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i < step ? "bg-brand" : "bg-paper/20"}`} />
        ))}
      </div>
      <p className="mt-1.5 text-[11px] text-paper/75">{label}</p>
    </div>
  );
}

/** The finished request, laid out like a small form. */
export function RequestCard({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="assistant-msg overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink/10">
      <p className="px-4 pt-3 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">{title}</p>
      <dl className="divide-y divide-ink/10 px-4 pb-1">
        {rows.map(([label, value]) => (
          <div key={label} className="flex gap-3 py-2 text-sm">
            <dt className="w-16 shrink-0 pt-0.5 text-xs text-muted">{label}</dt>
            <dd className="min-w-0 font-medium break-words">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
