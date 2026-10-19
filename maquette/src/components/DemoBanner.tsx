import Link from "next/link";
import { site } from "@/content/site";
import { isDemo } from "@/lib/env";

export function DemoBanner() {
  if (!isDemo) return null;
  return (
    <div role="note" aria-label="Statut de la maquette" className="bg-accent text-accent-ink">
      <p className="container-site py-2 text-center text-xs font-semibold sm:text-sm">
        Maquette de démonstration : proposition indépendante de RealSpill, ni commandée ni validée par {site.name}.{" "}
        <Link href="/maquette" className="underline underline-offset-2">
          En savoir plus
        </Link>
      </p>
    </div>
  );
}
