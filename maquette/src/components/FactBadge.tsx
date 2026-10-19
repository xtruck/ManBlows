import type { Fact, FactStatus } from "@/content/types";

const LABELS: Record<FactStatus, string | null> = {
  demo: "Démo",
  public: "Source publique · à confirmer",
  confirme: null,
};

/** Visible marker for any detail the establishment has not confirmed yet. */
export function FactBadge({ status, source }: { status: FactStatus; source?: string }) {
  const label = LABELS[status];
  if (!label) return null;
  return (
    <span
      title={source}
      className={`ml-2 inline-block rounded-full border px-2 py-0.5 align-middle text-[0.68rem] font-semibold uppercase tracking-wide ${
        status === "demo" ? "border-highlight/60 text-highlight" : "border-accent/60 text-accent"
      }`}
    >
      {label}
    </span>
  );
}

export function FactText({ fact, className }: { fact: Fact; className?: string }) {
  return (
    <span className={className}>
      {fact.value}
      <FactBadge status={fact.status} source={fact.source} />
    </span>
  );
}
