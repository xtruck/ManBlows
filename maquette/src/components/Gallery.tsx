"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import manifest from "@/content/images.generated.json";
import type { GalleryCategory, GalleryImage } from "@/content/types";

const FILTERS: { id: GalleryCategory | "tout"; label: string }[] = [
  { id: "tout", label: "Tout" },
  { id: "plats", label: "Plats" },
  { id: "ambiance", label: "Ambiance" },
  { id: "evenements", label: "Événements" },
];

type Entry = { width: number; height: number; blurDataURL: string };
const meta = (file: string) => (manifest as Record<string, Entry>)[file];

export function Gallery({ images }: { images: GalleryImage[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("tout");
  const [index, setIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const visible = filter === "tout" ? images : images.filter((i) => i.category === filter);
  const available = FILTERS.filter((f) => f.id === "tout" || images.some((i) => i.category === f.id));

  function open(i: number) {
    setIndex(i);
    dialogRef.current?.showModal();
  }
  const step = (delta: number) => setIndex((i) => (i + delta + visible.length) % visible.length);
  const current = visible[index];

  return (
    <>
      <div role="group" aria-label="Filtrer la galerie" className="flex flex-wrap gap-2">
        {available.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className="min-h-11 rounded-full border border-line px-4 text-sm font-semibold transition aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-accent-ink"
          >
            {f.label}
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {visible.length} visuels affichés
      </p>

      <ul className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {visible.map((img, i) => {
          const m = meta(img.file);
          return (
            <li key={img.file} className="mb-4 break-inside-avoid">
              <button type="button" onClick={() => open(i)} className="group block w-full overflow-hidden rounded-[var(--radius-card)] text-left">
                <Image
                  src={`/images/${img.file}`}
                  alt={img.alt}
                  width={m.width}
                  height={m.height}
                  placeholder="blur"
                  blurDataURL={m.blurDataURL}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-auto w-full transition duration-500 group-hover:scale-[1.03]"
                />
                <span className="sr-only">Agrandir : </span>
                <span className="block bg-surface px-4 py-3 text-sm text-muted">{img.caption}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label="Visionneuse d'images"
        className="m-auto max-h-[92vh] w-[min(96vw,70rem)] rounded-2xl bg-bg p-0 text-ink backdrop:bg-black/85"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
      >
        {current ? (
          <figure>
            <Image
              src={`/images/${current.file}`}
              alt={current.alt}
              width={meta(current.file).width}
              height={meta(current.file).height}
              sizes="96vw"
              className="max-h-[75vh] w-full object-contain"
            />
            <figcaption className="flex flex-wrap items-center justify-between gap-3 p-4">
              <span>
                {current.caption} <span className="text-muted">({index + 1}/{visible.length})</span>
              </span>
              <span className="flex gap-2">
                <button type="button" className="btn btn-ghost min-h-11 px-4" onClick={() => step(-1)} aria-label="Image précédente">
                  ←
                </button>
                <button type="button" className="btn btn-ghost min-h-11 px-4" onClick={() => step(1)} aria-label="Image suivante">
                  →
                </button>
                <button type="button" className="btn btn-primary min-h-11 px-4" onClick={() => dialogRef.current?.close()}>
                  Fermer
                </button>
              </span>
            </figcaption>
          </figure>
        ) : null}
      </dialog>
    </>
  );
}
