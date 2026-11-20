/** Opening block of an inner page: a large title and a short line of context. Under a craft hero, it is an <h2>. */
export function PageHeader({ title, intro, level = 1 }: { title: string; intro: string; level?: 1 | 2 }) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <section className="bg-paper px-4 pt-32 pb-14 md:px-8 md:pt-44 md:pb-20">
      <div className="grid gap-8 md:grid-cols-12 md:items-end">
        <Heading
          data-reveal
          className="font-display text-[clamp(3.6rem,12vw,11rem)] leading-[0.84] font-semibold tracking-[-0.05em] md:col-span-8"
        >
          {title}
        </Heading>
        <p data-reveal className="max-w-[40ch] text-lg leading-relaxed text-muted md:col-span-4">
          {intro}
        </p>
      </div>
    </section>
  );
}
