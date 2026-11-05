import type { Metadata } from "next";
import { WebStudio } from "@/components/WebStudio";

export const metadata: Metadata = {
  title: "Sites web",
  description: "Sites vitrines, portfolios et pages de lancement à Abidjan : rapides, bilingues, pensés pour le téléphone et reliés à WhatsApp. Par EGC Studio.",
};

export default function WebPage() {
  return <WebStudio />;
}
