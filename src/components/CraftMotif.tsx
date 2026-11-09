import type { CraftKey } from "@/content/crafts";

/**
 * The visual signature of each craft, drawn over an image or on its own:
 * photo = viewfinder corners and focus point, video = REC and a progress bar,
 * design = selection box with handles, web = browser bar.
 * Decorative only (aria-hidden). `meta` is the small technical readout in a corner.
 */
export function CraftMotif({ craft, meta = [], tone = "paper" }: { craft: CraftKey; meta?: readonly string[]; tone?: "paper" | "ink" }) {
  const line = tone === "paper" ? "border-paper/85" : "border-ink/70";
  const text = tone === "paper" ? "text-paper" : "text-ink";
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${text}`}>
      {craft === "photo" && (
        <>
          {["top-3 left-3 border-t-2 border-l-2", "top-3 right-3 border-t-2 border-r-2", "bottom-3 left-3 border-b-2 border-l-2", "bottom-3 right-3 border-b-2 border-r-2"].map((c) => (
            <span key={c} className={`absolute size-7 ${line} ${c}`} />
          ))}
          <span className="motif-focus absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-brand" />
        </>
      )}

      {craft === "video" && (
        <>
          <span className="absolute top-4 left-4 flex items-center gap-2 text-[11px] font-semibold tracking-wide">
            <span className="rec-dot size-2 rounded-full bg-brand" />
            REC
          </span>
          <span className="absolute inset-x-4 bottom-4 h-[3px] overflow-hidden rounded-full bg-paper/25">
            <span className="motif-progress block h-full w-full origin-left bg-brand" />
          </span>
        </>
      )}

      {craft === "design" && (
        <span className="absolute inset-5 border border-brand">
          {["-top-1 -left-1", "-top-1 -right-1", "-bottom-1 -left-1", "-bottom-1 -right-1", "-top-1 left-1/2 -translate-x-1/2", "-bottom-1 left-1/2 -translate-x-1/2", "top-1/2 -left-1 -translate-y-1/2", "top-1/2 -right-1 -translate-y-1/2"].map((c) => (
            <span key={c} className={`absolute size-2 border border-brand bg-paper ${c}`} />
          ))}
          <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 rounded bg-brand px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-ink tabular-nums">
            1080 × 1350
          </span>
        </span>
      )}

      {craft === "web" && (
        <span className="absolute inset-x-0 top-0 flex h-9 items-center gap-1.5 bg-ink/85 px-3 backdrop-blur">
          <span className="size-2.5 rounded-full bg-paper/70" />
          <span className="size-2.5 rounded-full bg-brand" />
          <span className="size-2.5 rounded-full bg-paper/40" />
          <span className="ml-2 flex h-5 flex-1 items-center rounded-full bg-paper/10 px-2.5 text-[10px] text-paper/70">
            <span className="truncate">votre-marque.ci</span>
            <span className="motif-caret ml-0.5 inline-block h-3 w-px bg-brand" />
          </span>
        </span>
      )}

      {meta.length > 0 && (
        <span
          className={`absolute flex gap-3 text-[10px] font-medium tracking-wide tabular-nums opacity-90 ${
            craft === "web" ? "bottom-3 left-3" : craft === "video" ? "top-4 right-4" : "bottom-4 left-4"
          } ${craft === "design" ? "hidden" : ""}`}
        >
          {meta.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </span>
      )}
    </div>
  );
}
