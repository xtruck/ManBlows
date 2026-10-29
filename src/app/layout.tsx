import type { Metadata } from "next";
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

export const metadata: Metadata = {
  // Absolute base for share previews (WhatsApp, Facebook); otherwise they point at localhost.
  metadataBase: new URL(`https://xtruck.github.io${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/`),
  title: { default: "EGC Studio | Photo et vidéo", template: "%s | EGC Studio" },
  description: "EGC Studio, photographe et vidéaste : cérémonies, événements, portraits et films.",
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
        <LangProvider>
          <SmoothScroll />
          <TransitionProvider>
            <Preloader />
            <Nav />
            <main>{children}</main>
            <Footer />
            <Reveals />
            <Interactions />
          </TransitionProvider>
        </LangProvider>
      </body>
    </html>
  );
}
