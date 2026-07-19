"use client";

/** Fetch wrapper for the Worker API. Throws ApiError; 401 flips the app to login. */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn;
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: "same-origin",
    ...init,
    headers: {
      "x-requested-with": "zee99-admin",
      ...(init.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...init.headers,
    },
  });
  if (res.status === 401) {
    onUnauthorized?.();
    throw new ApiError(401, "Session expired — log in again.");
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new ApiError(res.status, data.error ?? `Request failed (${res.status})`);
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, form: FormData) => request<T>(path, { method: "POST", body: form }),
};

// ---- shared row types (mirror the D1 schema) ----
export type PostRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string; // JSON
  read_time: number;
  date_iso: string;
  cover: string;
  thumb: string;
  cover_alt: string;
  featured: number;
  status: "draft" | "published";
  body_md: string;
  seo: string; // JSON
  created_at: string;
  updated_at: string;
};

export type PostListRow = Pick<
  PostRow,
  "id" | "slug" | "title" | "category" | "status" | "featured" | "date_iso" | "updated_at"
>;

export type ProjectRow = {
  id: number;
  slug: string;
  sort_order: number;
  status: "booking" | "construction" | "delivered";
  data: string; // JSON
  seo: string; // JSON
  updated_at: string;
};

export type SectionRow = {
  id: number;
  page: string;
  key: string;
  sort_order: number;
  data: string; // JSON
  updated_at: string;
};

export type SettingRow = { key: string; data: string; updated_at: string };

export type PageSeoRow = {
  path: string;
  title: string;
  description: string;
  og_image: string;
  canonical: string;
  updated_at: string;
};

export type MediaItem = {
  id: number;
  key: string;
  filename: string;
  content_type: string;
  size: number;
  alt: string;
  created_at: string;
  url: string;
};

export type PublishChange = { type: string; label: string; id: number | null; updatedAt: string };
export type PublishStatus = { lastPublishAt: string | null; dirty: boolean; changes: PublishChange[] };

export type BuildRun = {
  id: number;
  runNumber: number;
  status: string;
  conclusion: string | null;
  event: string;
  createdAt: string;
  updatedAt: string;
  url: string;
};
