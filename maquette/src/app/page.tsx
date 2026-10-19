import Link from "next/link";
import { DemoImage } from "@/components/DemoImage";
import { FactBadge, FactText } from "@/components/FactBadge";
import { units } from "@/content/units";
import { copy, site } from "@/content/site";
import { formatDate, publishedNews } from "@/lib/news";

export default function HomePage() {
  const latest = publishedNews().slice(0, 3);
  const groups = [...new Set(units.map((u) => u.group))];

  return (
    <>
      <section aria-labelledby="hero-title" className="container-site grid items-center gap-10 overflow-x-clip pb-16 pt-10 md:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <p className="eyebrow">{copy.heroEyebrow}</p>
          <h1 id="hero-title" className="mt-4 text-4xl sm:text-5xl md:text-6xl">
            {copy.heroTitle}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">{copy.heroText}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={site.primaryCta.href} className="btn btn-primary">
              {site.primaryCta.label}
            </Link>
            <Link href={copy.unitsPath} className="btn btn-ghost">
              Voir les {copy.unitsLabel.toLowerCase()}
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
          <DemoImage file="hero.webp" alt="Visuel de démonstration d'un bâtiment d'enseignement supérieur" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          <p className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-white">Visuel de démonstration</p>
        </div>
      </section>

      <section aria-labelledby="paths-title" className="bg-surface-2 py-16 md:py-20">
        <div className="container-site">
          <h2 id="paths-title" className="text-3xl md:text-4xl">
            Que souhaitez-vous faire ?
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {copy.pathways.map((p, i) => (
              <li key={p.href} className="card relative p-6 transition hover:-translate-y-1">
                <span aria-hidden="true" className="text-4xl font-bold text-accent">
                  {i + 1}
                </span>
                <h3 className="mt-3 text-2xl">
                  <Link href={p.href} className="after:absolute after:inset-0">
                    {p.title}
                  </Link>
                </h3>
                <p className="mt-2 text-muted">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="units-title" className="container-site py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Nos formations</p>
            <h2 id="units-title" className="mt-3 text-3xl md:text-4xl">
              Domaines de formation
            </h2>
          </div>
          <Link href={copy.unitsPath} className="btn btn-ghost">
            Tous les {copy.unitsLabel.toLowerCase()}
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <div key={g} className="card p-6 md:p-8">
              <h3 className="text-2xl">{g}</h3>
              <ul className="mt-4 divide-y divide-line">
                {units
                  .filter((u) => u.group === g)
                  .map((u) => (
                    <li key={u.slug} className="flex items-center justify-between gap-4 py-3">
                      <span>
                        <Link href={`${copy.unitsPath}/${u.slug}`} className="font-semibold hover:text-accent hover:underline">
                          {u.name}
                        </Link>
                        <span className="block text-sm text-muted">{u.levels.join(" · ")}</span>
                      </span>
                      <span aria-hidden="true">→</span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="news-title" className="container-site pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="news-title" className="text-3xl md:text-4xl">
            Actualités
          </h2>
          <Link href="/actualites" className="btn btn-ghost">
            Toutes les actualités
          </Link>
        </div>
        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {latest.map((n) => (
            <li key={n.slug} className="card relative overflow-hidden">
              <DemoImage file={n.image} alt="" sizes="(min-width: 768px) 33vw, 100vw" className="aspect-[16/10] w-full object-cover" />
              <div className="p-5">
                <p className="text-sm text-muted">
                  <time dateTime={n.date}>{formatDate(n.date)}</time> · {n.category}
                  <FactBadge status={n.status} />
                </p>
                <h3 className="mt-2 text-xl">
                  <Link href={`/actualites/${n.slug}`} className="after:absolute after:inset-0 hover:underline">
                    {n.title}
                  </Link>
                </h3>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="contact-title" className="container-site">
        <div className="card flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <h2 id="contact-title" className="text-3xl">
              Une question sur une formation ?
            </h2>
            <p className="mt-2 text-muted">
              <FactText fact={site.contact.address} />
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="btn btn-primary">
              Nous contacter
            </Link>
            <Link href={copy.admissionsPath} className="btn btn-ghost">
              {copy.admissionsLabel}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
