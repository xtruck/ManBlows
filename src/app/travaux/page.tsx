import type { Metadata } from "next";
import { Work } from "@/components/Work";
import { WorkTunnel } from "@/components/WorkTunnel";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = { title: "Travaux" };

export default function WorkPage() {
  return (
    <>
      <WorkTunnel set="work" />
      <Work />
      <CtaBand />
    </>
  );
}
