"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Demo-only capture: no backend is wired yet — connect to the client's
 * mailing provider before launch.
 */
export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (/.+@.+\..+/.test(email)) setDone(true);
      }}
      className="w-full max-w-md"
    >
      <div
        className={cn(
          "flex items-center gap-2 border-b pb-3 transition-colors duration-500",
          done ? "border-gold" : "border-paper/30 focus-within:border-gold-2",
        )}
      >
        {done ? (
          <p className="flex-1 font-mono text-[11px] uppercase tracking-[0.22em] text-gold-3">
            ✓ Noted. One useful message a month.
          </p>
        ) : (
          <>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              aria-label="Email address"
              className="flex-1 bg-transparent font-mono text-[13px] tracking-[0.06em] text-paper outline-none placeholder:text-paper/35"
            />
            <button
              type="submit"
              className="font-mono text-[10px] uppercase tracking-[0.24em] text-gold-3 transition-colors hover:text-paper"
            >
              Subscribe →
            </button>
          </>
        )}
      </div>
    </form>
  );
}
