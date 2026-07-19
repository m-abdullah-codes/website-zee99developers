"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/Logo";
import { NAV, SITE, WA } from "@/data/site";
import { getLenis } from "@/components/motion/SmoothScroll";

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState(false);
  const lastY = useRef(0);
  const hiddenRef = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    const setOffset = (h: boolean) =>
      root.style.setProperty("--nav-offset", h ? "0px" : "73px");
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      const d = y - lastY.current;
      let h = hiddenRef.current;
      // Smooth-scroll deltas taper to ~0 as motion settles; only flip on a real move.
      if (Math.abs(d) > 3) h = y > 600 && d > 0;
      else if (y <= 600) h = false;
      if (h !== hiddenRef.current) {
        hiddenRef.current = h;
        setHidden(h);
        // Let the sticky anchor bar ride up with the header instead of leaving a gap.
        setOffset(h);
      }
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      root.style.setProperty("--nav-offset", "73px");
    };
  }, []);

  useEffect(() => setMenu(false), [pathname]);

  useEffect(() => {
    const lenis = getLenis();
    if (menu) {
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.documentElement.style.overflow = "";
    }
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
    };
  }, [menu]);

  const overDark =
    !scrolled &&
    !menu &&
    (pathname === "/" || /^\/projects\/[^/]+$/.test(pathname));
  const light = overDark || menu;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[70] transition-transform duration-500 ease-[var(--ease-out-expo)]",
          hidden && !menu && "-translate-y-full",
        )}
      >
        <div
          className={cn(
            "border-b transition-[background-color,border-color] duration-500",
            scrolled && !menu
              ? "border-ink/10 bg-paper/85 backdrop-blur-xl"
              : "border-transparent bg-transparent",
          )}
        >
          <div className="container-x flex h-[74px] items-center justify-between">
            <Link href="/" aria-label="Zee99 Developers — home" className="relative z-10">
              <Logo tone={light ? "paper" : "ink"} />
            </Link>

            <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 lg:flex">
              {NAV.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative font-mono text-[10.5px] uppercase tracking-[0.28em] transition-colors duration-300",
                      light
                        ? active
                          ? "text-gold-3"
                          : "text-paper/75 hover:text-paper"
                        : active
                          ? "text-gold"
                          : "text-ink-2 hover:text-ink",
                    )}
                  >
                    {item.label}
                    {active && (
                      <span
                        className={cn(
                          "absolute -bottom-2 left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full",
                          light ? "bg-gold-3" : "bg-gold",
                        )}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <a
                href={WA.default}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "btn btn-md hidden sm:inline-flex",
                  light ? "btn-light" : "btn-outline",
                )}
              >
                <span className="relative z-10">WhatsApp Us</span>
              </a>
              <button
                type="button"
                onClick={() => setMenu((m) => !m)}
                aria-label={menu ? "Close menu" : "Open menu"}
                aria-expanded={menu}
                className="relative z-10 flex h-11 w-11 items-center justify-center lg:hidden"
              >
                <span className="relative block h-[10px] w-[22px]">
                  <span
                    className={cn(
                      "absolute left-0 top-0 h-px w-full transition-all duration-400 ease-[var(--ease-out-expo)]",
                      light ? "bg-paper" : "bg-ink",
                      menu && "top-[5px] rotate-45",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute bottom-0 left-0 h-px w-full transition-all duration-400 ease-[var(--ease-out-expo)]",
                      light ? "bg-paper" : "bg-ink",
                      menu && "bottom-[4px] -rotate-45",
                    )}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-[60] flex flex-col bg-night text-paper transition-[opacity,visibility] duration-500 lg:hidden",
          menu ? "visible opacity-100" : "invisible opacity-0",
        )}
        aria-hidden={!menu}
      >
        <div className="container-x flex flex-1 flex-col justify-center pb-12 pt-24">
          <p
            className={cn(
              "eyebrow mb-9 text-paper/35 transition-all duration-500 ease-[var(--ease-out-expo)]",
              menu ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
            style={{ transitionDelay: menu ? "80ms" : "0ms" }}
          >
            Menu
          </p>
          <nav className="border-b border-paper/10">
            {NAV.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between border-t border-paper/10 py-[18px] transition-all duration-600 ease-[var(--ease-out-expo)]",
                  menu ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
                )}
                style={{ transitionDelay: menu ? `${140 + i * 65}ms` : "0ms" }}
              >
                <span className="flex items-baseline gap-4">
                  <span className="font-mono text-[10px] tracking-[0.24em] text-gold-2">
                    0{i + 1}
                  </span>
                  <span className="font-display text-[1.7rem] font-[400] leading-none tracking-[-0.01em] text-paper transition-colors duration-300 group-hover:text-gold-3">
                    {item.label}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="font-mono text-[13px] text-paper/25 transition-all duration-400 ease-[var(--ease-out-expo)] group-hover:translate-x-1 group-hover:text-gold-3"
                >
                  →
                </span>
              </Link>
            ))}
          </nav>
          <div
            className={cn(
              "mt-11 flex flex-col gap-6 transition-all duration-600 ease-[var(--ease-out-expo)]",
              menu ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
            )}
            style={{ transitionDelay: menu ? "440ms" : "0ms" }}
          >
            <a href={WA.default} target="_blank" rel="noopener noreferrer" className="btn btn-md btn-gold self-start">
              <span className="relative z-10">WhatsApp {SITE.phoneDisplay}</span>
            </a>
            <p className="font-mono text-[9.5px] uppercase leading-[2.3] tracking-[0.22em] text-paper/40">
              {SITE.address}
              <br />
              {SITE.email}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
