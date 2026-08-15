"use client";

/**
 * The small editing controls the brochure views are built from.
 *
 * Kept together because the brochure is mostly the same three shapes over and
 * over — a line of copy, a list you can reorder, and a picture — and building
 * each tab out of one set of them is what makes the whole editor feel like one
 * thing rather than six forms.
 */

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { AdminButton, Field, TextArea, TextInput, inputCls, useConfirm } from "../../ui";
import Em from "@/components/ui/Em";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ layout */

/** One titled block inside a tab. */
export function Panel({
  title,
  hint,
  aside,
  children,
  className,
}: {
  title: string;
  hint?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-ink/15 bg-white/40", className)}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/12 bg-paper-2/50 px-5 py-3.5">
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink">{title}</h3>
          {hint && <p className="mt-1.5 max-w-2xl text-[11.5px] leading-relaxed text-ink-2">{hint}</p>}
        </div>
        {aside}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

/** What the page will actually render, under the field that writes it. */
export function EmPreview({ text, dark = false }: { text: string; dark?: boolean }) {
  if (!text.includes("*")) return null;
  return (
    <p className="mt-2 border-l-2 border-gold-2/60 pl-3 font-display text-[1.05rem] font-[400] leading-snug text-ink">
      <Em text={text} emClass={dark ? "italic text-gold-2" : "italic text-gold"} />
    </p>
  );
}

/**
 * A headline field. The client writes `*like this*` to get the gold italic the
 * prospectus uses, so the rendered line sits right under the box — nobody
 * should have to publish to find out where the italic landed.
 */
export function EmField({
  label,
  value,
  onChange,
  hint,
  dark,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  dark?: boolean;
}) {
  return (
    <div>
      <Field label={label} hint={hint ?? "Wrap words in *asterisks* for the gold italic."}>
        <TextArea rows={2} value={value} onChange={(e) => onChange(e.target.value)} />
      </Field>
      <EmPreview text={value} dark={dark} />
    </div>
  );
}

/* ------------------------------------------------------------------- media */

/** A picture or a video, with its own thumbnail and a route into the library. */
export function MediaField({
  label,
  value,
  onChange,
  onPick,
  kind = "image",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onPick: () => void;
  kind?: "image" | "video";
  hint?: string;
}) {
  const [broken, setBroken] = useState(false);
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-start gap-3">
        <div className="relative h-16 w-24 shrink-0 overflow-hidden border border-ink/15 bg-paper-2">
          {value && kind === "image" && !broken ? (
            <Image
              src={value}
              alt=""
              fill
              sizes="96px"
              className="object-cover"
              unoptimized
              onError={() => setBroken(true)}
            />
          ) : (
            <span className="flex h-full items-center justify-center px-1 text-center font-mono text-[8px] uppercase leading-tight tracking-[0.14em] text-ink-2/60">
              {value ? (broken ? "Not found" : kind) : "None"}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <input
            value={value}
            onChange={(e) => {
              setBroken(false);
              onChange(e.target.value);
            }}
            placeholder="/images/… or an R2 URL"
            className={cn(inputCls, "font-mono text-[11.5px]")}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <AdminButton variant="outline" onClick={onPick} className="px-3 py-1.5">
              Pick from library
            </AdminButton>
            {value && (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-2 hover:text-gold"
              >
                Open ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </Field>
  );
}

/* -------------------------------------------------------------------- list */

/**
 * The wrapper every repeatable list uses: a numbered card with move / duplicate
 * / delete, and one "add" button under the stack. `title` is what the row is
 * called on the page, so a client scanning the editor can find the row they saw
 * in the brochure without opening it.
 */
export function RowCard({
  index,
  count,
  title,
  subtitle,
  onMove,
  onDuplicate,
  onRemove,
  removeLabel,
  children,
}: {
  index: number;
  count: number;
  title: ReactNode;
  subtitle?: ReactNode;
  onMove: (dir: -1 | 1) => void;
  onDuplicate?: () => void;
  onRemove: () => void;
  removeLabel?: string;
  children: ReactNode;
}) {
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-ink/15 bg-white/50">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-ink/10 bg-paper-2/40 px-4 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-baseline gap-3 text-left"
        >
          <span className="font-mono text-[10px] tracking-[0.16em] text-gold">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] font-medium text-ink">
              {title || <span className="text-ink-2/60">Untitled</span>}
            </span>
            {subtitle && (
              <span className="mt-0.5 block truncate font-mono text-[10px] tracking-[0.08em] text-ink-2">
                {subtitle}
              </span>
            )}
          </span>
          <span
            aria-hidden
            className={cn(
              "relative h-[11px] w-[11px] shrink-0 transition-transform duration-300",
              open && "rotate-45",
            )}
          >
            <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-ink-2" />
            <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-ink-2" />
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <IconBtn label="Move up" disabled={index === 0} onClick={() => onMove(-1)}>
            ↑
          </IconBtn>
          <IconBtn label="Move down" disabled={index === count - 1} onClick={() => onMove(1)}>
            ↓
          </IconBtn>
          {onDuplicate && (
            <IconBtn label="Duplicate" onClick={onDuplicate}>
              ⧉
            </IconBtn>
          )}
          <IconBtn
            label="Remove"
            danger
            onClick={() => {
              if (confirm(removeLabel ?? "Remove this row from the brochure?")) onRemove();
            }}
          >
            ×
          </IconBtn>
        </div>
      </div>
      {open && <div className="grid gap-4 p-4">{children}</div>}
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "flex h-7 w-7 items-center justify-center border text-[13px] leading-none transition-colors disabled:opacity-25",
        danger
          ? "border-red-800/25 text-red-900 hover:bg-red-900/5"
          : "border-ink/20 text-ink-2 hover:border-ink/50 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

/** Add button with the same voice everywhere. */
export function AddRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <AdminButton variant="outline" onClick={onClick}>
      + {label}
    </AdminButton>
  );
}

/* ------------------------------------------------------------------- chips */

/**
 * A list of short strings — brand names, amenity items. They are chips rather
 * than one comma-separated box because the page renders each as its own tile,
 * and a stray comma in a box would silently split a name in two.
 */
export function ChipList({
  label,
  values,
  onChange,
  placeholder = "Add and press Enter",
  hint,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [draft, setDraft] = useState("");
  const commit = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...values, v]);
    setDraft("");
  };
  return (
    <Field label={`${label} · ${values.length}`} hint={hint}>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className="group inline-flex items-center gap-1.5 border border-ink/15 bg-paper-2/60 py-1 pl-2.5 pr-1"
          >
            <input
              value={v}
              onChange={(e) => onChange(values.map((x, j) => (j === i ? e.target.value : x)))}
              size={Math.max(v.length, 4)}
              className="bg-transparent font-mono text-[11px] text-ink outline-none"
            />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              aria-label={`Remove ${v}`}
              className="flex h-4 w-4 items-center justify-center text-[13px] leading-none text-ink-2/50 hover:text-red-900"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            }
            if (e.key === "Backspace" && !draft && values.length) {
              onChange(values.slice(0, -1));
            }
          }}
          onBlur={commit}
          placeholder={placeholder}
          className="min-w-[10rem] flex-1 border border-dashed border-ink/20 bg-transparent px-2.5 py-1 font-mono text-[11px] text-ink outline-none placeholder:text-ink-2/40 focus:border-gold-2"
        />
      </div>
    </Field>
  );
}

/** Plain single-line copy field, so tabs don't each re-declare one. */
export function Line({
  label,
  value,
  onChange,
  hint,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <Field label={label} hint={hint}>
      <TextInput
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={mono ? "font-mono text-[11.5px]" : undefined}
      />
    </Field>
  );
}

/** Paragraph copy. */
export function Para({
  label,
  value,
  onChange,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <TextArea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}
