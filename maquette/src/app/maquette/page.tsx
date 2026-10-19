import { FactBadge } from "@/components/FactBadge";
import { PageHeader } from "@/components/PageHeader";
import { gallery } from "@/content/gallery";
import { menu } from "@/content/menu";
import { site } from "@/content/site";
import type { FactStatus } from "@/content/types";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("À propos de cette maquette", "Statut de la maquette, sources consultées et contenus restant à valider.", "/maquette");

export default function MaquettePage() {
  const c = site.contact;
  const rows: { label: string; value: string; status: FactStatus; source?: string }[] = [
    { label: "Adresse", value: c.address.value, status: c.address.status, source: c.address.source },
    { label: "Téléphone", value: c.phone?.value ?? "Non renseigné", status: c.phone?.status ?? "demo", source: c.phone?.source },
    { label: "WhatsApp", value: c.whatsapp?.value ?? "Non configuré", status: c.whatsapp?.status ?? "demo", source: c.whatsapp?.source },
    { label: "Horaires", value: c.hours.rows.map((r) => `${r.days} : ${r.hours}`).join(" / "), status: c.hours.status, source: c.hours.source },
    ...site.social.map((s) => ({ label: s.network, value: s.url, status: s.status, source: s.source })),
  ];
  const items = menu.flatMap((m) => m.items);
  const demoItems = items.filter((i) => i.status !== "confirme").length;

  return (
    <>
      <PageHeader eyebrow="Transparence" title="À propos de cette maquette">
        <p>
          Ce site est une <strong>proposition commerciale indépendante</strong> préparée par RealSpill pour présenter ce que
          pourrait être le site de {site.name}. Il n&apos;a été ni commandé ni validé par l&apos;établissement, et il n&apos;est pas publié.
        </p>
      </PageHeader>
      <div className="container-site space-y-10">
        <section aria-labelledby="status-title" className="card p-6 md:p-10">
          <h2 id="status-title" className="text-3xl">
            Statut des informations
          </h2>
          <ul className="mt-4 space-y-2 text-muted">
            <li>
              <FactBadge status="demo" /> contenu fictif écrit pour la démonstration ;
            </li>
            <li>
              <FactBadge status="public" /> information vue dans une source publique, non confirmée par l&apos;établissement.
            </li>
          </ul>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <caption className="sr-only">Informations de contact et leur statut</caption>
              <thead>
                <tr className="border-b border-line text-muted">
                  <th scope="col" className="py-2 pr-4">Élément</th>
                  <th scope="col" className="py-2 pr-4">Valeur affichée</th>
                  <th scope="col" className="py-2 pr-4">Statut</th>
                  <th scope="col" className="py-2">Source</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-b border-line align-top">
                    <th scope="row" className="py-3 pr-4 font-semibold">{r.label}</th>
                    <td className="break-all py-3 pr-4">{r.value}</td>
                    <td className="py-3 pr-4"><FactBadge status={r.status} /></td>
                    <td className="py-3 text-muted">{r.source ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="content-title" className="card p-6 md:p-10">
          <h2 id="content-title" className="text-3xl">
            Contenus de démonstration
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>
              Menu : {items.length} plats d&apos;exemple, dont {demoItems} non confirmés ; aucun prix n&apos;a été inventé.
            </li>
            <li>Galerie : {gallery.length} visuels générés, aucune photo de l&apos;établissement n&apos;est utilisée.</li>
            <li>Formulaires : fonctionnels pour la démonstration, mais aucune demande n&apos;est transmise ni enregistrée.</li>
            <li>WhatsApp : aucun numéro n&apos;est relié tant que l&apos;établissement ne l&apos;a pas confirmé.</li>
            <li>Référencement : la maquette demande aux moteurs de recherche de ne pas l&apos;indexer.</li>
          </ul>
        </section>
      </div>
    </>
  );
}
