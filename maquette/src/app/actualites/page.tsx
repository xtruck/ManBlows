import Link from "next/link";
import { DemoImage } from "@/components/DemoImage";
import { FactBadge } from "@/components/FactBadge";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/content/site";
import { formatDate, publishedNews } from "@/lib/news";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Actualités", `Les actualités du ${site.name} : vie scolaire, inscriptions, événements.`, "/actualites");

export default function NewsPage() {
  const items = publishedNews();
  return (
    <>
      <PageHeader eyebrow="Actualités" title="La vie de l'institut">
        <p>Articles triés automatiquement du plus récent au plus ancien. Les articles ci-dessous sont des exemples.</p>
      </PageHeader>
      <ul className="container-site grid gap-6 md:grid-cols-2">
        {items.map((n, i) => (
          <li key={n.slug} className={`card relative overflow-hidden ${i === 0 ? "md:col-span-2 md:grid md:grid-cols-2" : ""}`}>
            <DemoImage file={n.image} alt="" sizes={i === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 50vw, 100vw"} className="aspect-[16/10] h-full w-full object-cover" />
            <div className="p-6 md:p-8">
              <p className="text-sm text-muted">
                <time dateTime={n.date}>{formatDate(n.date)}</time> · {n.category}
                <FactBadge status={n.status} />
              </p>
              <h2 className="mt-2 text-2xl">
                <Link href={`/actualites/${n.slug}`} className="after:absolute after:inset-0 hover:underline">
                  {n.title}
                </Link>
              </h2>
              <p className="mt-3 text-muted">{n.excerpt}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
