import Link from "next/link";
import { site } from "@/content/site";
import { FactBadge, FactText } from "./FactBadge";

export function Footer() {
  const c = site.contact;
  return (
    <footer className="mt-24 border-t border-line bg-surface pb-28 pt-14 md:pb-14">
      <div className="container-site grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-2xl">{site.name}</p>
          <p className="mt-2 max-w-md text-muted">{site.tagline}</p>
          <address className="mt-4 not-italic text-muted">
            <FactText fact={c.address} />
          </address>
        </div>
        <div>
          <h2 className="font-body text-sm font-bold uppercase tracking-widest text-muted">Pages</h2>
          <ul className="mt-3 space-y-2">
            {site.nav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-accent">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-body text-sm font-bold uppercase tracking-widest text-muted">Réseaux sociaux</h2>
          <ul className="mt-3 space-y-2">
            {site.social.length === 0 ? <li className="text-muted">Liens officiels à confirmer avec l&apos;établissement.</li> : null}
            {site.social.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                  {s.network}
                  <span className="sr-only"> (nouvel onglet)</span>
                </a>
                <FactBadge status={s.status} source={s.source} />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container-site mt-12 flex flex-col gap-2 border-t border-line pt-6 text-sm text-muted md:flex-row md:justify-between">
        <p>
          Maquette indépendante réalisée par RealSpill (Abidjan). Contenus marqués « Démo » ou « à confirmer » : non validés par
          l&apos;établissement.
        </p>
        <Link href="/maquette" className="underline underline-offset-2 hover:text-accent">
          À propos de cette maquette
        </Link>
      </div>
    </footer>
  );
}
