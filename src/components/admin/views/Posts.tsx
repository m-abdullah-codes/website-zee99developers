"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, type PostListRow, type PostRow, type MediaItem } from "../api";
import {
  AdminButton,
  Field,
  Segmented,
  StatusBadge,
  TextArea,
  TextInput,
  inputCls,
  useConfirm,
  useToast,
  useUnsavedFieldToast,
  useUnsavedGuard,
} from "../ui";
import { MediaPickerModal } from "./Media";
import { RichTextEditor } from "../RichTextEditor";
import { mdToHtml } from "@/lib/markdown";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------- list */
export function PostsList({ nav }: { nav: (hash: string) => void }) {
  const [rows, setRows] = useState<PostListRow[] | null>(null);
  const toast = useToast();

  useEffect(() => {
    api
      .get<PostListRow[]>("/admin/posts")
      .then(setRows)
      .catch((e) => toast("err", e.message));
  }, [toast]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-[1.8rem] font-[400] text-ink">Blog posts</h2>
        <AdminButton variant="gold" onClick={() => nav("#/posts/new")}>
          + New post
        </AdminButton>
      </div>
      {rows === null ? (
        <p className="text-[13px] text-ink-2">Loading…</p>
      ) : (
        <div className="overflow-x-auto border border-ink/15">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead className="border-b border-ink/10 bg-paper-2/60 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-2">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {rows.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => nav(`#/posts/${p.id}`)}
                  className="cursor-pointer transition-colors hover:bg-gold/5"
                >
                  <td className="px-4 py-3.5">
                    <span className="font-medium text-ink">{p.title || "(untitled)"}</span>
                    {!!p.featured && (
                      <span className="ml-2 rounded-full border border-gold-2/60 px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-gold">
                        Featured
                      </span>
                    )}
                    <span className="mt-0.5 block font-mono text-[10px] text-ink-2/70">
                      /blog/{p.slug}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-ink-2">{p.category}</td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-ink-2">{p.date_iso}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-ink-2">
                    {p.updated_at.slice(0, 16)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------- markdown toolbar */
type ToolbarKind =
  | "bold"
  | "italic"
  | "code"
  | "h2"
  | "h3"
  | "quote"
  | "bullet"
  | "numbered"
  | "link"
  | "table";

type Sel = { value: string; start: number; end: number };
type Result = { value: string; start: number; end: number };

const lineRange = (value: string, pos: number): [number, number] => {
  const start = value.lastIndexOf("\n", pos - 1) + 1;
  let end = value.indexOf("\n", pos);
  if (end === -1) end = value.length;
  return [start, end];
};

const wrapInline = (sel: Sel, before: string, after: string, placeholder: string): Result => {
  const { value, start, end } = sel;
  const text = value.slice(start, end) || placeholder;
  return {
    value: value.slice(0, start) + before + text + after + value.slice(end),
    start: start + before.length,
    end: start + before.length + text.length,
  };
};

const prefixLine = (sel: Sel, marker: (line: string) => string): Result => {
  const { value, start } = sel;
  const [ls, le] = lineRange(value, start);
  const newLine = marker(value.slice(ls, le));
  const delta = newLine.length - (le - ls);
  return {
    value: value.slice(0, ls) + newLine + value.slice(le),
    start: sel.start + delta,
    end: sel.end + delta,
  };
};

const prefixBlock = (sel: Sel, prefix: (line: string) => string): Result => {
  const { value, start, end } = sel;
  const [bs] = lineRange(value, start);
  const [, be] = lineRange(value, Math.max(end - 1, start));
  const newBlock = value
    .slice(bs, be)
    .split("\n")
    .map(prefix)
    .join("\n");
  return { value: value.slice(0, bs) + newBlock + value.slice(be), start: bs, end: bs + newBlock.length };
};

const insertAt = (value: string, pos: number, text: string): Result => ({
  value: value.slice(0, pos) + text + value.slice(pos),
  start: pos + text.length,
  end: pos + text.length,
});

function ToolbarBtn({
  label,
  title,
  onClick,
  className,
}: {
  label: string;
  title: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      // Toolbar acts on the textarea's current selection — losing focus first would clear it.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 min-w-[34px] items-center justify-center border border-ink/15 px-2 font-mono text-[11px] text-ink-2 transition-colors hover:border-ink/40 hover:text-ink",
        className,
      )}
    >
      {label}
    </button>
  );
}

function MarkdownToolbar({
  onAction,
  onInsertImage,
}: {
  onAction: (k: ToolbarKind) => void;
  onInsertImage: () => void;
}) {
  return (
    <div className="mb-2 flex flex-wrap gap-1">
      <ToolbarBtn label="B" title="Bold" className="font-bold" onClick={() => onAction("bold")} />
      <ToolbarBtn label="I" title="Italic" className="italic" onClick={() => onAction("italic")} />
      <ToolbarBtn label="H2" title="Heading 2" onClick={() => onAction("h2")} />
      <ToolbarBtn label="H3" title="Heading 3" onClick={() => onAction("h3")} />
      <ToolbarBtn label="Quote" title="Blockquote" onClick={() => onAction("quote")} />
      <ToolbarBtn label="List" title="Bullet list" onClick={() => onAction("bullet")} />
      <ToolbarBtn label="1. List" title="Numbered list" onClick={() => onAction("numbered")} />
      <ToolbarBtn label="Link" title="Insert link" onClick={() => onAction("link")} />
      <ToolbarBtn label="Table" title="Insert table" onClick={() => onAction("table")} />
      <ToolbarBtn label="Code" title="Inline code" onClick={() => onAction("code")} />
      <ToolbarBtn label="Image" title="Insert image from library" onClick={onInsertImage} />
    </div>
  );
}

/* ------------------------------------------------------------ status toggle */
function StatusToggle({
  value,
  onChange,
  className,
}: {
  value: "draft" | "published";
  onChange: (s: "draft" | "published") => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex shrink-0 rounded-full border border-ink/20 p-0.5", className)}>
      {(["draft", "published"] as const).map((st) => (
        <button
          key={st}
          type="button"
          onClick={() => onChange(st)}
          aria-pressed={value === st}
          className={cn(
            "rounded-full px-3.5 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] transition-colors",
            value === st
              ? st === "published"
                ? "bg-gold text-paper"
                : "bg-ink text-paper"
              : "text-ink-2 hover:text-ink",
          )}
        >
          {st}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- edit */
type Draft = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  read_time: number;
  date_iso: string;
  cover: string;
  thumb: string;
  cover_alt: string;
  featured: boolean;
  status: "draft" | "published";
  body_md: string;
  seo: { title?: string; description?: string; ogImage?: string; canonical?: string };
};

const emptyDraft = (): Draft => ({
  slug: "",
  title: "",
  excerpt: "",
  category: "Market Analysis",
  tags: [],
  read_time: 3,
  date_iso: new Date().toISOString().slice(0, 10),
  cover: "",
  thumb: "",
  cover_alt: "",
  featured: false,
  status: "draft",
  body_md: "",
  seo: {},
});

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export function PostEdit({ id, nav }: { id: string; nav: (hash: string) => void }) {
  const isNew = id === "new";
  const [draft, setDraft] = useState<Draft | null>(isNew ? emptyDraft() : null);
  const [initial, setInitial] = useState<string>(isNew ? JSON.stringify(emptyDraft()) : "");
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"rich" | "markdown" | "preview">("rich");
  const [pickerAccept, setPickerAccept] = useState<"image" | "video" | "any" | null>(null);
  const mediaResolver = useRef<((m: MediaItem | null) => void) | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    if (isNew) return;
    api
      .get<PostRow>(`/admin/posts/${id}`)
      .then((r) => {
        const d: Draft = {
          slug: r.slug,
          title: r.title,
          excerpt: r.excerpt,
          category: r.category,
          tags: JSON.parse(r.tags || "[]"),
          read_time: r.read_time,
          date_iso: r.date_iso,
          cover: r.cover,
          thumb: r.thumb,
          cover_alt: r.cover_alt,
          featured: !!r.featured,
          status: r.status,
          body_md: r.body_md,
          seo: JSON.parse(r.seo || "{}"),
        };
        setDraft(d);
        setInitial(JSON.stringify(d));
        // Raw HTML can't round-trip through the rich editor — open such posts in
        // markdown mode so nothing is silently dropped.
        if (/<([a-z][a-z0-9]*)\b[^>]*>/i.test(d.body_md)) setMode("markdown");
      })
      .catch((e) => toast("err", e.message));
  }, [id, isNew, toast]);

  const dirty = draft !== null && JSON.stringify(draft) !== initial;
  useUnsavedGuard(dirty);
  const onFieldBlur = useUnsavedFieldToast(dirty);

  const set = useCallback(<K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => (d ? { ...d, [k]: v } : d));
  }, []);

  // Scoped to body_md's value (not the whole draft object) so editing other
  // fields — title, tags, SEO — doesn't re-run the markdown parser.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const bodyHtml = useMemo(() => (draft ? mdToHtml(draft.body_md) : ""), [draft?.body_md]);

  /* One media-picker for cover, thumbnail and in-body images. Resolves the
     promise the caller is awaiting when the user picks (or cancels). */
  const pickMedia = useCallback(
    (accept: "image" | "video" | "any" = "image") =>
      new Promise<MediaItem | null>((resolve) => {
        mediaResolver.current = resolve;
        setPickerAccept(accept);
      }),
    [],
  );
  const resolveMedia = (m: MediaItem | null) => {
    setPickerAccept(null);
    mediaResolver.current?.(m);
    mediaResolver.current = null;
  };

  const applyFormat = (kind: ToolbarKind) => {
    const el = bodyRef.current;
    if (!el || !draft) return;
    const sel: Sel = { value: draft.body_md, start: el.selectionStart, end: el.selectionEnd };
    let result: Result;
    switch (kind) {
      case "bold":
        result = wrapInline(sel, "**", "**", "bold text");
        break;
      case "italic":
        result = wrapInline(sel, "*", "*", "italic text");
        break;
      case "code":
        result = wrapInline(sel, "`", "`", "code");
        break;
      case "h2":
        result = prefixLine(sel, (l) => `## ${l.replace(/^#+\s*/, "")}`);
        break;
      case "h3":
        result = prefixLine(sel, (l) => `### ${l.replace(/^#+\s*/, "")}`);
        break;
      case "quote":
        result = prefixBlock(sel, (l) => (l ? `> ${l.replace(/^>\s*/, "")}` : l));
        break;
      case "bullet":
        result = prefixBlock(sel, (l) => (l ? `- ${l.replace(/^[-*]\s*/, "")}` : l));
        break;
      case "numbered": {
        let n = 0;
        result = prefixBlock(sel, (l) => (l ? `${++n}. ${l.replace(/^\d+\.\s*/, "")}` : l));
        break;
      }
      case "link": {
        const url = window.prompt("Link URL", "https://");
        if (!url) return;
        result = wrapInline(sel, "[", `](${url})`, "link text");
        break;
      }
      case "table":
        result = insertAt(sel.value, sel.start, "\n| Column | Column |\n| --- | --- |\n| Cell | Cell |\n");
        break;
    }
    set("body_md", result.value);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(result.start, result.end);
    });
  };

  const insertBodyImage = async () => {
    const el = bodyRef.current;
    const pos = el ? el.selectionStart : draft?.body_md.length ?? 0;
    const m = await pickMedia("image");
    if (!m) return;
    setDraft((d) => {
      if (!d) return d;
      const r = insertAt(d.body_md, Math.min(pos, d.body_md.length), `![${m.alt}](${m.url})`);
      requestAnimationFrame(() => {
        el?.focus();
        el?.setSelectionRange(r.start, r.end);
      });
      return { ...d, body_md: r.value };
    });
  };

  const pickInto = async (k: "cover" | "thumb") => {
    const m = await pickMedia("image");
    if (!m) return;
    setDraft((d) => {
      if (!d) return d;
      const next: Draft = { ...d, [k]: m.url };
      if (k === "cover" && m.alt && !d.cover_alt) next.cover_alt = m.alt;
      return next;
    });
  };

  if (!draft) return <p className="text-[13px] text-ink-2">Loading…</p>;

  const save = async () => {
    const body = { ...draft };
    if (!body.slug && body.title) body.slug = slugify(body.title);
    if (!body.slug) return toast("err", "Add a title (or slug) before saving.");
    setSaving(true);
    try {
      if (isNew) {
        const r = await api.post<{ id: number }>("/admin/posts", body);
        toast("ok", body.status === "published" ? "Post created — marked published." : "Draft created.");
        nav(`#/posts/${r.id}`);
      } else {
        await api.put(`/admin/posts/${id}`, body);
        setDraft(body);
        setInitial(JSON.stringify(body));
        toast(
          "ok",
          body.status === "published"
            ? "Saved. It goes live at the next site publish."
            : "Draft saved.",
        );
      }
    } catch (e) {
      toast("err", (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!confirm("Delete this post permanently?")) return;
    try {
      await api.del(`/admin/posts/${id}`);
      toast("ok", "Post deleted.");
      nav("#/posts");
    } catch (e) {
      toast("err", (e as Error).message);
    }
  };

  const bodyTextarea = (
    <textarea
      ref={bodyRef}
      rows={22}
      value={draft.body_md}
      onChange={(e) => set("body_md", e.target.value)}
      spellCheck={false}
      className={cn(inputCls, "font-mono text-[12.5px] leading-relaxed")}
    />
  );

  const statusHint =
    draft.status === "published"
      ? "Published — goes live at the next site publish (Dashboard → Publish)."
      : "Draft — stays hidden until you mark it Published and publish the site.";

  return (
    <div className="pb-24 sm:pb-0" onBlur={onFieldBlur}>
      {/* Title row */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={() => {
            if (dirty && !confirm("Discard unsaved changes?")) return;
            nav("#/posts");
          }}
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2 hover:text-ink"
        >
          ← Posts
        </button>
        <h2 className="max-w-full truncate font-display text-[1.4rem] font-[400] text-ink sm:text-[1.6rem]">
          {isNew ? "New post" : draft.title || "(untitled)"}
        </h2>
        <StatusBadge status={draft.status} />
        {dirty && (
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold">Unsaved</span>
        )}
      </div>

      {/* Mode toggle + desktop actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: "rich", label: "Rich" },
            { value: "markdown", label: "Markdown" },
            { value: "preview", label: "Preview" },
          ]}
        />
        <div className="hidden items-center gap-2 sm:flex">
          <StatusToggle value={draft.status} onChange={(s) => set("status", s)} />
          {!isNew && (
            <AdminButton variant="danger" onClick={() => void del()}>
              Delete
            </AdminButton>
          )}
          <AdminButton variant="gold" busy={saving} onClick={() => void save()}>
            Save
          </AdminButton>
        </div>
      </div>
      <p className="mb-6 mt-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-2/60">
        {statusHint}
      </p>

      {mode === "preview" ? (
        /* Draft preview — same markdown pipeline + prose styles as the live site. */
        <article className="mx-auto max-w-3xl border border-ink/10 bg-paper px-5 py-8 sm:px-10 sm:py-10">
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.22em]">
            <span className="text-gold">{draft.category}</span>
            <span className="text-ink-2/70">{draft.date_iso}</span>
            <span className="text-ink-2/70">{draft.read_time} min read</span>
            <StatusBadge status={draft.status} />
          </p>
          <h1 className="mt-4 font-display font-[360] text-[clamp(1.7rem,3.5vw,3rem)] leading-[1.1] tracking-[-0.02em] text-ink">
            {draft.title || "(untitled)"}
          </h1>
          {draft.excerpt && (
            <p className="mt-4 font-display text-[1.1rem] italic leading-[1.6] text-ink-2 sm:text-[1.15rem]">
              {draft.excerpt}
            </p>
          )}
          {draft.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={draft.cover}
              alt={draft.cover_alt}
              className="mt-8 aspect-[16/9] w-full border border-ink/10 object-cover"
            />
          )}
          <div className="prose-z mt-8 sm:mt-10" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        </article>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* editor column */}
          <div className="grid min-w-0 content-start gap-5">
            <Field label="Title">
              <TextInput
                value={draft.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setDraft((d) =>
                    d
                      ? {
                          ...d,
                          title,
                          slug: isNew && (!d.slug || d.slug === slugify(d.title)) ? slugify(title) : d.slug,
                        }
                      : d,
                  );
                }}
              />
            </Field>
            <Field label="Excerpt">
              <TextArea
                rows={2}
                value={draft.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
              />
            </Field>

            {/* Body — a plain container, NOT a <label>, so toolbar buttons aren't
                triggered by clicking the field label. */}
            <div className="min-w-0">
              <span className="mb-1.5 block font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2">
                {mode === "markdown" ? "Body — markdown" : "Body"}
              </span>
              {mode === "markdown" ? (
                <>
                  <MarkdownToolbar onAction={applyFormat} onInsertImage={() => void insertBodyImage()} />
                  {bodyTextarea}
                </>
              ) : (
                <RichTextEditor
                  value={draft.body_md}
                  onChange={(md) => set("body_md", md)}
                  onRequestImage={async () => {
                    const m = await pickMedia("image");
                    return m ? { url: m.url, alt: m.alt } : null;
                  }}
                />
              )}
              <span className="mt-1.5 block text-[11px] text-ink-2/70">
                {mode === "markdown"
                  ? "GFM tables, images & links supported."
                  : "Write normally — it’s saved as markdown. Switch to Markdown anytime."}
              </span>
            </div>
          </div>

          {/* meta column */}
          <div className="grid min-w-0 content-start gap-5">
            <Field label="Slug" hint="URL: /blog/<slug>. Changing it breaks old links.">
              <TextInput value={draft.slug} onChange={(e) => set("slug", e.target.value)} />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Category">
                <TextInput
                  value={draft.category}
                  list="z99-categories"
                  onChange={(e) => set("category", e.target.value)}
                />
                <datalist id="z99-categories">
                  <option value="Market Analysis" />
                  <option value="Construction Updates" />
                  <option value="Buying Guides" />
                  <option value="Overseas Buyers" />
                </datalist>
              </Field>
              <Field label="Publish date">
                <TextInput
                  type="date"
                  value={draft.date_iso}
                  onChange={(e) => set("date_iso", e.target.value)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Read time (min)">
                <TextInput
                  type="number"
                  min={1}
                  value={draft.read_time}
                  onChange={(e) => set("read_time", Number(e.target.value) || 1)}
                />
              </Field>
              <Field label="Tags (comma separated)">
                <TextInput
                  value={draft.tags.join(", ")}
                  onChange={(e) =>
                    set(
                      "tags",
                      e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    )
                  }
                />
              </Field>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(e) => set("featured", e.target.checked)}
              />
              <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2">
                Featured on blog index
              </span>
            </label>

            {(["cover", "thumb"] as const).map((k) => (
              <Field key={k} label={k === "cover" ? "Cover image" : "Thumbnail"}>
                <div className="flex gap-2">
                  <TextInput
                    value={draft[k]}
                    placeholder="/images/… or R2 URL"
                    onChange={(e) => set(k, e.target.value)}
                  />
                  <AdminButton variant="outline" onClick={() => void pickInto(k)}>
                    Pick
                  </AdminButton>
                </div>
                {draft[k] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={draft[k]}
                    alt=""
                    className="mt-2 h-24 w-full border border-ink/10 object-cover"
                  />
                )}
              </Field>
            ))}
            <Field label="Cover alt text">
              <TextInput value={draft.cover_alt} onChange={(e) => set("cover_alt", e.target.value)} />
            </Field>

            <fieldset className="border border-ink/15 p-4">
              <legend className="px-2 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2">
                SEO overrides (optional)
              </legend>
              <div className="grid gap-4">
                <Field label="Meta title">
                  <TextInput
                    value={draft.seo.title ?? ""}
                    onChange={(e) => set("seo", { ...draft.seo, title: e.target.value })}
                  />
                </Field>
                <Field label="Meta description">
                  <TextArea
                    rows={2}
                    value={draft.seo.description ?? ""}
                    onChange={(e) => set("seo", { ...draft.seo, description: e.target.value })}
                  />
                </Field>
                <Field label="OG image URL">
                  <TextInput
                    value={draft.seo.ogImage ?? ""}
                    onChange={(e) => set("seo", { ...draft.seo, ogImage: e.target.value })}
                  />
                </Field>
                <Field label="Canonical URL">
                  <TextInput
                    value={draft.seo.canonical ?? ""}
                    onChange={(e) => set("seo", { ...draft.seo, canonical: e.target.value })}
                  />
                </Field>
              </div>
            </fieldset>

            {/* Delete lives here on mobile (the desktop cluster has its own). */}
            {!isNew && (
              <div className="border-t border-ink/10 pt-4 sm:hidden">
                <AdminButton variant="danger" onClick={() => void del()} className="w-full justify-center">
                  Delete post
                </AdminButton>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile sticky action bar — Save always within reach. */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-ink/10 bg-paper/95 px-5 py-3 backdrop-blur sm:hidden">
        <StatusToggle value={draft.status} onChange={(s) => set("status", s)} />
        <AdminButton
          variant="gold"
          busy={saving}
          onClick={() => void save()}
          className="flex-1 justify-center"
        >
          Save
        </AdminButton>
      </div>

      <MediaPickerModal
        open={pickerAccept !== null}
        accept={pickerAccept ?? "image"}
        onClose={() => resolveMedia(null)}
        onPick={(m: MediaItem) => resolveMedia(m)}
      />
    </div>
  );
}
