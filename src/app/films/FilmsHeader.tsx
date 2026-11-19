"use client";

import { PageHeader } from "@/components/PageHeader";
import { useLang } from "@/components/LangProvider";

export function FilmsHeader() {
  const { t } = useLang();
  return <PageHeader level={2} title={t.films.title} intro={t.films.intro} />;
}
