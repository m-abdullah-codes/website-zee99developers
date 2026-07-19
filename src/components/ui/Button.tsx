import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  href?: string;
  external?: boolean;
  variant?: "primary" | "outline" | "gold" | "light";
  size?: "md" | "lg";
  arrow?: boolean;
  className?: string;
  ariaLabel?: string;
};

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path d="M1 8h13M9.5 3 14.5 8l-5 5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export default function Button({
  children,
  href,
  external,
  variant = "primary",
  size = "lg",
  arrow,
  className,
  ariaLabel,
}: Props) {
  const cls = cn("btn", `btn-${size}`, `btn-${variant}`, className);
  const inner = (
    <>
      <span className="relative z-10">{children}</span>
      {arrow && <ArrowRight className="btn-arrow relative z-10 h-[12px] w-[12px]" />}
    </>
  );
  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} aria-label={ariaLabel}>
        {inner}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} className={cls} aria-label={ariaLabel}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} aria-label={ariaLabel}>
      {inner}
    </button>
  );
}
