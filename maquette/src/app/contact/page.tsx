import Link from "next/link";
import { FactBadge, FactText } from "@/components/FactBadge";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/content/site";
import { telHref } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Contact & accès", `Adresse, horaires et itinéraire pour venir chez ${site.name}, ${site.district}, ${site.locality}.`, "/contact");

export default function ContactPage() {
  const c = site.contact;
  const tel = telHref(c.phone);
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.mapsQuery)}`;

  return (
    <>
      <PageHeader eyebrow="Contact" title="Nous trouver, nous joindre" />
      <div className="container-site grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="coord-title" className="card p-6 md:p-10">
          <h2 id="coord-title" className="text-3xl">
            Coordonnées
          </h2>
          <dl className="mt-6 space-y-6">
            <div>
              <dt className="text-sm font-bold uppercase tracking-widest text-muted">Adresse</dt>
              <dd className="mt-1 text-lg">
                <address className="not-italic">
                  <FactText fact={c.address} />
                </address>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-bold uppercase tracking-widest text-muted">Téléphone</dt>
              <dd className="mt-1 text-lg">
                {c.phone && tel ? <a href={tel} className="underline underline-offset-4">{c.phone.value}</a> : c.phone ? <FactText fact={c.phone} /> : "Non communiqué"}
              </dd>
            </div>
            {c.email ? (
              <div>
                <dt className="text-sm font-bold uppercase tracking-widest text-muted">E-mail</dt>
                <dd className="mt-1 text-lg">
                  {c.email.status === "confirme" ? <a href={`mailto:${c.email.value}`} className="underline underline-offset-4">{c.email.value}</a> : <FactText fact={c.email} />}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-sm font-bold uppercase tracking-widest text-muted">
                Horaires
                <FactBadge status={c.hours.status} source={c.hours.source} />
              </dt>
              <dd className="mt-1">
                <ul>
                  {c.hours.rows.map((r) => (
                    <li key={r.days} className="text-lg">
                      {r.days} : {r.hours}
                    </li>
                  ))}
                </ul>
                {c.hours.source ? <p className="mt-2 text-sm text-muted">{c.hours.source}</p> : null}
              </dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={maps} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Itinéraire Google Maps<span className="sr-only"> (nouvel onglet)</span>
            </a>
            <Link href={site.primaryCta.href} className="btn btn-ghost">
              {site.primaryCta.label}
            </Link>
          </div>
        </section>

        <section aria-labelledby="map-title" className="card relative flex min-h-80 flex-col justify-end overflow-hidden p-6 md:p-10">
          <div aria-hidden="true" className="absolute inset-0 opacity-40 [background-image:linear-gradient(var(--color-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-line)_1px,transparent_1px)] [background-size:36px_36px]" />
          <div aria-hidden="true" className="absolute left-1/2 top-1/3 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full bg-accent text-2xl text-accent-ink shadow-lg">
            ●
          </div>
          <div className="relative">
            <h2 id="map-title" className="text-2xl">
              {site.district}, {site.locality}
            </h2>
            <p className="mt-2 text-muted">
              Carte statique légère : pas de module tiers chargé tant que le visiteur n&apos;ouvre pas l&apos;itinéraire. L&apos;emplacement exact sera vérifié avec l&apos;établissement.
            </p>
          </div>
        </section>

        <section aria-labelledby="social-title" className="card p-6 md:p-10 lg:col-span-2">
          <h2 id="social-title" className="text-2xl">
            Réseaux sociaux
          </h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {site.social.length === 0 ? <li className="text-muted">Liens officiels à confirmer avec l&apos;établissement.</li> : null}
            {site.social.map((s) => (
              <li key={s.url} className="flex items-center">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost min-h-11 text-sm">
                  {s.network}
                  <span className="sr-only"> (nouvel onglet)</span>
                </a>
                <FactBadge status={s.status} source={s.source} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
