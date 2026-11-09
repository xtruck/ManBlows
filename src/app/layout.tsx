import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Instrument_Serif, Mrs_Saint_Delafield, Poppins } from "next/font/google";
import { LangProvider } from "@/components/LangProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Preloader } from "@/components/Preloader";
import { Assistant } from "@/components/Assistant";
import { TransitionProvider } from "@/components/TransitionProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveals } from "@/components/Reveals";
import { Interactions } from "@/components/Interactions";
import { MotionControl } from "@/components/MotionControl";
import { TitleSync } from "@/components/TitleSync";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { INTRO_SEEN_KEY } from "@/lib/intro";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

// The two faces below only rebuild the logo: script "egc" and bold italic "studio.".
const script = Mrs_Saint_Delafield({
  variable: "--font-script-face",
  weight: "400",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: "800",
  style: "italic",
  subsets: ["latin"],
});

// Italic serif accent for a few words in headings ("un seul regard"), for an editorial touch.
const serif = Instrument_Serif({
  variable: "--font-serif-face",
  weight: "400",
  style: "italic",
  subsets: ["latin"],
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteUrl = `https://xtruck.github.io${basePath}/`;
const description = "EGC Studio, photographe, vidéaste, infographiste et créateur de sites web à Abidjan : cérémonies, événements, portraits, films, design graphique et sites web.";
const descriptionEn = "EGC Studio, photographer, videographer, graphic designer and web creator in Abidjan: ceremonies, events, portraits, films, graphic design and websites.";
// Share previews (WhatsApp, Facebook, X) read only this static HTML and every page has one URL for
// both languages, so the preview text carries French then English. The image does the same.
const shareTitle = "EGC Studio | Photo, vidéo, design et web · Photo, video, design and web";
const shareDescription = `${description} / ${descriptionEn}`;

export const metadata: Metadata = {
  // Absolute base for share previews (WhatsApp, Facebook); otherwise they point at localhost.
  metadataBase: new URL(siteUrl),
  title: { default: "EGC Studio | Photo, vidéo, design et web", template: "%s | EGC Studio" },
  description,
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    siteName: "EGC Studio",
    locale: "fr_FR",
    alternateLocale: ["en_US"],
    title: shareTitle,
    description: shareDescription,
    url: "./",
    images: [{ url: "og.png", width: 1200, height: 630, alt: "EGC Studio, photo, vidéo, design et web / photo, video, design and web" }],
  },
  twitter: { card: "summary_large_image", title: shareTitle, description: shareDescription, images: ["og.png"] },
};

export const viewport: Viewport = { themeColor: "#ffc400" };

// Runs while the HTML is still parsing, before anything is drawn: if the intro already played
// in this visit, mark <html> so the preloader shows a plain dark cover (no artwork) that it then
// fades out quickly.
const bootScript = `(function(){try{if(sessionStorage.getItem(${JSON.stringify(INTRO_SEEN_KEY)}))document.documentElement.dataset.intro="quick"}catch(e){}})()`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "EGC Studio",
  description,
  url: siteUrl,
  image: `${siteUrl}og.png`,
  email: "vegcstudio@gmail.com",
  telephone: "+2250160668682",
  areaServed: "Abidjan, Côte d'Ivoire",
  address: { "@type": "PostalAddress", addressLocality: "Abidjan", addressCountry: "CI" },
  founder: { "@type": "Person", name: "Egu" },
  sameAs: ["https://www.instagram.com/egc_studio225", "https://www.tiktok.com/@egc_studio225"],
  knowsAbout: ["Photographie", "Vidéographie", "Design graphique", "Création de sites web", "Photography", "Videography", "Graphic design", "Web design"],
  availableLanguage: ["fr", "en"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${bricolage.variable} ${script.variable} ${poppins.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="grain min-h-full font-sans">
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        {/* Without JavaScript the intro cannot run, so it must not cover the page */}
        <noscript>
          <style>{"[data-preloader],[data-pre-skip]{display:none!important}"}</style>
        </noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <LangProvider>
          <SmoothScroll />
          <TransitionProvider>
            <Preloader />
            <Nav />
            <main>{children}</main>
            <Footer />
            <Reveals />
            <Interactions />
            <MotionControl />
            <TitleSync />
            <WhatsAppButton />
            <Assistant />
          </TransitionProvider>
        </LangProvider>
      </body>
    </html>
  );
}
