import { cn } from "@/lib/utils";

/**
 * The one cue this document uses to say "these are buttons".
 *
 * A drawing covered in numbered pills does not say the pills are pressable,
 * and neither does a card that happens to have a picture on it. On a desktop
 * the cursor answers the question the moment it crosses one; on a phone there
 * is no cursor, and nothing on a page whose whole visual language is *print*
 * looks like a control. So the page says it, once, in the reader's own verb.
 *
 * Written as a plain chip rather than a positioned overlay: the plans hang it
 * off the bottom of the plate, the residences sit it under the section head,
 * and both want the same object in a different place.
 */
export default function TapCue({
  children,
  tone = "ink",
  className,
}: {
  children: React.ReactNode;
  /** `ink` reads over a drawing or a render; `paper` over the page itself. */
  tone?: "ink" | "paper";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 px-4 py-2.5",
        tone === "ink"
          ? "bg-ink/95 text-paper shadow-[0_14px_34px_-16px_color-mix(in_srgb,var(--color-ink)_75%,transparent)]"
          : "border border-gold-2/50 bg-gold/8 text-ink",
        className,
      )}
    >
      <span className="relative grid h-[22px] w-[22px] shrink-0 place-items-center">
        <span
          className={cn(
            "tap-cue-ring h-4 w-4 rounded-full border",
            tone === "ink" ? "border-gold-3" : "border-gold",
          )}
        />
        <svg viewBox="0 0 20 20" className={cn("tap-cue-arrow h-[15px] w-[15px]", tone === "paper" && "text-gold")}>
          <path
            d="M3.4 2.5 L3.4 15.6 L6.7 12.5 L8.8 17.2 L11.2 16.1 L9.1 11.5 L13.7 11.2 Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="font-mono text-[9px] uppercase leading-[1.6] tracking-[0.16em] sm:text-[9.5px] sm:tracking-[0.2em]">
        {children}
      </span>
    </span>
  );
}

/** The same instruction in the reader's own verb: a mouse clicks, a thumb taps. */
export function Verb({ capital = true }: { capital?: boolean }) {
  return (
    <>
      <span className="[@media(hover:none)]:hidden">{capital ? "Click" : "click"}</span>
      <span className="[@media(hover:hover)]:hidden">{capital ? "Tap" : "tap"}</span>
    </>
  );
}
