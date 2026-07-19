import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/data/projects";

export default function StatusPill({
  status,
  label,
  onImage = false,
  className,
}: {
  status: ProjectStatus;
  label: string;
  onImage?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border px-4 py-[9px] font-mono text-[9.5px] uppercase tracking-[0.24em]",
        onImage
          ? "border-paper/25 bg-night/55 text-paper backdrop-blur-md"
          : "border-ink/20 bg-transparent text-ink",
        className,
      )}
    >
      {status === "booking" && (
        <span className="pulse-dot h-[6px] w-[6px] rounded-full bg-gold-2" />
      )}
      {label}
    </span>
  );
}
