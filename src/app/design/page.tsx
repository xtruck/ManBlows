import type { Metadata } from "next";
import { dict } from "@/i18n/dict";
import { CraftHero } from "@/components/CraftHero";
import { Work } from "@/components/Work";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = { title: dict.fr.meta.pages.design.title, description: dict.fr.meta.pages.design.description };

export default function DesignPage() {
  return (
    <>
      <CraftHero craft="design" />
      <Work scope="design" />
      <CtaBand />
    </>
  );
}
