import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/data/posts";
import { cn } from "@/lib/utils";

export default function PostCard({
  post,
  className,
}: {
  post: Post;
  className?: string;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden border border-ink/10 bg-paper shadow-[0_18px_44px_-26px_rgba(23,20,16,0.35)] transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1.5 hover:shadow-[0_34px_66px_-30px_rgba(23,20,16,0.42)]",
        className,
      )}
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-paper-2">
        <Image
          src={post.thumb}
          alt={post.coverAlt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.055]"
        />
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[9.5px] uppercase tracking-[0.22em]">
          <span className="text-gold">{post.category}</span>
          <span className="text-ink-2/70">{post.date}</span>
          <span className="text-ink-2/70">{post.readTime} min</span>
        </p>
        <h3 className="mt-3.5 font-display text-[1.4rem] font-[420] leading-[1.25] tracking-[-0.01em] text-ink transition-colors duration-300 group-hover:text-gold">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-[0.92rem] leading-[1.75] text-ink-2">
          {post.excerpt}
        </p>
        <span className="mt-auto inline-flex items-center gap-2.5 pt-7 font-mono text-[9.5px] uppercase tracking-[0.24em] text-ink-2 transition-colors duration-300 group-hover:text-gold">
          Read the note
          <span className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1.5">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
