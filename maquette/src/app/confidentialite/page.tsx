import { PageHeader } from "@/components/PageHeader";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Données personnelles", "Comment les données transmises via ce site sont utilisées et protégées.", "/confidentialite");

/** Model text: to be validated by the establishment (and its legal adviser) before publication. */
export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Confidentialité" title="Données personnelles">
        <p>Modèle de page à faire valider par {site.name} avant toute publication.</p>
      </PageHeader>
      <div className="container-site max-w-3xl space-y-8 text-lg">
        <section aria-labelledby="c1">
          <h2 id="c1" className="text-2xl">Données collectées</h2>
          <p className="mt-2 text-muted">Uniquement celles saisies dans le formulaire de demande : nom, téléphone, e-mail facultatif, formation et question. Aucune pièce justificative, aucune donnée de santé, aucun paiement.</p>
        </section>
        <section aria-labelledby="c2">
          <h2 id="c2" className="text-2xl">Finalité et durée</h2>
          <p className="mt-2 text-muted">Répondre à la demande. Conservation limitée (durée à fixer par l&apos;établissement, par exemple 12 mois), puis suppression.</p>
        </section>
        <section aria-labelledby="c3">
          <h2 id="c3" className="text-2xl">Étudiants et élèves</h2>
          <p className="mt-2 text-muted">Aucun nom, photo ou résultat individuel n&apos;est publié sans l&apos;accord écrit de la personne (ou de ses parents si elle est mineure).</p>
        </section>
        <section aria-labelledby="c4">
          <h2 id="c4" className="text-2xl">Vos droits</h2>
          <p className="mt-2 text-muted">Accès, rectification et suppression sur simple demande auprès de l&apos;établissement (contact à préciser), conformément à la loi ivoirienne n° 2013-450 ; réclamation possible auprès de l&apos;ARTCI.</p>
        </section>
      </div>
    </>
  );
}
