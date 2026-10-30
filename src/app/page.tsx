import { Hero } from "@/components/Hero";
import { Work } from "@/components/Work";
import { Disciplines } from "@/components/Disciplines";
import { Offers } from "@/components/Offers";
import { Showreel } from "@/components/Showreel";
import { About } from "@/components/About";
import { Clients } from "@/components/Clients";
import { CtaBand } from "@/components/CtaBand";

export default function Home() {
  return (
    <>
      <Hero />
      <Work mode="teaser" />
      <Disciplines />
      <Offers />
      <Showreel cta />
      <About mode="teaser" />
      <Clients />
      <CtaBand />
    </>
  );
}
