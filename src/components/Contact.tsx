"use client";

import { useState } from "react";
import { useLang } from "./LangProvider";
import { contact } from "@/content/site";

type Status = "idle" | "sending" | "sent" | "error" | "invalid";

const field =
  "mt-2 w-full rounded-xl border border-ink/15 bg-paper/75 px-4 text-base text-ink placeholder:text-muted focus:border-ink";

export function Contact() {
  const { t } = useLang();
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (!data.name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email ?? "") || !data.message?.trim()) {
      setStatus("invalid");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      e.currentTarget?.reset();
    } catch {
      setStatus("error");
    }
  }

  const message =
    status === "sent" ? t.contact.sent : status === "error" ? t.contact.error : status === "invalid" ? t.contact.required : "";

  return (
    <section id="contact" className="grid gap-14 bg-brand px-4 py-24 text-ink md:grid-cols-12 md:px-8 md:py-36">
      <div className="md:col-span-6">
        <h2 className="font-display text-[clamp(3rem,7.5vw,7rem)] leading-[0.9] font-semibold tracking-[-0.04em]">
          {t.contact.title}
        </h2>
        <p className="mt-6 max-w-[40ch] text-lg leading-relaxed">{t.contact.text}</p>

        <ul className="mt-10 space-y-3 font-display text-xl tracking-tight sm:text-2xl md:mt-12 md:text-3xl">
          <li>
            <a
              href={`https://wa.me/${contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-1 underline-offset-[6px] hover:decoration-2"
            >
              {t.contact.whatsapp} <span className="whitespace-nowrap">{contact.whatsappLabel}</span>
            </a>
          </li>
          <li>
            <a href={`mailto:${contact.email}`} className="underline decoration-1 underline-offset-[6px] hover:decoration-2">
              {contact.email}
            </a>
          </li>
          <li>
            <a
              href={`https://instagram.com/${contact.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-1 underline-offset-[6px] hover:decoration-2"
            >
              Instagram @{contact.instagram}
            </a>
          </li>
        </ul>
      </div>

      <form
        noValidate
        onSubmit={onSubmit}
        className="self-start rounded-3xl border border-ink/10 bg-white/35 p-6 backdrop-blur-xl md:col-span-5 md:col-start-8 md:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            {t.contact.name}
            <input name="name" autoComplete="name" required className={`${field} h-12`} />
          </label>
          <label className="block text-sm font-medium">
            {t.contact.email}
            <input name="email" type="email" autoComplete="email" required className={`${field} h-12`} />
          </label>
          <label className="block text-sm font-medium">
            {t.contact.type}
            <select name="type" className={`${field} h-12 cursor-pointer`}>
              {t.contact.types.map((ty) => (
                <option key={ty}>{ty}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            {t.contact.date}
            <input name="date" type="date" className={`${field} h-12`} />
          </label>
        </div>
        <label className="mt-5 block text-sm font-medium">
          {t.contact.message}
          <textarea name="message" rows={5} required className={`${field} resize-y py-3`} />
        </label>
        {/* Honeypot for bots, hidden from people and assistive tech */}
        <input name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={status === "sending"}
            className="h-12 cursor-pointer rounded-full bg-ink px-8 text-sm font-medium text-paper transition-transform duration-200 hover:scale-[1.03] disabled:opacity-60"
          >
            {status === "sending" ? t.contact.sending : t.contact.send}
          </button>
          <p aria-live="polite" className="text-sm font-medium">
            {message}
          </p>
        </div>
      </form>
    </section>
  );
}
