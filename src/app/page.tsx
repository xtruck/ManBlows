import { Hero } from "@/components/Hero";
import { Work } from "@/components/Work";
import { Reel } from "@/components/Reel";
import { About } from "@/components/About";
import { Clients } from "@/components/Clients";
import { CtaBand } from "@/components/CtaBand";

export default function Home() {
  return (
    <>
      <Hero />
      <Work mode="teaser" />
      <Reel cta />
      <About mode="teaser" />
      <Clients />
      <CtaBand />
    </>
  );
}
