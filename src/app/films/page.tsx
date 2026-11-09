import type { Metadata } from "next";
import { dict } from "@/i18n/dict";
import { FilmsHeader } from "./FilmsHeader";
import { WorkTunnel } from "@/components/WorkTunnel";
import { Showreel } from "@/components/Showreel";
import { Films } from "@/components/Films";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = { title: dict.fr.meta.pages.reel.title, description: dict.fr.meta.pages.reel.description };

export default function FilmsPage() {
  return (
    <>
      <WorkTunnel set="films" />
      <FilmsHeader />
      <Showreel />
      <Films />
      <CtaBand />
    </>
  );
}
