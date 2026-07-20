"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------- toast */
type Toast = { id: number; kind: "ok" | "err"; text: string };
const ToastCtx = createContext<(kind: Toast["kind"], text: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const push = useCallback((kind: Toast["kind"], text: string) => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-80 flex-col gap-2">
        {toasts.map((t) => (
          <p
            key={t.id}
            className={cn(
              "border px-4 py-3 font-mono text-[11px] tracking-[0.06em] shadow-lg",
              t.kind === "ok"
                ? "border-ink/15 bg-paper text-ink"
                : "border-red-800/30 bg-[#fdf0ee] text-red-900",
            )}
          >
            {t.text}
          </p>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------------------------------------------------------------- atoms */
export function AdminButton({
  children,
  onClick,
  type = "button",
  variant = "solid",
  disabled,
  busy,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "solid" | "outline" | "ghost" | "danger" | "gold";
  disabled?: boolean;
  busy?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || busy}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.18em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40",
        variant === "solid" && "bg-ink text-paper hover:bg-ink/85",
        variant === "gold" && "bg-gold text-paper hover:bg-gold/85",
        variant === "outline" && "border border-ink/25 text-ink hover:border-ink/60",
        variant === "ghost" && "text-ink-2 hover:text-ink",
        variant === "danger" && "border border-red-800/30 text-red-900 hover:bg-red-900/5",
        className,
      )}
    >
      {busy && (
        <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
  hint,
  className,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-ink-2/70">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full border border-ink/20 bg-white/60 px-3 py-2 text-[13.5px] text-ink outline-none transition-colors focus:border-gold-2 placeholder:text-ink-2/40";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputCls, props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputCls, "leading-relaxed", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputCls, "bg-white/60", props.className)} />;
}

/** Segmented control — a row of mutually exclusive options. Full-width on mobile. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn("inline-flex w-full border border-ink/20 sm:w-auto", className)}>
      {options.map((o, i) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            "flex-1 whitespace-nowrap px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors sm:flex-none sm:px-4",
            i > 0 && "border-l border-ink/20",
            value === o.value ? "bg-ink text-paper" : "text-ink-2 hover:bg-ink/5 hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: "border-green-800/25 bg-green-800/5 text-green-900",
    draft: "border-ink/20 bg-ink/5 text-ink-2",
    booking: "border-gold-2/50 bg-gold/5 text-gold",
    construction: "border-ink/20 bg-ink/5 text-ink-2",
    delivered: "border-green-800/25 bg-green-800/5 text-green-900",
    success: "border-green-800/25 bg-green-800/5 text-green-900",
    failure: "border-red-800/30 bg-red-900/5 text-red-900",
    in_progress: "border-gold-2/50 bg-gold/5 text-gold",
    queued: "border-ink/20 bg-ink/5 text-ink-2",
  };
  return (
    <span
      className={cn(
        "inline-block rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em]",
        map[status] ?? "border-ink/20 text-ink-2",
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}

/** Confirm helper for destructive actions. */
export function useConfirm() {
  return useCallback((message: string) => window.confirm(message), []);
}

/** Warn about unsaved changes on tab close. */
export function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}
