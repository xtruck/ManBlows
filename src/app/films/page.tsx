import type { Metadata } from "next";
import { FilmsHeader } from "./FilmsHeader";
import { Films } from "@/components/Films";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = { title: "Films" };

export default function FilmsPage() {
  return (
    <>
      <FilmsHeader />
      <Films />
      <CtaBand />
    </>
  );
}
