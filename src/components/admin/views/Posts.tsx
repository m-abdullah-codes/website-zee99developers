"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, type PostListRow, type PostRow, type MediaItem } from "../api";
import {
  AdminButton,
  Field,
  StatusBadge,
  TextArea,
  TextInput,
  useConfirm,
  useToast,
  useUnsavedGuard,
} from "../ui";
import { MediaPickerModal } from "./Media";
import { mdToHtml } from "@/lib/markdown";

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
  const [preview, setPreview] = useState(false);
  const [picker, setPicker] = useState<null | "cover" | "thumb">(null);
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
      })
      .catch((e) => toast("err", e.message));
  }, [id, isNew, toast]);

  const dirty = draft !== null && JSON.stringify(draft) !== initial;
  useUnsavedGuard(dirty);

  const set = useCallback(<K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => (d ? { ...d, [k]: v } : d));
  }, []);

  const previewHtml = useMemo(
    () => (draft && preview ? mdToHtml(draft.body_md) : ""),
    [draft, preview],
  );

  if (!draft) return <p className="text-[13px] text-ink-2">Loading…</p>;

  const save = async (statusOverride?: "draft" | "published") => {
    const body = { ...draft, status: statusOverride ?? draft.status };
    if (!body.slug && body.title) body.slug = slugify(body.title);
    if (!body.slug) return toast("err", "Slug is required (set a title first).");
    setSaving(true);
    try {
      if (isNew) {
        const r = await api.post<{ id: number }>("/admin/posts", body);
        toast("ok", "Post created.");
        nav(`#/posts/${r.id}`);
      } else {
        await api.put(`/admin/posts/${id}`, body);
        setDraft(body);
        setInitial(JSON.stringify(body));
        toast(
          "ok",
          body.status === "published"
            ? "Saved. Publish from the dashboard to rebuild the site."
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

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
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
          <h2 className="font-display text-[1.5rem] font-[400] text-ink">
            {isNew ? "New post" : draft.title || "(untitled)"}
          </h2>
          <StatusBadge status={draft.status} />
          {dirty && (
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold">
              Unsaved
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <AdminButton variant="outline" onClick={() => setPreview(!preview)}>
            {preview ? "Edit" : "Preview"}
          </AdminButton>
          {!isNew && (
            <AdminButton variant="danger" onClick={() => void del()}>
              Delete
            </AdminButton>
          )}
          <AdminButton onClick={() => void save("draft")} busy={saving} variant="outline">
            Save draft
          </AdminButton>
          <AdminButton onClick={() => void save("published")} busy={saving} variant="gold">
            {draft.status === "published" ? "Save (published)" : "Mark published"}
          </AdminButton>
        </div>
      </div>

      {preview ? (
        /* Draft preview — same markdown pipeline + prose styles as the live site. */
        <article className="mx-auto max-w-3xl border border-ink/10 bg-paper px-6 py-10 sm:px-10">
          <p className="flex flex-wrap items-center gap-x-4 font-mono text-[10px] uppercase tracking-[0.22em]">
            <span className="text-gold">{draft.category}</span>
            <span className="text-ink-2/70">{draft.date_iso}</span>
            <span className="text-ink-2/70">{draft.read_time} min read</span>
            <StatusBadge status={draft.status} />
          </p>
          <h1 className="mt-4 font-display font-[360] text-[clamp(1.9rem,3.5vw,3rem)] leading-[1.1] tracking-[-0.02em] text-ink">
            {draft.title || "(untitled)"}
          </h1>
          {draft.excerpt && (
            <p className="mt-4 font-display text-[1.15rem] italic leading-[1.6] text-ink-2">
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
          <div
            className="prose-z mt-10"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </article>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* editor column */}
          <div className="grid content-start gap-5">
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
            <Field label="Body — markdown (GFM tables supported)">
              <TextArea
                rows={26}
                value={draft.body_md}
                onChange={(e) => set("body_md", e.target.value)}
                spellCheck={false}
                className="font-mono text-[12.5px]"
              />
            </Field>
          </div>

          {/* meta column */}
          <div className="grid content-start gap-5">
            <Field label="Slug" hint="URL: /blog/<slug>. Changing it breaks old links.">
              <TextInput value={draft.slug} onChange={(e) => set("slug", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-2 gap-4">
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
                  <AdminButton variant="outline" onClick={() => setPicker(k)}>
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
          </div>
        </div>
      )}

      <MediaPickerModal
        open={picker !== null}
        onClose={() => setPicker(null)}
        onPick={(m: MediaItem) => {
          if (picker) set(picker, m.url);
          if (picker === "cover" && m.alt && !draft.cover_alt) set("cover_alt", m.alt);
        }}
      />
    </div>
  );
}
