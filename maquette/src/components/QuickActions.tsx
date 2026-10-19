"use client";

import Link from "next/link";
import { useRef } from "react";

type Props = {
  whatsapp: string | null;
  whatsappMessage: string;
  tel: string | null;
  cta: { href: string; label: string };
  name: string;
};

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z" />
    </svg>
  );
}

/**
 * WhatsApp + call + main action. On phones they live in a bottom bar within thumb reach;
 * on larger screens WhatsApp becomes a floating button. Without a confirmed number, the
 * button explains the situation instead of opening a chat with anyone.
 */
export function QuickActions({ whatsapp, whatsappMessage, tel, cta, name }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const waHref = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(whatsappMessage)}` : null;

  const whatsappProps = waHref
    ? { href: waHref, target: "_blank", rel: "noopener noreferrer" }
    : { href: "#whatsapp-demo", onClick: (e: React.MouseEvent) => { e.preventDefault(); dialogRef.current?.showModal(); } };

  return (
    <>
      <a
        {...whatsappProps}
        data-testid="whatsapp"
        aria-label={waHref ? "Écrire sur WhatsApp (nouvel onglet)" : "WhatsApp (non configuré dans la démonstration)"}
        className="fixed bottom-6 right-6 z-30 hidden h-14 w-14 place-items-center rounded-full bg-[#25d366] text-[#0b2e17] shadow-lg shadow-black/40 transition hover:scale-105 md:grid"
      >
        <WhatsAppIcon />
      </a>

      <nav aria-label="Actions rapides" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur md:hidden">
        <ul className="grid grid-cols-3 gap-2 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2">
          <li>
            {tel ? (
              <a href={tel} className="flex min-h-12 flex-col items-center justify-center rounded-xl text-xs font-semibold">
                <span aria-hidden="true">✆</span>Appeler
              </a>
            ) : (
              <Link href="/contact" className="flex min-h-12 flex-col items-center justify-center rounded-xl text-xs font-semibold">
                <span aria-hidden="true">✆</span>Contact
              </Link>
            )}
          </li>
          <li>
            <a {...whatsappProps} className="flex min-h-12 flex-col items-center justify-center rounded-xl text-xs font-semibold text-whatsapp">
              <WhatsAppIcon />
              WhatsApp
            </a>
          </li>
          <li>
            <Link href={cta.href} className="flex min-h-12 flex-col items-center justify-center rounded-xl bg-accent text-xs font-bold text-accent-ink">
              <span aria-hidden="true">★</span>
              {cta.label.split(" ")[0]}
            </Link>
          </li>
        </ul>
      </nav>

      <dialog
        ref={dialogRef}
        aria-labelledby="whatsapp-demo-title"
        className="m-auto w-[min(92vw,28rem)] rounded-2xl border border-line bg-surface p-6 text-ink backdrop:bg-black/70"
      >
        <h2 id="whatsapp-demo-title" className="text-2xl">WhatsApp — démonstration</h2>
        <p className="mt-3 text-muted">
          Dans la version finale, ce bouton ouvrira une conversation WhatsApp avec {name}, avec un message pré-rempli. Le numéro
          sera configuré uniquement après validation par l&apos;établissement.
        </p>
        <form method="dialog" className="mt-6 text-right">
          <button className="btn btn-primary" autoFocus>
            J&apos;ai compris
          </button>
        </form>
      </dialog>
    </>
  );
}
