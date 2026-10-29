import { Hero } from "@/components/Hero";
import { Work } from "@/components/Work";
import { Disciplines } from "@/components/Disciplines";
import { Reel } from "@/components/Reel";
import { About } from "@/components/About";
import { Clients } from "@/components/Clients";
import { CtaBand } from "@/components/CtaBand";

export default function Home() {
  return (
    <>
      <Hero />
      <Work mode="teaser" />
      <Disciplines />
      <Reel cta />
      <About mode="teaser" />
      <Clients />
      <CtaBand />
    </>
  );
}
