import { FactBadge } from "@/components/FactBadge";
import { PageHeader } from "@/components/PageHeader";
import { InfoRequestForm } from "@/components/forms/InfoRequestForm";
import { admissionDocuments, admissionFaq, admissionSteps } from "@/content/admissions";
import { copy, site } from "@/content/site";
import { units } from "@/content/units";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(copy.admissionsLabel, `Admissions à l'${site.name} : étapes, conditions, dossier et demande de renseignements.`, copy.admissionsPath);

export default function AdmissionsPage() {
  return (
    <>
      <PageHeader eyebrow={copy.admissionsLabel} title="Candidater, étape par étape">
        <p>Un parcours simple pour préparer votre candidature. Conditions, pièces, dates et frais officiels seront intégrés après validation par l&apos;institut.</p>
      </PageHeader>

      <div className="container-site">
        <section aria-labelledby="steps-title">
          <h2 id="steps-title" className="text-3xl">Les étapes</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-4">
            {admissionSteps.map((s, i) => (
              <li key={s.title} className="card relative p-6">
                <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-full bg-accent font-bold text-accent-ink">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-xl">{s.title}</h3>
                <p className="mt-2 text-sm text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="docs-title" className="card p-6 md:p-8">
            <h2 id="docs-title" className="text-2xl">
              Dossier à préparer
              <FactBadge status="demo" />
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
              {admissionDocuments.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <p className="mt-4 rounded-xl bg-surface-2 p-3 text-sm">Les documents se déposent à l&apos;institut : aucune pièce n&apos;est demandée en ligne.</p>
          </section>
          <section aria-labelledby="fees-title" className="card p-6 md:p-8">
            <h2 id="fees-title" className="text-2xl">
              Frais de scolarité
              <FactBadge status="demo" />
            </h2>
            <p className="mt-4 text-muted">
              La grille officielle (inscription, scolarité) sera présentée ici par formation, avec un
              simulateur de coût. Aucun montant n&apos;est affiché dans cette maquette tant qu&apos;il n&apos;a pas été validé.
            </p>
          </section>
        </div>

        <section aria-labelledby="faq-title" className="mt-16">
          <h2 id="faq-title" className="text-3xl">Questions fréquentes</h2>
          <div className="mt-6 divide-y divide-line border-y border-line">
            {admissionFaq.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                  {f.q}
                  <span aria-hidden="true" className="transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="demande" aria-label="Demande d'information" className="mt-16 max-w-3xl">
          <InfoRequestForm
            organisation={site.name}
            units={units.map((u) => ({ value: u.slug, label: u.name }))}
            unitLabel="Formation souhaitée"
            profils={copy.profils}
          />
        </section>
      </div>
    </>
  );
}
