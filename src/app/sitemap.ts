import type { MetadataRoute } from "next";
import { SITE } from "@/data/site";
import { POSTS } from "@/data/posts";
import { PROJECTS } from "@/data/projects";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.domain;
  const now = new Date();
  return [
    { url: base, priority: 1, changeFrequency: "weekly", lastModified: now },
    {
      url: `${base}/projects`,
      priority: 0.9,
      changeFrequency: "weekly",
      lastModified: now,
    },
    ...PROJECTS.filter((p) => !p.href).map((p) => ({
      url: `${base}/projects/${p.slug}`,
      priority: p.status === "booking" ? 0.95 : 0.8,
      changeFrequency: "weekly" as const,
      lastModified: now,
    })),
    {
      url: `${base}/payment-planner`,
      priority: 0.85,
      changeFrequency: "monthly",
      lastModified: now,
    },
    { url: `${base}/about`, priority: 0.7, changeFrequency: "monthly", lastModified: now },
    { url: `${base}/blog`, priority: 0.7, changeFrequency: "weekly", lastModified: now },
    ...POSTS.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      priority: 0.6,
      changeFrequency: "monthly" as const,
      lastModified: new Date(p.dateISO),
    })),
    { url: `${base}/privacy`, priority: 0.2, changeFrequency: "yearly", lastModified: now },
  ];
}
