import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoImage } from "@/components/DemoImage";
import { FactBadge } from "@/components/FactBadge";
import { formatDate, publishedNews } from "@/lib/news";
import { pageMetadata } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return publishedNews().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const item = publishedNews().find((n) => n.slug === slug);
  return item ? pageMetadata(item.title, item.excerpt, `/actualites/${item.slug}`) : {};
}

export default async function NewsItemPage({ params }: Params) {
  const { slug } = await params;
  const item = publishedNews().find((n) => n.slug === slug);
  if (!item) notFound();
  return (
    <article className="container-site max-w-3xl pt-12">
      <Link href="/actualites" className="text-sm font-semibold text-accent hover:underline">
        ← Toutes les actualités
      </Link>
      <p className="mt-6 text-sm text-muted">
        <time dateTime={item.date}>{formatDate(item.date)}</time> · {item.category}
        <FactBadge status={item.status} />
      </p>
      <h1 className="mt-3 text-4xl md:text-5xl">{item.title}</h1>
      <p className="mt-5 text-xl text-muted">{item.excerpt}</p>
      <DemoImage file={item.image} alt="Visuel de démonstration illustrant l'article" priority sizes="(min-width: 768px) 48rem, 100vw" className="mt-8 w-full rounded-[var(--radius-card)]" />
      <div className="mt-8 space-y-4 text-lg">
        {item.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </article>
  );
}
