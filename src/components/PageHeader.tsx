/** Opening block of an inner page: a large title and a short line of context. */
export function PageHeader({ title, intro }: { title: string; intro: string }) {
  return (
    <section className="bg-paper px-4 pt-32 pb-14 md:px-8 md:pt-44 md:pb-20">
      <div className="grid gap-8 md:grid-cols-12 md:items-end">
        <h1
          data-reveal
          className="font-display text-[clamp(3.6rem,12vw,11rem)] leading-[0.84] font-semibold tracking-[-0.05em] md:col-span-8"
        >
          {title}
        </h1>
        <p data-reveal className="max-w-[40ch] text-lg leading-relaxed text-muted md:col-span-4">
          {intro}
        </p>
      </div>
    </section>
  );
}
