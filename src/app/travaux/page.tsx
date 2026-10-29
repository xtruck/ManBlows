import type { Metadata } from "next";
import { Work } from "@/components/Work";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = { title: "Travaux" };

export default function WorkPage() {
  return (
    <>
      <Work mode="page" />
      <CtaBand />
    </>
  );
}
