import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/motion/Reveal";
import Button from "@/components/ui/Button";
import PostCard from "@/components/blog/PostCard";
import Em from "@/components/ui/Em";
import { latestPosts } from "@/data/posts";
import { section } from "@/data/content";

type BlogTeaserSection = { label: string; title: string; ctaLabel: string };

export default function BlogTeaser() {
  const s = section<BlogTeaserSection>("home", "blog-teaser");
  const posts = latestPosts(3);
  return (
    <section className="border-t border-ink/10 bg-paper-2/55 py-24 md:py-36">
      <div className="container-x">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-8">
          <SectionHead no="07" label={s.label} title={<Em text={s.title} />} />
          <Reveal delay={0.2}>
            <Button href="/blog" variant="outline" arrow>
              {s.ctaLabel}
            </Button>
          </Reveal>
        </div>
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {posts.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.1} y={36}>
              <PostCard post={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
