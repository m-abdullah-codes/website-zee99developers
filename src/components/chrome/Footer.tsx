import Link from "next/link";
import Logo from "@/components/ui/Logo";
import Em from "@/components/ui/Em";
import { NAV, SITE, WA, waLink } from "@/data/site";
import { LIFESTYLE } from "@/data/projects";

export default function Footer() {
  const parts = SITE.address.split(", ");
  const addressLines =
    parts.length > 2 ? [parts[0], parts[1], parts.slice(2).join(", ")] : parts;
  return (
    <footer className="relative overflow-hidden bg-night text-paper">
      <div className="container-x relative pt-20 pb-8 sm:pt-28">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Logo tone="paper" />
            <p className="mt-8 max-w-sm font-display text-[1.7rem] leading-[1.35] font-[360] text-paper/90">
              <Em text={SITE.tagline} emClass="text-gold-3" />
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="eyebrow mb-6 text-paper/40">Explore</p>
              <ul className="space-y-3.5 font-mono text-[11px] uppercase tracking-[0.22em]">
                {NAV.filter((n) => n.href !== "/").map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="text-paper/70 transition-colors hover:text-gold-3">
                      {n.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a href={WA.default} target="_blank" rel="noopener noreferrer" className="text-paper/70 transition-colors hover:text-gold-3">
                    Contact
                  </a>
                </li>
                <li>
                  <Link href="/privacy" className="text-paper/70 transition-colors hover:text-gold-3">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-6 text-paper/40">Visit</p>
              <p className="font-mono text-[11px] uppercase leading-[2.3] tracking-[0.18em] text-paper/70">
                {addressLines.map((line, i) => (
                  <span key={line}>
                    {line}
                    {i < addressLines.length - 1 && (
                      <>
                        ,<br />
                      </>
                    )}
                  </span>
                ))}
              </p>
              <a
                href={SITE.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-mono mt-5 text-gold-3"
              >
                Get directions
              </a>
            </div>
            <div>
              <p className="eyebrow mb-6 text-paper/40">Talk</p>
              <p className="font-mono text-[11px] uppercase leading-[2.3] tracking-[0.18em] text-paper/70">
                <a href={waLink()} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-gold-3">
                  WA {SITE.phoneDisplay}
                </a>
                <br />
                <a href={`mailto:${SITE.email}`} className="normal-case transition-colors hover:text-gold-3">
                  {SITE.email}
                </a>
              </p>
            </div>
          </div>
        </div>

        <p
          aria-hidden
          className="pointer-events-none mt-20 select-none text-center font-display text-[clamp(6rem,19vw,19rem)] leading-[0.78] font-[380] text-transparent"
          style={{ WebkitTextStroke: "1px rgba(246,242,233,0.14)" }}
        >
          ZEE99
        </p>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-paper/10 pt-7 sm:flex-row">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-paper/35">
            © {new Date().getFullYear()} {SITE.name}
          </p>
          <Link
            href={`/projects/${LIFESTYLE.slug}`}
            className="group inline-flex items-center gap-3 font-mono text-[9.5px] uppercase tracking-[0.24em] text-paper/55 transition-colors hover:text-gold-3"
          >
            <span className="pulse-dot h-[5px] w-[5px] rounded-full bg-gold-2" />
            Now booking — {LIFESTYLE.name}
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
