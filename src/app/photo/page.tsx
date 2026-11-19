import type { Metadata } from "next";
import { dict } from "@/i18n/dict";
import { CraftHero } from "@/components/CraftHero";
import { Work } from "@/components/Work";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = { title: dict.fr.meta.pages.photo.title, description: dict.fr.meta.pages.photo.description };

export default function PhotoPage() {
  return (
    <>
      <CraftHero craft="photo" />
      <Work scope="photos" />
      <CtaBand />
    </>
  );
}
