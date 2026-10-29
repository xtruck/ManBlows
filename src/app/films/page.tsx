import type { Metadata } from "next";
import { FilmsHeader } from "./FilmsHeader";
import { Showreel } from "@/components/Showreel";
import { Films } from "@/components/Films";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = { title: "Films" };

export default function FilmsPage() {
  return (
    <>
      <FilmsHeader />
      <Showreel />
      <Films />
      <CtaBand />
    </>
  );
}
