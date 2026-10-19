import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoImage } from "@/components/DemoImage";
import { FactBadge, FactText } from "@/components/FactBadge";
import { InfoRequestForm } from "@/components/forms/InfoRequestForm";
import { copy, site } from "@/content/site";
import { units } from "@/content/units";
import { pageMetadata } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return units.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const unit = units.find((u) => u.slug === slug);
  if (!unit) return {};
  return pageMetadata(unit.name, `${unit.name} (${unit.group}) : ${unit.summary}`, `${copy.unitsPath}/${unit.slug}`);
}

export default async function UnitPage({ params }: Params) {
  const { slug } = await params;
  const unit = units.find((u) => u.slug === slug);
  if (!unit) notFound();
  const maps = unit.mapsQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(unit.mapsQuery)}` : null;
  const facts = [
    { label: "Adresse", fact: unit.address },
    { label: "Contact", fact: unit.phone },
    { label: "Horaires d'accueil", fact: unit.hours },
    { label: "Durée", fact: unit.duration },
    { label: "Diplôme", fact: unit.diploma },
    { label: "Admission", fact: unit.admission },
  ].filter((f) => f.fact);

  return (
    <>
      <nav aria-label="Fil d'Ariane" className="container-site pt-8 text-sm text-muted">
        <ol className="flex flex-wrap gap-2">
          <li>
            <Link href="/" className="hover:underline">Accueil</Link> /
          </li>
          <li>
            <Link href={copy.unitsPath} className="hover:underline">{copy.unitsLabel}</Link> /
          </li>
          <li aria-current="page" className="text-ink">{unit.name}</li>
        </ol>
      </nav>

      <div className="container-site grid gap-10 pb-10 pt-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <p className="eyebrow">
            {unit.group} · {unit.kind}
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl">
            {unit.name}
            <FactBadge status={unit.status} source={unit.source} />
          </h1>
          <p className="mt-5 text-lg text-muted">{unit.summary}</p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Niveaux">
            {unit.levels.map((l) => (
              <li key={l} className="rounded-full bg-surface-2 px-3 py-1 text-sm font-semibold">
                {l}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative overflow-hidden rounded-[var(--radius-card)]">
          <DemoImage file={unit.image} alt={`Visuel de démonstration : ${unit.name}`} priority sizes="(min-width: 1024px) 45vw, 100vw" className="aspect-[4/3] w-full object-cover" />
        </div>
      </div>

      <div className="container-site grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-6">
          <section aria-labelledby="info-title" className="card p-6">
            <h2 id="info-title" className="text-2xl">En bref</h2>
            <dl className="mt-4 space-y-4">
              {facts.map(({ label, fact }) => (
                <div key={label}>
                  <dt className="text-sm font-bold uppercase tracking-wider text-muted">{label}</dt>
                  <dd className="mt-1">{fact ? <FactText fact={fact} /> : null}</dd>
                </div>
              ))}
            </dl>
            {maps ? (
              <a href={maps} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-6 w-full sm:w-auto">
                Itinéraire<span className="sr-only"> vers {unit.name} (nouvel onglet)</span>
              </a>
            ) : null}
          </section>
          <section aria-labelledby="points-title" className="card p-6">
            <h2 id="points-title" className="text-2xl">Contenu de la formation</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
              {unit.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            {unit.outcomes?.length ? (
              <>
                <h3 className="mt-6 text-xl">Débouchés possibles <span className="text-base font-normal text-muted">(exemples à valider)</span></h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
                  {unit.outcomes.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>
        </div>
        <section aria-label={`Demande d'information pour ${unit.name}`}>
          <InfoRequestForm
            organisation={site.name}
            units={units.map((u) => ({ value: u.slug, label: u.name }))}
            unitLabel={copy.unitSingular[0].toUpperCase() + copy.unitSingular.slice(1)}
            profils={copy.profils}
            defaultUnit={unit.slug}
          />
        </section>
      </div>
    </>
  );
}
