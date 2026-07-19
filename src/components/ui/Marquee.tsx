import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function Marquee({
  children,
  speed = 36,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden", className)}>
      <div
        className="marquee-track"
        style={{ "--marquee-speed": `${speed}s` } as React.CSSProperties}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
