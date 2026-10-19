import { Gallery } from "@/components/Gallery";
import { PageHeader } from "@/components/PageHeader";
import { gallery } from "@/content/gallery";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Galerie", `Plats, ambiance et événements de ${site.name} en images.`, "/galerie");

export default function GaleriePage() {
  return (
    <>
      <PageHeader eyebrow="Galerie" title="Plats, ambiance, événements">
        <p>
          Les visuels ci-dessous sont des illustrations de démonstration. Ils seront remplacés par des photographies
          fournies ou autorisées par l&apos;établissement, optimisées automatiquement pour le mobile.
        </p>
      </PageHeader>
      <div className="container-site">
        <Gallery images={gallery} />
      </div>
    </>
  );
}
