import Link from "next/link";
import { FactBadge } from "@/components/FactBadge";
import { PageHeader } from "@/components/PageHeader";
import { EventForm, ReservationForm } from "@/components/forms/RestaurantForms";
import { copy, site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  copy.reservationIncludesEvents ? "Réservations & événements" : "Réservation",
  `Demandez une table${copy.reservationIncludesEvents ? " ou organisez un événement" : ""} chez ${site.name}, ${site.district}.`,
  "/reservation",
);

export default function ReservationPage() {
  const h = site.contact.hours;
  return (
    <>
      <PageHeader eyebrow="Réservation" title={copy.reservationIncludesEvents ? "Réserver une table ou un événement" : "Réserver une table"}>
        <p>{copy.reservationIntro}</p>
      </PageHeader>

      {copy.reservationIncludesEvents ? (
        <nav aria-label="Type de demande" className="container-site -mt-4 mb-8 flex flex-wrap gap-2">
          <a href="#reservation" className="btn btn-ghost min-h-11 text-sm">
            Table
          </a>
          <a href="#evenement" className="btn btn-ghost min-h-11 text-sm">
            Événement
          </a>
        </nav>
      ) : null}

      <div className="container-site grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-16">
          <section id="reservation" aria-label="Réserver une table">
            <ReservationForm restaurant={site.name} />
          </section>
          {copy.reservationIncludesEvents ? (
            <section id="evenement" aria-label="Demande pour un événement">
              <EventForm restaurant={site.name} />
            </section>
          ) : null}
        </div>

        <aside aria-labelledby="aside-title" className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <h2 id="aside-title" className="sr-only">
            Informations utiles
          </h2>
          <div className="card p-6">
            <h3 className="text-xl">
              Horaires
              <FactBadge status={h.status} source={h.source} />
            </h3>
            <ul className="mt-2 text-muted">
              {h.rows.map((r) => (
                <li key={r.days}>
                  {r.days} : {r.hours}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <h3 className="text-xl">Comment ça marche ?</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted">
              <li>Vous envoyez votre demande.</li>
              <li>L&apos;équipe vérifie la disponibilité.</li>
              <li>Vous recevez une confirmation par téléphone ou WhatsApp.</li>
            </ol>
          </div>
          {!copy.reservationIncludesEvents ? (
            <div className="card p-6">
              <h3 className="text-xl">Plus de 40 personnes ?</h3>
              <p className="mt-2 text-muted">Pour une fête ou une privatisation, utilisez la demande d&apos;événement.</p>
              <Link href="/evenements" className="btn btn-ghost mt-4 min-h-11 text-sm">
                Organiser un événement
              </Link>
            </div>
          ) : null}
        </aside>
      </div>
    </>
  );
}
