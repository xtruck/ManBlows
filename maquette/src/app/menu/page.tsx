import Link from "next/link";
import { FactBadge } from "@/components/FactBadge";
import { PageHeader } from "@/components/PageHeader";
import { menu } from "@/content/menu";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Menu", `La carte de ${site.name} à ${site.district} : catégories, plats et boissons.`, "/menu");

const price = (value: number | null) => (value === null ? "Prix à confirmer" : `${value.toLocaleString("fr-FR")} FCFA`);

export default function MenuPage() {
  const unpriced = menu.every((c) => c.items.every((i) => i.price === null));
  return (
    <>
      <PageHeader eyebrow="La carte" title="Menu">
        <p>Parcourez la carte par catégorie.</p>
        {unpriced ? (
          <p className="mt-3 rounded-xl border border-line p-4 text-base">
            Démonstration : les plats sont des exemples et aucun prix n&apos;est affiché tant que l&apos;établissement n&apos;a pas
            communiqué sa carte officielle.
          </p>
        ) : null}
      </PageHeader>

      <nav aria-label="Catégories du menu" className="sticky top-16 z-20 border-y border-line bg-bg/95 backdrop-blur md:top-20">
        <ul className="container-site flex gap-2 overflow-x-auto py-3 [scrollbar-width:none]">
          {menu.map((c) => (
            <li key={c.id} className="shrink-0">
              <a href={`#${c.id}`} className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-semibold hover:border-accent hover:text-accent">
                {c.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container-site mt-12 space-y-16">
        {menu.map((cat) => (
          <section key={cat.id} id={cat.id} aria-labelledby={`${cat.id}-title`}>
            <div className="border-b border-line pb-4">
              <h2 id={`${cat.id}-title`} className="text-3xl md:text-4xl">
                {cat.name}
              </h2>
              <p className="mt-1 text-muted">{cat.intro}</p>
            </div>
            <ul className="grid gap-x-12 md:grid-cols-2">
              {cat.items.map((item) => (
                <li key={item.name} className="flex justify-between gap-6 border-b border-line py-5">
                  <div>
                    <h3 className="font-display text-xl">
                      {item.name}
                      <FactBadge status={item.status} />
                    </h3>
                    <p className="mt-1 text-sm text-muted">{item.description}</p>
                    {item.tags?.length ? (
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {item.tags.map((t) => (
                          <li key={t} className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs">
                            {t}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <p className="shrink-0 text-right text-sm font-semibold text-accent">{price(item.price)}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="container-site mt-16">
        <div className="card flex flex-col items-start justify-between gap-6 p-6 md:flex-row md:items-center md:p-10">
          <p className="font-display text-2xl md:text-3xl">Envie de goûter ? Réservez votre table.</p>
          <Link href={site.primaryCta.href} className="btn btn-primary">
            {site.primaryCta.label}
          </Link>
        </div>
      </div>
    </>
  );
}
