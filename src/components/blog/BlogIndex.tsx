"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReduced } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { CATEGORIES, type Category, type Post } from "@/data/posts";
import PostCard from "@/components/blog/PostCard";

type Filter = "All" | Category;

export default function BlogIndex({ posts }: { posts: Post[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const root = useRef<HTMLDivElement>(null);

  const list = posts.filter((p) => filter === "All" || p.category === filter);

  useGSAP(
    () => {
      if (prefersReduced()) return;
      gsap.fromTo(
        "[data-post]",
        { y: 26, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.08,
          overwrite: "auto",
        },
      );
    },
    { scope: root, dependencies: [filter] },
  );

  return (
    <div ref={root}>
      <div className="mb-14 flex flex-wrap gap-2.5" role="group" aria-label="Filter posts">
        {(["All", ...CATEGORIES] as Filter[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            aria-pressed={filter === c}
            className={cn(
              "rounded-full border px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300",
              filter === c
                ? "border-ink bg-ink text-paper"
                : "border-ink/15 text-ink-2 hover:border-ink/40 hover:text-ink",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <div key={p.slug} data-post>
            <PostCard post={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
