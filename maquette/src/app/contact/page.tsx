import { FactBadge, FactText } from "@/components/FactBadge";
import { PageHeader } from "@/components/PageHeader";
import { InfoRequestForm } from "@/components/forms/InfoRequestForm";
import { copy, site } from "@/content/site";
import { units } from "@/content/units";
import { telHref } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Contact & accès", `Adresse, itinéraire et demande de renseignements : ${site.name}, ${site.district}.`, "/contact");

export default function ContactPage() {
  const c = site.contact;
  const tel = telHref(c.phone);
  return (
    <>
      <PageHeader eyebrow="Contact" title="Nous trouver, nous écrire">
        <p>Une question sur une formation ou les admissions ? Envoyez votre demande : l&apos;institut vous recontacte.</p>
      </PageHeader>
      <div className="container-site grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section aria-labelledby="where-title" className="card p-6 md:p-8">
          <h2 id="where-title" className="text-2xl">Adresse et accès</h2>
          <address className="mt-3 not-italic"><FactText fact={c.address} /></address>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.mapsQuery)}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-5">
            Itinéraire<span className="sr-only"> (nouvel onglet)</span>
          </a>
          <h3 className="mt-8 text-lg">Téléphone</h3>
          <p className="mt-1">{c.phone && tel ? <a href={tel} className="underline">{c.phone.value}</a> : c.phone ? <FactText fact={c.phone} /> : "Non communiqué"}</p>
          <h3 className="mt-6 text-lg">
            Horaires du secrétariat
            <FactBadge status={c.hours.status} source={c.hours.source} />
          </h3>
          <ul className="mt-1 text-muted">
            {c.hours.rows.map((r) => (
              <li key={r.days}>{r.days} : {r.hours}</li>
            ))}
          </ul>
          <h3 className="mt-6 text-lg">Réseaux sociaux</h3>
          <ul className="mt-1 text-muted">
            {site.social.length === 0 ? <li>Liens officiels à confirmer avec l&apos;institut.</li> : null}
            {site.social.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">{s.network}</a>
                <FactBadge status={s.status} source={s.source} />
              </li>
            ))}
          </ul>
        </section>
        <section aria-label="Demande de renseignements">
          <InfoRequestForm organisation={site.name} units={units.map((u) => ({ value: u.slug, label: u.name }))} unitLabel="Formation concernée" profils={copy.profils} />
        </section>
      </div>
    </>
  );
}
