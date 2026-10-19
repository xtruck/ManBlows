import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-site py-28 text-center">
      <p className="eyebrow">Erreur 404</p>
      <h1 className="mt-3 text-5xl">Page introuvable</h1>
      <p className="mx-auto mt-4 max-w-md text-muted">Cette page n&apos;existe pas ou a été déplacée.</p>
      <Link href="/" className="btn btn-primary mt-8">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
