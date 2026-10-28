import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Mrs_Saint_Delafield, Poppins } from "next/font/google";
import { LangProvider } from "@/components/LangProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Preloader } from "@/components/Preloader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

// The two faces below only rebuild the logo: script "egu" and bold italic "studio.".
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
  title: "Egu Studio | Photo et vidéo",
  description: "Egu Studio, photographe et vidéaste : cérémonies, événements, portraits et films.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${bricolage.variable} ${script.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="grain min-h-full font-sans">
        <LangProvider>
          <SmoothScroll />
          <Preloader />
          {children}
        </LangProvider>
      </body>
    </html>
  );
}
