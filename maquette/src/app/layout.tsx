import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";
import { DemoBanner } from "@/components/DemoBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { QuickActions } from "@/components/QuickActions";
import { site } from "@/content/site";
import { isDemo, resolveWhatsapp, siteUrl, telHref } from "@/lib/env";
import { organizationJsonLd } from "@/lib/seo";
import "./globals.css";

const display = Syne({ subsets: ["latin"], variable: "--font-display-face", display: "swap" });
const body = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body-face", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${site.name} · ${site.tagline}`, template: `%s · ${site.name}, ${site.district}` },
  description: site.description,
  keywords: site.keywords,
  // A demo must never be indexed: it could be mistaken for the establishment's official site.
  robots: isDemo ? { index: false, follow: false } : { index: true, follow: true },
  openGraph: { siteName: site.name, locale: "fr_CI", type: "website" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#0f1d17", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body>
        <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink">
          Aller au contenu
        </a>
        <DemoBanner />
        <Header name={site.name} shortName={site.shortName} nav={site.nav} cta={site.primaryCta} />
        <main id="contenu" tabIndex={-1} className="focus:outline-none">
          {children}
        </main>
        <Footer />
        <QuickActions
          whatsapp={resolveWhatsapp(site.contact.whatsapp)}
          whatsappMessage={site.contact.whatsappMessage}
          tel={telHref(site.contact.phone)}
          cta={site.primaryCta}
          name={site.name}
        />
        {/* Static config only; "<" is escaped so content can never close the script tag. */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()).replace(/</g, "\\u003c") }} />
      </body>
    </html>
  );
}
