import Hero from "@/components/home/Hero";
import Statement from "@/components/home/Statement";
import StatBand from "@/components/home/StatBand";
import Featured from "@/components/home/Featured";
import TrackRecord from "@/components/home/TrackRecord";
import CalcBand from "@/components/home/CalcBand";
import Overseas from "@/components/home/Overseas";
import Pillars from "@/components/home/Pillars";
import BlogTeaser from "@/components/home/BlogTeaser";
import ClosingCTA from "@/components/home/ClosingCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Statement />
      <StatBand />
      <Featured />
      <TrackRecord />
      <CalcBand />
      <Overseas />
      <Pillars />
      <BlogTeaser />
      <ClosingCTA />
    </>
  );
}
