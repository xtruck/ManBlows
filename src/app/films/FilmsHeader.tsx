"use client";

import { PageHeader } from "@/components/PageHeader";
import { useLang } from "@/components/LangProvider";

export function FilmsHeader() {
  const { t } = useLang();
  return <PageHeader title={t.films.title} intro={t.films.intro} />;
}
