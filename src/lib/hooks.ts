"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReduced } from "@/lib/gsap";

/** Animates numeric changes so results feel alive instead of snapping. */
export function useTweened(value: number, duration = 0.7): number {
  const [display, setDisplay] = useState(value);
  const obj = useRef({ v: value });

  useEffect(() => {
    if (prefersReduced()) {
      obj.current.v = value;
      setDisplay(value);
      return;
    }
    const tween = gsap.to(obj.current, {
      v: value,
      duration,
      ease: "power3.out",
      onUpdate: () => setDisplay(obj.current.v),
    });
    return () => {
      tween.kill();
    };
  }, [value, duration]);

  return display;
}
