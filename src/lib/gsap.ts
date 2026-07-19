import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: "power4.out", duration: 1 });
}

export const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger, SplitText };
