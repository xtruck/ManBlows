import type { Metadata } from "next";
import { About } from "@/components/About";
import { Process } from "@/components/Process";
import { Clients } from "@/components/Clients";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = { title: "À propos" };

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
