import type { MetadataRoute } from "next";
import { SITE } from "@/data/site";
import { POSTS } from "@/data/posts";
import { PROJECTS } from "@/data/projects";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.domain;
  return [
    { url: base, priority: 1 },
    { url: `${base}/projects`, priority: 0.9 },
    ...PROJECTS.filter((p) => !p.href).map((p) => ({
      url: `${base}/projects/${p.slug}`,
      priority: p.status === "booking" ? 0.95 : 0.8,
    })),
    { url: `${base}/about`, priority: 0.7 },
    { url: `${base}/blog`, priority: 0.7 },
    ...POSTS.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      priority: 0.6,
      lastModified: new Date(p.dateISO),
    })),
    { url: `${base}/privacy`, priority: 0.2 },
  ];
}
