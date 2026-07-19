"use client";

// Schema-less structured editor for section/settings JSON blocks.
// Strings → inputs (textarea when long), numbers/booleans → typed controls,
// object arrays → repeatable rows, nested objects → fieldsets.
// A raw-JSON toggle covers anything the form can't express (adding keys, etc).

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Field, TextInput, TextArea, inputCls, AdminButton } from "./ui";

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

const clone = (v: Json): Json => JSON.parse(JSON.stringify(v));

function StringControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const long = value.length > 72 || value.includes("\n");
  return long ? (
    <TextArea rows={Math.min(8, Math.ceil(value.length / 70) + 1)} value={value} onChange={(e) => onChange(e.target.value)} />
  ) : (
    <TextInput value={value} onChange={(e) => onChange(e.target.value)} />
  );
}

function ValueControl({
  value,
  onChange,
  label,
}: {
  value: Json;
  onChange: (v: Json) => void;
  label: string;
}) {
  if (typeof value === "string")
    return (
      <Field label={label}>
        <StringControl value={value} onChange={onChange} />
      </Field>
    );
  if (typeof value === "number")
    return (
      <Field label={label}>
        <TextInput
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        />
      </Field>
    );
  if (typeof value === "boolean")
    return (
      <label className="flex items-center gap-2 py-1.5">
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
        <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2">
          {label}
        </span>
      </label>
    );
  if (Array.isArray(value)) return <ArrayControl label={label} value={value} onChange={onChange} />;
  if (value && typeof value === "object")
    return (
      <fieldset className="border border-ink/15 p-4">
        <legend className="px-2 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2">
          {label}
        </legend>
        <ObjectFields value={value} onChange={onChange} />
      </fieldset>
    );
  return (
    <Field label={`${label} (null)`}>
      <TextInput disabled value="null" />
    </Field>
  );
}

function ArrayControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Json[];
  onChange: (v: Json) => void;
}) {
  const template = value.length > 0 ? clone(value[value.length - 1]) : "";
  const blank = (t: Json): Json => {
    if (typeof t === "string") return "";
    if (typeof t === "number") return 0;
    if (typeof t === "boolean") return false;
    if (Array.isArray(t)) return [];
    if (t && typeof t === "object")
      return Object.fromEntries(Object.entries(t).map(([k, v]) => [k, blank(v)]));
    return "";
  };
  return (
    <div className="border border-ink/15">
      <p className="border-b border-ink/10 bg-paper-2/60 px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2">
        {label} · {value.length}
      </p>
      <div className="divide-y divide-ink/10">
        {value.map((item, i) => (
          <div key={i} className="relative p-4 pr-12">
            <div className="absolute right-2 top-2 flex flex-col gap-1">
              <button
                type="button"
                title="Move up"
                disabled={i === 0}
                onClick={() => {
                  const next = [...value];
                  [next[i - 1], next[i]] = [next[i], next[i - 1]];
                  onChange(next);
                }}
                className="px-1 text-ink-2 disabled:opacity-20"
              >
                ↑
              </button>
              <button
                type="button"
                title="Move down"
                disabled={i === value.length - 1}
                onClick={() => {
                  const next = [...value];
                  [next[i + 1], next[i]] = [next[i], next[i + 1]];
                  onChange(next);
                }}
                className="px-1 text-ink-2 disabled:opacity-20"
              >
                ↓
              </button>
              <button
                type="button"
                title="Remove"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="px-1 text-red-900/70 hover:text-red-900"
              >
                ×
              </button>
            </div>
            {typeof item === "object" && item !== null && !Array.isArray(item) ? (
              <ObjectFields
                value={item}
                onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))}
              />
            ) : (
              <ValueControl
                label={`#${i + 1}`}
                value={item}
                onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))}
              />
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-ink/10 p-2">
        <AdminButton variant="ghost" onClick={() => onChange([...value, blank(template)])}>
          + Add row
        </AdminButton>
      </div>
    </div>
  );
}

function ObjectFields({
  value,
  onChange,
}: {
  value: { [k: string]: Json };
  onChange: (v: Json) => void;
}) {
  return (
    <div className="grid gap-4">
      {Object.entries(value).map(([k, v]) => (
        <ValueControl
          key={k}
          label={k}
          value={v}
          onChange={(nv) => onChange({ ...value, [k]: nv })}
        />
      ))}
    </div>
  );
}

export default function JsonEditor({
  value,
  onChange,
}: {
  value: Json;
  onChange: (v: Json) => void;
}) {
  const [raw, setRaw] = useState(false);
  const [rawText, setRawText] = useState("");
  const [rawErr, setRawErr] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => {
            if (!raw) setRawText(JSON.stringify(value, null, 2));
            setRaw(!raw);
            setRawErr(null);
          }}
          className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-2 underline decoration-ink/30 underline-offset-4 hover:text-ink"
        >
          {raw ? "← Form view" : "Raw JSON"}
        </button>
      </div>
      {raw ? (
        <div>
          <textarea
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value);
              try {
                onChange(JSON.parse(e.target.value));
                setRawErr(null);
              } catch {
                setRawErr("Invalid JSON — fix before saving.");
              }
            }}
            rows={Math.min(28, rawText.split("\n").length + 2)}
            spellCheck={false}
            className={cn(inputCls, "font-mono text-[12px] leading-relaxed")}
          />
          {rawErr && <p className="mt-1 text-[11px] text-red-900">{rawErr}</p>}
        </div>
      ) : typeof value === "object" && value !== null && !Array.isArray(value) ? (
        <ObjectFields value={value} onChange={onChange} />
      ) : (
        <ValueControl label="value" value={value} onChange={onChange} />
      )}
    </div>
  );
}

export type { Json };
