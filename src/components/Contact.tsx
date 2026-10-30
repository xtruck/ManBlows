"use client";

import { useState } from "react";
import { useLang } from "./LangProvider";
import { contact } from "@/content/site";

type Status = "idle" | "opened" | "invalid";

const field =
  "mt-2 w-full rounded-xl border border-ink/15 bg-paper/75 px-4 text-base text-ink placeholder:text-muted focus:border-ink";

export function Contact() {
  const { t } = useLang();
  const [status, setStatus] = useState<Status>("idle");

  // Static site (GitHub Pages): no server, so the form hands a prefilled message to WhatsApp or email.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const via = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "email" ? "email" : "whatsapp";
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (!data.name?.trim() || !data.message?.trim()) {
      setStatus("invalid");
      return;
    }
    const text = [
      `${t.contact.intro} ${data.name.trim()}.`,
      `${t.contact.type} : ${data.type}`,
      data.date ? `${t.contact.date} : ${data.date}` : "",
      data.email ? `${t.contact.email} : ${data.email}` : "",
      "",
      data.message.trim(),
    ]
      .filter((line, i) => line || i === 4)
      .join("\n");
    const url =
      via === "email"
        ? `mailto:${contact.email}?subject=${encodeURIComponent(`${data.type}, ${data.name.trim()}`)}&body=${encodeURIComponent(text)}`
        : `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setStatus("opened");
  }

  const message = status === "opened" ? t.contact.opened : status === "invalid" ? t.contact.required : "";

  return (
    <section
      id="contact"
      className="grid min-h-[100svh] gap-14 bg-brand px-4 pt-32 pb-24 text-ink md:grid-cols-12 md:px-8 md:pt-44 md:pb-36"
    >
      <div className="md:col-span-6">
        <h1 data-reveal className="font-display text-[clamp(3rem,7.5vw,7rem)] leading-[0.9] font-semibold tracking-[-0.04em]">
          {t.contact.title}
        </h1>
        <p data-reveal className="mt-6 max-w-[40ch] text-lg leading-relaxed">
          {t.contact.text}
        </p>

        <ul data-reveal className="mt-10 space-y-3 font-display text-xl tracking-tight sm:text-2xl md:mt-12 md:text-3xl">
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
          <li>
            <a
              href={`https://www.tiktok.com/@${contact.tiktok}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-1 underline-offset-[6px] hover:decoration-2"
            >
              TikTok @{contact.tiktok}
            </a>
          </li>
        </ul>
      </div>

      <form
        noValidate
        onSubmit={onSubmit}
        data-reveal
        className="liquid-glass self-start rounded-[2rem] p-6 md:col-span-5 md:col-start-8 md:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            {t.contact.name}
            <input name="name" autoComplete="name" required className={`${field} h-12`} />
          </label>
          <label className="block text-sm font-medium">
            {t.contact.email}
            <input name="email" type="email" autoComplete="email" className={`${field} h-12`} />
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

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            value="whatsapp"
            className="h-12 cursor-pointer rounded-full bg-ink px-7 text-sm font-medium text-paper transition-transform duration-200 hover:scale-[1.03]"
          >
            {t.contact.send}
          </button>
          <button
            type="submit"
            value="email"
            className="h-12 cursor-pointer rounded-full border border-ink/30 px-7 text-sm font-medium text-ink transition-colors duration-200 hover:bg-ink/5"
          >
            {t.contact.sendEmail}
          </button>
          <p aria-live="polite" className="text-sm font-medium">
            {message}
          </p>
        </div>
      </form>
    </section>
  );
}
