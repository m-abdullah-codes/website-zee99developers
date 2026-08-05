import type { MetadataRoute } from "next";
import { SITE } from "@/data/site";
import { lastmodFor } from "@/data/content";
import { POSTS } from "@/data/posts";
import { PROJECTS } from "@/data/projects";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.domain;

  // lastModified comes from the content's own D1 timestamps, never build time —
  // see lastmodFor. Routes with no recorded edit simply omit it.
  const entry = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  ) => {
    const lastModified = lastmodFor(path);
    return {
      url: path === "/" ? base : `${base}${path}`,
      priority,
      changeFrequency,
      ...(lastModified ? { lastModified } : {}),
    };
  };

  return [
    entry("/", 1, "weekly"),
    entry("/projects", 0.9, "weekly"),
    ...PROJECTS.filter((p) => !p.href).map((p) =>
      entry(`/projects/${p.slug}`, p.status === "booking" ? 0.95 : 0.8, "weekly"),
    ),
    entry("/payment-planner", 0.85, "monthly"),
    entry("/about", 0.7, "monthly"),
    entry("/blog", 0.7, "weekly"),
    ...POSTS.map((p) => entry(`/blog/${p.slug}`, 0.6, "monthly")),
    entry("/privacy", 0.2, "yearly"),
  ];
}
