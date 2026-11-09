import type { Metadata } from "next";
import { dict } from "@/i18n/dict";
import { About } from "@/components/About";
import { Process } from "@/components/Process";
import { Clients } from "@/components/Clients";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = { title: dict.fr.meta.pages.about.title, description: dict.fr.meta.pages.about.description };

export default function AboutPage() {
  return (
    <>
      <About mode="page" />
      <Process />
      <Clients />
      <CtaBand />
    </>
  );
}
