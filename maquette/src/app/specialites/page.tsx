import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoImage } from "@/components/DemoImage";
import { FactBadge } from "@/components/FactBadge";
import { PageHeader } from "@/components/PageHeader";
import { specialties } from "@/content/gallery";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Spécialités", `Les spécialités de ${site.name} à ${site.district}, ${site.locality}.`, "/specialites");

export default function SpecialitesPage() {
  if (specialties.length === 0) notFound();
  return (
    <>
      <PageHeader eyebrow="Spécialités" title="Les plats qui font notre réputation">
        <p>Les spécialités citées dans les sources publiques, présentées en attendant la description et les photos de l&apos;établissement.</p>
      </PageHeader>
      <div className="container-site space-y-20">
        {specialties.map((s, i) => (
          <section key={s.title} aria-labelledby={`spec-${i}`} className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
            <div className={`overflow-hidden rounded-[var(--radius-card)] ${i % 2 ? "md:order-2" : ""}`}>
              <DemoImage file={s.image} alt={`Visuel de démonstration : ${s.title}`} sizes="(min-width: 768px) 50vw, 100vw" className="aspect-[4/3] w-full object-cover" />
            </div>
            <div>
              <p className="eyebrow">Spécialité {String(i + 1).padStart(2, "0")}</p>
              <h2 id={`spec-${i}`} className="mt-3 text-4xl md:text-5xl">
                {s.title}
              </h2>
              <p className="mt-2">
                <FactBadge status={s.status} source={s.source} />
              </p>
              <p className="mt-4 text-lg text-muted">{s.description}</p>
              {s.source ? <p className="mt-3 text-sm text-muted">Source : {s.source}</p> : null}
            </div>
          </section>
        ))}
      </div>
      <div className="container-site mt-20">
        <div className="card flex flex-col items-start justify-between gap-6 p-6 md:flex-row md:items-center md:p-10">
          <p className="font-display text-2xl md:text-3xl">Envie d&apos;y goûter ?</p>
          <Link href={site.primaryCta.href} className="btn btn-primary">
            {site.primaryCta.label}
          </Link>
        </div>
      </div>
    </>
  );
}
