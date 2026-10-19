import { notFound } from "next/navigation";
import { DemoImage } from "@/components/DemoImage";
import { FactBadge, FactText } from "@/components/FactBadge";
import { PageHeader } from "@/components/PageHeader";
import { EventForm } from "@/components/forms/RestaurantForms";
import { eventFormats } from "@/content/gallery";
import { copy, site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Événements", `Anniversaires, afterworks et soirées privées chez ${site.name}, ${site.district}.`, "/evenements");

export default function EvenementsPage() {
  // When events are handled on the reservation page, this route does not exist.
  if (copy.reservationIncludesEvents || eventFormats.length === 0) notFound();
  return (
    <>
      <PageHeader eyebrow="Événements" title="Vos moments, notre lieu">
        <p>Anniversaires, afterworks, repas d&apos;affaires ou soirées privatisées : décrivez votre projet et l&apos;équipe vous recontacte.</p>
      </PageHeader>

      <div className="container-site">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-card)] md:aspect-[21/9]">
          <DemoImage file="evenements-hero.webp" alt="Visuel de démonstration d'une salle préparée pour une soirée" fill sizes="100vw" className="object-cover" />
        </div>

        <section aria-labelledby="formats-title" className="mt-16">
          <h2 id="formats-title" className="text-4xl">
            Formules possibles
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {eventFormats.map((f) => (
              <li key={f.title} className="card p-6 md:p-8">
                <h3 className="text-2xl">
                  {f.title}
                  <FactBadge status={f.status} />
                </h3>
                <p className="mt-2 text-muted">{f.description}</p>
                <p className="mt-4 text-sm">
                  <FactText fact={f.capacity} />
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section id="evenement" aria-label="Demande pour un événement" className="mt-16 max-w-3xl">
          <EventForm restaurant={site.name} />
        </section>
      </div>
    </>
  );
}
