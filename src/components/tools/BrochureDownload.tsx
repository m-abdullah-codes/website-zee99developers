import type { Brochure } from "@/data/projects";

/**
 * Minimal download rail for the payment-plan PDF.
 *
 * Deliberately a plain anchor: the file lives in R2 (or /public) and weighs
 * tens of megabytes, so nothing is requested until a visitor clicks. No
 * prefetch, no preload, no embed — the static export stays the size it was.
 */
export default function BrochureDownload({
  brochure,
  className,
}: {
  brochure?: Brochure;
  className?: string;
}) {
  if (!brochure?.url) return null;
  const label = brochure.label || "Payment plan & brochure";
  const meta = [
    "PDF",
    brochure.bytes ? `${(brochure.bytes / 1e6).toFixed(1)} MB` : null,
    brochure.updated || null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <a
      href={brochure.url}
      download
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center justify-between gap-6 border-t border-ink/10 py-5 transition-colors duration-300 hover:border-ink/25 ${className ?? ""}`}
    >
      <span className="min-w-0">
        <span className="block truncate text-[0.95rem] text-ink transition-colors group-hover:text-gold">
          {label}
        </span>
        <span className="mt-1 block font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-2/80">
          {meta}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2 transition-colors group-hover:text-gold">
        Download
        <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4" fill="none">
          <path
            d="M8 2v9m0 0 3.2-3.2M8 11 4.8 7.8M2.5 13.5h11"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-400 ease-[var(--ease-out-expo)] group-hover:translate-y-[2px]"
          />
        </svg>
      </span>
    </a>
  );
}
