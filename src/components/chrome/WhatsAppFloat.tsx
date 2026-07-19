"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { WA } from "@/data/site";

function WaGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path
        d="M16 4.5C9.1 4.5 3.5 9.8 3.5 16.4c0 2.3.7 4.5 2 6.4L4 27.5l5-1.5a13.4 13.4 0 0 0 7 1.9c6.9 0 12.5-5.3 12.5-11.9S22.9 4.5 16 4.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path
        d="M11.4 12.6c0-.7 1.5-2.3 2.1-2.2.5 0 1.6 2 1.7 2.6.1.5-1 1.3-.8 1.8.4 1.3 2.2 3 3.5 3.4.5.2 1.2-.9 1.7-.8.6.1 2.6 1.3 2.6 1.8 0 .7-1.6 2.1-2.2 2.1-1.3.1-4.1-.8-6.3-2.9-2.2-2.1-2.4-4.5-2.3-5.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function WhatsAppFloat() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <a
      href={WA.default}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Zee99 on WhatsApp"
      className={cn(
        "group fixed bottom-5 right-5 z-[55] flex items-center gap-0 sm:bottom-7 sm:right-7",
        "transition-all duration-700 ease-[var(--ease-out-expo)]",
        mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
      )}
    >
      <span className="pointer-events-none mr-3 hidden max-w-0 overflow-hidden whitespace-nowrap rounded-full border border-ink/10 bg-paper py-2.5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink opacity-0 shadow-[0_10px_30px_rgba(23,20,16,0.12)] transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:max-w-[220px] group-hover:px-5 group-hover:opacity-100 sm:block">
        Chat on WhatsApp
      </span>
      <span className="relative flex h-[54px] w-[54px] items-center justify-center rounded-full bg-ink text-[#3ddc75] shadow-[0_12px_32px_rgba(23,20,16,0.28)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-105">
        <span
          className="absolute inset-0 rounded-full border border-gold-2/60"
          style={{ animation: "float-ring 2.8s ease-out infinite" }}
        />
        <WaGlyph className="h-[26px] w-[26px]" />
      </span>
    </a>
  );
}
