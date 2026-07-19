import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/motion/Reveal";
import SplitReveal from "@/components/motion/SplitReveal";
import Plate from "@/components/ui/Plate";
import Button from "@/components/ui/Button";
import PostCard from "@/components/blog/PostCard";
import { POSTS, getPost } from "@/data/posts";
import { SITE, waLink } from "@/data/site";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { images: [post.cover], type: "article" },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const idx = POSTS.findIndex((p) => p.slug === post.slug);
  const next = POSTS[(idx + 1) % POSTS.length];

  return (
    <article className="bg-paper pt-36 md:pt-44">
      <div className="container-x">
        <div className="mx-auto max-w-3xl">
          <Reveal y={14}>
            <Link href="/blog" className="link-mono text-ink-2 hover:text-gold">
              ← Notes on the market
            </Link>
          </Reveal>
          <Reveal delay={0.08} as="p" className="mt-12 flex flex-wrap items-center gap-x-4 font-mono text-[10px] uppercase tracking-[0.22em]">
            <span className="text-gold">{post.category}</span>
            <span className="text-ink-2/70">{post.date}</span>
            <span className="text-ink-2/70">{post.readTime} min read</span>
          </Reveal>
          <SplitReveal
            as="h1"
            immediate
            className="mt-6 font-display font-[360] text-[clamp(2.2rem,4.6vw,3.9rem)] leading-[1.07] tracking-[-0.02em] text-ink"
          >
            {post.title}
          </SplitReveal>
          <Reveal delay={0.2}>
            <p className="mt-7 font-display text-[1.3rem] italic leading-[1.6] text-ink-2">
              {post.excerpt}
            </p>
          </Reveal>
        </div>

        <Reveal y={30} className="mx-auto mt-14 max-w-5xl">
          <Plate
            src={post.cover}
            alt={post.coverAlt}
            ratio="aspect-[16/9]"
            parallax={6}
            priority
            sizes="(max-width: 1280px) 100vw, 1024px"
            caption={{ left: post.coverAlt, right: post.date }}
          />
        </Reveal>

        <div className="prose-z mx-auto mt-16 max-w-3xl pb-8 md:mt-20">{post.body}</div>

        {/* signature + CTA */}
        <div className="mx-auto max-w-3xl border-t border-ink/10 py-12">
          <div className="flex flex-wrap items-center justify-between gap-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-ink-2">
                Written on site
              </p>
              <p className="mt-2 font-display text-[1.3rem] font-[420] text-ink">
                Zee99 Developers — Bahria Town, Lahore
              </p>
            </div>
            <Button external href={waLink(`Hi, I just read "${post.title}" on your site — I have a question.`)} arrow>
              WhatsApp {SITE.phoneDisplay}
            </Button>
          </div>
        </div>
      </div>

      {/* next note */}
      <section className="border-t border-ink/10 bg-paper-2/55 py-20 md:py-24">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="folio mb-8 text-ink-2">Next note</p>
            <PostCard post={next} className="max-w-xl" />
          </div>
          <div className="lg:justify-self-end">
            <p className="max-w-sm font-display text-[1.5rem] font-[380] leading-[1.4] text-ink">
              The next one is <em className="italic text-gold">booking now.</em>
            </p>
            <Button href="/projects/zee99-lifestyle" variant="outline" arrow className="mt-7">
              Zee99 Lifestyle
            </Button>
          </div>
        </div>
      </section>
    </article>
  );
}
