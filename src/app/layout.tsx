import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";
import { Bricolage_Grotesque, Geist, Mrs_Saint_Delafield, Poppins } from "next/font/google";
import { LangProvider } from "@/components/LangProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Preloader } from "@/components/Preloader";
import { TransitionProvider } from "@/components/TransitionProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveals } from "@/components/Reveals";
import { Interactions } from "@/components/Interactions";
import { MotionControl } from "@/components/MotionControl";
import { TitleSync } from "@/components/TitleSync";
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

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteUrl = `https://xtruck.github.io${basePath}/`;
const description = "EGC Studio, photographe, vidéaste et infographiste à Abidjan : cérémonies, événements, portraits, films et design graphique.";

export const metadata: Metadata = {
  // Absolute base for share previews (WhatsApp, Facebook); otherwise they point at localhost.
  metadataBase: new URL(siteUrl),
  title: { default: "EGC Studio | Photo, vidéo et design", template: "%s | EGC Studio" },
  description,
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    siteName: "EGC Studio",
    locale: "fr_FR",
    alternateLocale: ["en_US"],
    title: "EGC Studio | Photo, vidéo et design",
    description,
    url: "./",
    images: [{ url: "og.png", width: 1200, height: 630, alt: "EGC Studio, photo, vidéo et design" }],
  },
  twitter: { card: "summary_large_image", title: "EGC Studio | Photo, vidéo et design", description, images: ["og.png"] },
};

export const viewport: Viewport = { themeColor: "#ffc400" };

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
  knowsAbout: ["Photographie", "Vidéographie", "Design graphique"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // Start downloading the 3D camera right away, in parallel with the scripts, instead of
  // waiting for the hero to mount and ask for it. Saves the preloader a few hundred ms.
  preload(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/models/camera.glb`, { as: "fetch", crossOrigin: "anonymous" });

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${bricolage.variable} ${script.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="grain min-h-full font-sans">
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
          </TransitionProvider>
        </LangProvider>
      </body>
    </html>
  );
}
