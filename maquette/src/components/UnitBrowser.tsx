"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import manifest from "@/content/images.generated.json";
import type { Unit } from "@/content/types";

type Entry = { width: number; height: number; blurDataURL: string };

/** Filterable list of establishments / programmes (two independent filters + text search). */
export function UnitBrowser({ units, basePath, groupLabel, kindLabel }: { units: Unit[]; basePath: string; groupLabel: string; kindLabel: string }) {
  const [group, setGroup] = useState("");
  const [kind, setKind] = useState("");
  const [query, setQuery] = useState("");
  const groups = useMemo(() => [...new Set(units.map((u) => u.group))], [units]);
  const kinds = useMemo(() => [...new Set(units.map((u) => u.kind))], [units]);
  const q = query.trim().toLowerCase();
  const visible = units.filter(
    (u) => (!group || u.group === group) && (!kind || u.kind === kind) && (!q || `${u.name} ${u.summary} ${u.levels.join(" ")}`.toLowerCase().includes(q)),
  );

  return (
    <>
      <div className="card grid gap-4 p-4 sm:grid-cols-3 sm:p-5">
        <label className="text-sm font-semibold">
          {groupLabel}
          <select className="field-input mt-2" value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="">Tous</option>
            {groups.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          {kindLabel}
          <select className="field-input mt-2" value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="">Tous</option>
            {kinds.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Rechercher
          <input type="search" className="field-input mt-2" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Mot-clé" />
        </label>
      </div>
      <p className="mt-4 text-sm text-muted" aria-live="polite">
        {visible.length} résultat{visible.length > 1 ? "s" : ""}
      </p>

      <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((u) => {
          const m = (manifest as Record<string, Entry>)[u.image];
          return (
            <li key={u.slug} className="card group relative flex flex-col overflow-hidden">
              <Image src={`/images/${u.image}`} alt="" width={m.width} height={m.height} placeholder="blur" blurDataURL={m.blurDataURL} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="aspect-[16/10] w-full object-cover" />
              <div className="flex flex-1 flex-col p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-accent">
                  {u.group} · {u.kind}
                </p>
                <h2 className="mt-2 text-2xl">
                  <Link href={`${basePath}/${u.slug}`} className="after:absolute after:inset-0 group-hover:underline">
                    {u.name}
                  </Link>
                </h2>
                <p className="mt-2 flex-1 text-muted">{u.summary}</p>
                <p className="mt-4 text-sm font-semibold">{u.levels.join(" · ")}</p>
              </div>
            </li>
          );
        })}
      </ul>
      {visible.length === 0 ? (
        <p className="mt-6">
          Aucun résultat.{" "}
          <button type="button" className="font-semibold text-accent underline" onClick={() => { setGroup(""); setKind(""); setQuery(""); }}>
            Réinitialiser les filtres
          </button>
        </p>
      ) : null}
    </>
  );
}
