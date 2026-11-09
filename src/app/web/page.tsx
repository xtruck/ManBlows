import type { Metadata } from "next";
import { dict } from "@/i18n/dict";
import { WebStudio } from "@/components/WebStudio";

export const metadata: Metadata = { title: dict.fr.meta.pages.web.title, description: dict.fr.meta.pages.web.description };

export default function WebPage() {
  return <WebStudio />;
}
