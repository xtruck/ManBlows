import Link from "next/link";
import { DemoImage } from "@/components/DemoImage";
import { FactBadge, FactText } from "@/components/FactBadge";
import { Hero } from "@/components/Hero";
import { eventFormats, gallery, specialties } from "@/content/gallery";
import { menu } from "@/content/menu";
import { copy, site } from "@/content/site";

export default function HomePage() {
  const c = site.contact;
  const featured = menu.flatMap((cat) => cat.items.map((item) => ({ ...item, category: cat.name }))).slice(0, 4);

  return (
    <>
      <Hero />

      <section aria-labelledby="intro-title" className="container-site py-20 md:py-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-end">
          <div>
            <p className="eyebrow">Bienvenue</p>
            <h2 id="intro-title" className="mt-3 text-4xl md:text-5xl">
              {copy.introTitle}
            </h2>
          </div>
          <p className="text-lg text-muted">{copy.introText}</p>
        </div>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {copy.highlights.map((h, i) => (
            <li key={h.title} className="card p-6 md:p-8">
              <span aria-hidden="true" className="font-display text-5xl text-accent">
                0{i + 1}
              </span>
              <h3 className="mt-4 text-2xl">{h.title}</h3>
              <p className="mt-2 text-muted">{h.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {specialties.length > 0 ? (
        <section aria-labelledby="spec-title" className="bg-surface py-20 md:py-28">
          <div className="container-site">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow">Nos spécialités</p>
                <h2 id="spec-title" className="mt-3 text-4xl md:text-5xl">
                  Ce qui fait notre réputation
                </h2>
              </div>
              <Link href="/specialites" className="btn btn-ghost">
                Toutes les spécialités
              </Link>
            </div>
            <ul className="mt-10 grid gap-5 md:grid-cols-3">
              {specialties.map((s) => (
                <li key={s.title} className="overflow-hidden rounded-[var(--radius-card)] bg-bg">
                  <DemoImage file={s.image} alt={`Visuel de démonstration : ${s.title}`} sizes="(min-width: 768px) 33vw, 100vw" className="aspect-[4/3] w-full object-cover" />
                  <div className="p-6">
                    <h3 className="text-2xl">
                      {s.title}
                      <FactBadge status={s.status} source={s.source} />
                    </h3>
                    <p className="mt-2 text-muted">{s.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="menu-title" className="container-site py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-[var(--radius-card)]">
            <DemoImage file={gallery[0].file} alt={gallery[0].alt} sizes="(min-width: 1024px) 50vw, 100vw" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="eyebrow">À la carte</p>
            <h2 id="menu-title" className="mt-3 text-4xl md:text-5xl">
              Un aperçu du menu
            </h2>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {featured.map((item) => (
                <li key={item.name} className="flex items-baseline justify-between gap-4 py-4">
                  <span>
                    <span className="font-display text-xl">{item.name}</span>
                    <FactBadge status={item.status} />
                    <span className="block text-sm text-muted">{item.category}</span>
                  </span>
                  <span className="shrink-0 text-sm text-muted">{item.price ? `${item.price.toLocaleString("fr-FR")} F` : "Prix à confirmer"}</span>
                </li>
              ))}
            </ul>
            <Link href="/menu" className="btn btn-primary mt-8 self-start">
              Voir tout le menu
            </Link>
          </div>
        </div>
      </section>

      {eventFormats.length > 0 ? (
        <section aria-labelledby="events-title" className="border-y border-line bg-surface py-20 md:py-28">
          <div className="container-site grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="eyebrow">Événements</p>
              <h2 id="events-title" className="mt-3 text-4xl md:text-5xl">
                Votre soirée, organisée avec l&apos;équipe
              </h2>
              <p className="mt-4 max-w-xl text-lg text-muted">
                {eventFormats.map((e) => e.title.toLowerCase()).join(", ")} : décrivez votre projet, l&apos;équipe vous recontacte.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href={copy.reservationIncludesEvents ? "/reservation#evenement" : "/evenements"} className="btn btn-primary">
                Organiser un événement
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="gallery-title" className="container-site py-20 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="gallery-title" className="text-4xl md:text-5xl">
            En images
          </h2>
          <Link href="/galerie" className="btn btn-ghost">
            Ouvrir la galerie
          </Link>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {gallery.slice(1, 4).map((img, i) => (
            <li key={img.file} className={`relative aspect-square overflow-hidden rounded-[var(--radius-card)] ${i === 0 ? "col-span-2 aspect-[2/1] md:col-span-1 md:aspect-square" : ""}`}>
              <DemoImage file={img.file} alt={img.alt} fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover" />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="info-title" className="container-site">
        <div className="card grid gap-8 p-6 md:grid-cols-3 md:p-10">
          <h2 id="info-title" className="text-3xl md:text-4xl">
            Infos pratiques
          </h2>
          <div>
            <h3 className="font-body text-sm font-bold uppercase tracking-widest text-muted">Adresse</h3>
            <p className="mt-2">
              <FactText fact={c.address} />
            </p>
          </div>
          <div>
            <h3 className="font-body text-sm font-bold uppercase tracking-widest text-muted">
              Horaires
              <FactBadge status={c.hours.status} source={c.hours.source} />
            </h3>
            <ul className="mt-2">
              {c.hours.rows.map((r) => (
                <li key={r.days}>
                  {r.days} : {r.hours}
                </li>
              ))}
            </ul>
            <Link href="/contact" className="mt-4 inline-block font-semibold text-accent underline underline-offset-4">
              Contact et itinéraire
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
