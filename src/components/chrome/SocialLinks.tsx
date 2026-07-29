import { SOCIAL } from "@/data/site";
import { cn } from "@/lib/utils";

// Brand glyphs on a 24x24 grid. Instagram is drawn as an outline (that is its
// actual mark); the rest are solid — at footer size the visual weight matches.
const GLYPHS: Record<string, React.ReactNode> = {
  facebook: (
    <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07Z" />
  ),
  instagram: (
    <>
      <rect x="2.6" y="2.6" width="18.8" height="18.8" rx="5.4" fill="none" stroke="currentColor" strokeWidth="2.1" />
      <circle cx="12" cy="12" r="4.4" fill="none" stroke="currentColor" strokeWidth="2.1" />
      <circle cx="17.5" cy="6.5" r="1.45" />
    </>
  ),
  youtube: (
    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.08 0 12 0 12s0 3.92.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
  ),
  tiktok: (
    <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-1.83-2.48v-3.2a5.78 5.78 0 1 0 4.92 5.7V9.01a7.35 7.35 0 0 0 4.29 1.37V7.3a4.29 4.29 0 0 1-3.23-1.48Z" />
  ),
};

// Anything the client adds in the dashboard that we have no glyph for still
// renders — a generic link mark rather than a hole in the row.
const FALLBACK = (
  <path
    d="M9.5 14.5a4 4 0 0 0 5.66 0l3.18-3.18a4 4 0 0 0-5.66-5.66l-1.06 1.06M14.5 9.5a4 4 0 0 0-5.66 0L5.66 12.68a4 4 0 0 0 5.66 5.66l1.06-1.06"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  />
);

export default function SocialLinks({ className }: { className?: string }) {
  if (!SOCIAL.length) return null;
  return (
    <ul className={cn("flex items-center gap-5", className)}>
      {SOCIAL.map((s) => (
        <li key={s.url}>
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Zee99 Developers on ${s.label}`}
            className="block text-paper/55 transition-colors duration-300 hover:text-gold-3"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-[18px] w-[18px]">
              {GLYPHS[s.label.toLowerCase()] ?? FALLBACK}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
