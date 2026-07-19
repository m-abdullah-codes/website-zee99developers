"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, type MediaItem } from "../api";
import { AdminButton, TextInput, useToast, useConfirm } from "../ui";
import { cn } from "@/lib/utils";

const fmtSize = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`;

export function MediaGrid({
  onPick,
  compact,
  accept = "any",
}: {
  /** Picker mode: click returns the URL instead of managing the item. */
  onPick?: (item: MediaItem) => void;
  compact?: boolean;
  /** Filter the grid to a content-type family. */
  accept?: "image" | "video" | "any";
}) {
  // null = initial load in flight
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const confirm = useConfirm();

  const fetchPage = useCallback(
    async (offset: number) => {
      const r = await api.get<{ items: MediaItem[]; hasMore: boolean }>(
        `/admin/media?limit=${compact ? 24 : 60}&offset=${offset}`,
      );
      setItems((prev) => (offset === 0 || !prev ? r.items : [...prev, ...r.items]));
      setHasMore(r.hasMore);
    },
    [compact],
  );

  useEffect(() => {
    // setItems only fires after the fetch resolves — never synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPage(0).catch((e: Error) => toast("err", e.message));
  }, [fetchPage, toast]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      await fetchPage(items?.length ?? 0);
    } catch (e) {
      toast("err", (e as Error).message);
    } finally {
      setLoadingMore(false);
    }
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        await api.upload("/admin/media", form);
      }
      toast("ok", `Uploaded ${files.length} file${files.length > 1 ? "s" : ""}.`);
      await fetchPage(0);
    } catch (e) {
      toast("err", (e as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const del = async (item: MediaItem) => {
    if (!confirm(`Delete ${item.filename || item.key}? The file is removed from R2 permanently.`))
      return;
    try {
      await api.del(`/admin/media/${item.id}`);
      setItems((prev) => prev?.filter((x) => x.id !== item.id) ?? prev);
      toast("ok", "Deleted.");
    } catch (e) {
      toast("err", (e as Error).message);
    }
  };

  const copyUrl = async (item: MediaItem) => {
    await navigator.clipboard.writeText(item.url);
    toast("ok", "URL copied.");
  };

  const saveAlt = async (item: MediaItem, alt: string) => {
    try {
      await api.put(`/admin/media/${item.id}`, { alt });
      setItems((prev) => prev?.map((x) => (x.id === item.id ? { ...x, alt } : x)) ?? prev);
      toast("ok", "Alt text saved.");
    } catch (e) {
      toast("err", (e as Error).message);
    }
  };

  const visible = (items ?? []).filter(
    (m) => accept === "any" || m.content_type.startsWith(`${accept}/`),
  );

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,video/mp4,application/pdf"
          className="hidden"
          onChange={(e) => void upload(e.target.files)}
        />
        <AdminButton onClick={() => fileRef.current?.click()} busy={uploading} variant="gold">
          Upload files
        </AdminButton>
        <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-2/70">
          Served from R2 public access
        </p>
      </div>

      {items !== null && visible.length === 0 && (
        <p className="border border-dashed border-ink/20 p-10 text-center text-[13px] text-ink-2">
          {accept === "any"
            ? "No uploads yet."
            : `No ${accept}s in the library yet. Upload one, or pick from “any” type.`}
        </p>
      )}
      {items === null && <p className="text-[13px] text-ink-2">Loading…</p>}

      <div
        className={cn(
          "grid gap-4",
          compact ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
        )}
      >
        {visible.map((m) => (
          <figure key={m.id} className="group border border-ink/15 bg-white/50">
            <button
              type="button"
              className="relative block aspect-[4/3] w-full overflow-hidden bg-paper-2"
              onClick={() => onPick?.(m)}
              title={onPick ? "Use this file" : m.key}
            >
              {m.content_type.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.url}
                  alt={m.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              ) : m.content_type.startsWith("video/") ? (
                <>
                  <video
                    src={m.url}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/50 text-paper">
                      ▶
                    </span>
                  </span>
                </>
              ) : (
                <span className="flex h-full items-center justify-center font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2">
                  {m.content_type}
                </span>
              )}
              {onPick && (
                <span className="absolute inset-0 flex items-center justify-center bg-ink/0 font-mono text-[10px] uppercase tracking-[0.2em] text-transparent transition-colors group-hover:bg-ink/50 group-hover:text-paper">
                  Select
                </span>
              )}
            </button>
            <figcaption className="border-t border-ink/10 p-2.5">
              <p className="truncate font-mono text-[10px] text-ink" title={m.filename}>
                {m.filename || m.key.split("/").pop()}
              </p>
              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-2/70">
                {fmtSize(m.size)} · {m.created_at.slice(0, 10)}
              </p>
              {!onPick && (
                <>
                  <TextInput
                    defaultValue={m.alt}
                    placeholder="Alt text…"
                    className="mt-2 px-2 py-1 text-[11.5px]"
                    onBlur={(e) => {
                      if (e.target.value !== m.alt) void saveAlt(m, e.target.value);
                    }}
                  />
                  <div className="mt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => void copyUrl(m)}
                      className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-2 hover:text-gold"
                    >
                      Copy URL
                    </button>
                    <button
                      type="button"
                      onClick={() => void del(m)}
                      className="font-mono text-[9px] uppercase tracking-[0.16em] text-red-900/60 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </figcaption>
          </figure>
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <AdminButton variant="outline" onClick={() => void loadMore()} busy={loadingMore}>
            Load more
          </AdminButton>
        </div>
      )}
    </div>
  );
}

export function MediaPickerModal({
  open,
  onClose,
  onPick,
  accept = "any",
}: {
  open: boolean;
  onClose: () => void;
  onPick: (item: MediaItem) => void;
  accept?: "image" | "video" | "any";
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/40 p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-3xl overflow-y-auto border border-ink/20 bg-paper p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-[1.3rem] text-ink">
            Pick {accept === "any" ? "media" : `a ${accept}`} from the library
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-2 hover:text-ink"
          >
            Close ×
          </button>
        </div>
        <MediaGrid
          compact
          accept={accept}
          onPick={(m) => {
            onPick(m);
            onClose();
          }}
        />
      </div>
    </div>
  );
}

export default function MediaView() {
  return (
    <div>
      <h2 className="mb-6 font-display text-[1.8rem] font-[400] text-ink">Media library</h2>
      <MediaGrid />
    </div>
  );
}
