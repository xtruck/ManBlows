import type { Metadata } from "next";
import { dict } from "@/i18n/dict";
import { Work } from "@/components/Work";
import { WorkTunnel } from "@/components/WorkTunnel";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = { title: dict.fr.meta.pages.work.title, description: dict.fr.meta.pages.work.description };

export default function WorkPage() {
  return (
    <>
      <WorkTunnel set="work" />
      <Work />
      <CtaBand />
    </>
  );
}
