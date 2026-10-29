import type { Metadata } from "next";
import { FilmsHeader } from "./FilmsHeader";
import { Reel } from "@/components/Reel";
import { Films } from "@/components/Films";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = { title: "Films" };

export default function FilmsPage() {
  return (
    <>
      <FilmsHeader />
      <Reel />
      <Films />
      <CtaBand />
    </>
  );
}
