import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="container-site pb-10 pt-12 md:pb-14 md:pt-20">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-3 max-w-3xl text-4xl sm:text-5xl md:text-6xl">{title}</h1>
      {children ? <div className="mt-5 max-w-2xl text-lg text-muted">{children}</div> : null}
    </div>
  );
}
