import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/motion/Reveal";
import Button from "@/components/ui/Button";
import PostCard from "@/components/blog/PostCard";
import { latestPosts } from "@/data/posts";

export default function BlogTeaser() {
  const posts = latestPosts(3);
  return (
    <section className="border-t border-ink/10 bg-paper-2/55 py-24 md:py-36">
      <div className="container-x">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-8">
          <SectionHead
            no="07"
            label="From the blog"
            title={
              <>
                Notes on the <em className="italic text-gold">market</em>
              </>
            }
          />
          <Reveal delay={0.2}>
            <Button href="/blog" variant="outline" arrow>
              Read all notes
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
