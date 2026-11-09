import type { Metadata } from "next";
import { dict } from "@/i18n/dict";
import { Contact } from "@/components/Contact";

export const metadata: Metadata = { title: dict.fr.meta.pages.contact.title, description: dict.fr.meta.pages.contact.description };

export default function ContactPage() {
  return <Contact />;
}
