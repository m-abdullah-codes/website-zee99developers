import type { Metadata } from "next";
import { pageMeta } from "@/data/content";
import Hero from "@/components/home/Hero";
import Statement from "@/components/home/Statement";
import StatBand from "@/components/home/StatBand";
import Featured from "@/components/home/Featured";
import TrackRecord from "@/components/home/TrackRecord";
import Overseas from "@/components/home/Overseas";
import Pillars from "@/components/home/Pillars";
import BlogTeaser from "@/components/home/BlogTeaser";
import ClosingCTA from "@/components/home/ClosingCTA";

export const metadata: Metadata = pageMeta("/");

export default function Home() {
  return (
    <>
      <Hero />
      <Statement />
      <StatBand />
      <Featured />
      <TrackRecord />
      <Overseas />
      <Pillars />
      <BlogTeaser />
      <ClosingCTA />
    </>
  );
}
