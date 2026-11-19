import type { Metadata } from "next";
import { dict } from "@/i18n/dict";
import { CraftHero } from "@/components/CraftHero";
import { FilmsHeader } from "./FilmsHeader";
import { Showreel } from "@/components/Showreel";
import { Films } from "@/components/Films";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = { title: dict.fr.meta.pages.reel.title, description: dict.fr.meta.pages.reel.description };

export default function FilmsPage() {
  return (
    <>
      <CraftHero craft="video" />
      <div id="films" className="scroll-mt-20">
        <FilmsHeader />
      </div>
      <Showreel />
      <Films />
      <CtaBand />
    </>
  );
}
