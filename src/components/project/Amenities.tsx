import SectionHead from "@/components/ui/SectionHead";
import Fold from "@/components/ui/Fold";
import Reveal from "@/components/motion/Reveal";
import Plate from "@/components/ui/Plate";
import type { AmenityMedia } from "@/data/projects";

const TITLE = (
  <>
    Built in, <em className="italic text-gold">not bolted on.</em>
  </>
);

const ICONS: Record<string, React.ReactNode> = {
  terrace: (
    <>
      <path d="M4 20V9l8-5 8 5v11" />
      <path d="M4 13h16M8 20v-4m4 4v-4m4 4v-4" />
    </>
  ),
  pool: (
    <>
      <path d="M3 16c1.6 1.3 3.4 1.3 5 0s3.4-1.3 5 0 3.4 1.3 5 0" />
      <path d="M3 20c1.6 1.3 3.4 1.3 5 0s3.4-1.3 5 0 3.4 1.3 5 0" />
      <path d="M14 13V6a2 2 0 0 1 4 0M9 13V6a2 2 0 0 1 4 0" />
    </>
  ),
  gym: (
    <>
      <path d="M7 9v6M17 9v6M4 11v2M20 11v2" />
      <path d="M7 12h10" />
    </>
  ),
  parking: (
    <>
      <rect x="4" y="4" width="16" height="16" />
      <path d="M10 16V8h3.2a2.4 2.4 0 0 1 0 4.8H10" />
    </>
  ),
  security: (
    <>
      <path d="M12 3 5 6v5c0 5 3 8.4 7 10 4-1.6 7-5 7-10V6l-7-3Z" />
      <path d="M9.2 12l2 2 3.6-4" />
    </>
  ),
  retail: (
    <>
      <path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
  power: <path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z" />,
  lift: (
    <>
      <rect x="5" y="3" width="14" height="18" />
      <path d="M9.5 10l2-2.5 2 2.5M9.5 15l2 2.5 2-2.5" />
    </>
  ),
  lobby: (
    <>
      <path d="M4 18v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5" />
      <path d="M4 18h16M7 11V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" />
    </>
  ),
};

// Editable in the dashboard via project.amenityMedia; falls back to the
// original renders so the section always has its two gallery images.
const MEDIA_FALLBACK: AmenityMedia[] = [
  {
    image: "/images/projects/zee99-lifestyle/rooftop-cinema.webp",
    alt: "Rooftop cinema at dusk — tiered lounge seating facing the screen, a torch-lit terrace, planted pergola and the city beyond",
    captionLeft: "Rooftop cinema — dusk render",
    captionRight: "The roof",
  },
  {
    image: "/images/projects/terrace-interior.jpg",
    alt: "Terrace interior looking out",
    captionLeft: "Private terrace — every unit",
    captionRight: "Typ.",
  },
];

export default function Amenities({
  items,
  media,
  no = "05",
  fold = false,
}: {
  items: { id: string; label: string }[];
  media?: AmenityMedia[];
  no?: string;
  /** The e-brochure folds this section shut; the project page never does. */
  fold?: boolean;
}) {
  const m0 = media?.[0] ?? MEDIA_FALLBACK[0];
  const m1 = media?.[1] ?? MEDIA_FALLBACK[1];

  const body = (
    <>
      {/* The tile plate is short and the two renders beside it are tall, so
            on a desktop the left column used to run out two-thirds of the way
            down and leave the rest of the row empty. It now pins instead: the
            nine amenities hold their place while the renders travel past them,
            which is the same move the overview and the FAQs already make. */}
        <div className="grid items-start gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="grid grid-cols-2 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-3">
            {items.map((a, i) => (
              <Reveal
                key={a.id}
                delay={(i % 3) * 0.06}
                className="group relative flex flex-col gap-5 bg-paper p-6 transition-colors duration-500 hover:bg-paper-2 sm:p-7"
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gold transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-x-100"
                />
                <span className="flex items-start justify-between gap-3">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-7 w-7 shrink-0 text-ink-2 transition-colors duration-500 group-hover:text-gold"
                    aria-hidden
                  >
                    {ICONS[a.id] ?? <circle cx="12" cy="12" r="8" />}
                  </svg>
                  <span className="font-mono text-[9px] tracking-[0.14em] text-ink-2/40 transition-colors duration-500 group-hover:text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </span>
                <span className="font-mono text-[10px] uppercase leading-[1.7] tracking-[0.2em] text-ink">
                  {a.label}
                </span>
              </Reveal>
            ))}
            {/* keep the 2-col mobile grid even — hidden once it's 3 cols on sm+ */}
            {items.length % 2 === 1 && (
              <Reveal className="group flex flex-col gap-5 bg-paper p-6 transition-colors duration-500 hover:bg-paper-2 sm:hidden">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-7 w-7 text-ink-2 transition-colors duration-500 group-hover:text-gold"
                  aria-hidden
                >
                  <rect x="8" y="3" width="8" height="18" rx="1" />
                  <circle cx="12" cy="7.5" r="1.4" />
                  <path d="M10 12h4M10 15h4" />
                </svg>
                <span className="font-mono text-[10px] uppercase leading-[1.7] tracking-[0.2em] text-ink">
                  Video intercom
                </span>
              </Reveal>
            )}
          </div>
          <p className="mt-6 max-w-[40ch] border-l-2 border-gold-2 pl-4 text-[0.95rem] leading-[1.8] text-ink-2">
            Every one of them is handed over with the apartment. None of it is an
            optional extra, and none of it is charged for twice.
          </p>
          </div>
          <div className="grid gap-6 lg:content-start">
            <Reveal>
              <Plate
                src={m0.image}
                alt={m0.alt}
                ratio="aspect-[16/9]"
                zoom
                sizes="(max-width: 1024px) 100vw, 50vw"
                caption={{ left: m0.captionLeft, right: m0.captionRight }}
              />
            </Reveal>
            <Reveal delay={0.1} className="lg:w-[74%] lg:justify-self-end">
              <Plate
                src={m1.image}
                alt={m1.alt}
                ratio="aspect-[3/4]"
                zoom
                sizes="(max-width: 1024px) 80vw, 36vw"
                caption={{ left: m1.captionLeft, right: m1.captionRight }}
              />
            </Reveal>
          </div>
        </div>
    </>
  );

  if (fold) {
    return (
      <Fold
        id="amenities"
        no={no}
        label="Amenities"
        title={TITLE}
        peek={`${items.length} amenities · handed over with the apartment`}
        className="bg-paper-2/55"
      >
        {body}
      </Fold>
    );
  }

  return (
    <section id="amenities" className="border-t border-ink/10 bg-paper-2/55 py-24 md:py-32">
      <div className="container-x">
        <SectionHead no={no} label="Amenities" title={TITLE} className="mb-16" />
        {body}
      </div>
    </section>
  );
}
