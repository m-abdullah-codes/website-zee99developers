import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/motion/Reveal";
import SplitReveal from "@/components/motion/SplitReveal";
import BlogIndex from "@/components/blog/BlogIndex";
import Button from "@/components/ui/Button";
import Em from "@/components/ui/Em";
import { POSTS } from "@/data/posts";
import { WA } from "@/data/site";
import { section, pageMeta } from "@/data/content";

export const metadata: Metadata = pageMeta("/blog");

type BlogHeader = { folio: string; title: string; lede: string };
type BlogSubscribe = { label: string; title: string; body: string; waCtaLabel: string };

export default function BlogPage() {
  const header = section<BlogHeader>("blog", "header");
  const subscribe = section<BlogSubscribe>("blog", "subscribe");
  const featured = POSTS.find((p) => p.featured) ?? POSTS[0];
  const rest = POSTS.filter((p) => p.slug !== featured.slug);

  return (
    <div className="bg-paper pt-36 md:pt-48">
      <div className="container-x">
        <header className="mb-16 max-w-4xl md:mb-20">
          <Reveal as="p" y={14} className="folio mb-9 text-ink-2">
            {header.folio}
          </Reveal>
          <SplitReveal
            as="h1"
            immediate
            className="font-display font-[340] text-[clamp(2.8rem,6vw,5.6rem)] leading-[1.02] tracking-[-0.025em] text-ink"
          >
            <Em text={header.title} />
          </SplitReveal>
          <Reveal delay={0.25}>
            <p className="mt-9 max-w-xl text-[1.02rem] leading-[1.85] text-ink-2">
              {header.lede}
            </p>
          </Reveal>
        </header>

        {/* featured */}
        <Reveal y={36} className="mb-20 md:mb-24">
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid overflow-hidden border border-ink/10 bg-paper shadow-[0_22px_56px_-30px_rgba(23,20,16,0.4)] transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-[0_40px_80px_-32px_rgba(23,20,16,0.45)] lg:grid-cols-[1.25fr_1fr]"
          >
            <div className="relative aspect-[16/9] overflow-hidden lg:aspect-auto lg:min-h-[380px]">
              <Image
                src={featured.cover}
                alt={featured.coverAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition-transform duration-[1500ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.045]"
              />
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
              <p className="flex flex-wrap items-center gap-x-4 font-mono text-[9.5px] uppercase tracking-[0.22em]">
                <span className="rounded-full border border-gold-2/60 px-3 py-1 text-gold">
                  Featured
                </span>
                <span className="text-gold">{featured.category}</span>
                <span className="text-ink-2/70">
                  {featured.date} · {featured.readTime} min
                </span>
              </p>
              <h2 className="mt-6 font-display text-[clamp(1.7rem,3vw,2.6rem)] font-[390] leading-[1.15] tracking-[-0.015em] text-ink transition-colors duration-300 group-hover:text-gold">
                {featured.title}
              </h2>
              <p className="mt-5 max-w-md text-[0.98rem] leading-[1.85] text-ink-2">
                {featured.excerpt}
              </p>
              <span className="link-mono mt-9 self-start text-ink group-hover:text-gold">
                Read the note <span aria-hidden>→</span>
              </span>
            </div>
          </Link>
        </Reveal>

        <BlogIndex posts={rest} />
      </div>

      {/* subscribe */}
      <section className="mt-24 border-t border-paper/10 bg-night py-20 text-paper md:mt-32 md:py-24">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="folio mb-8 text-gold-3">{subscribe.label}</p>
            <h2 className="max-w-lg font-display text-[clamp(1.8rem,3.2vw,2.7rem)] font-[370] leading-[1.2] tracking-[-0.015em]">
              <Em text={subscribe.title} emClass="italic text-gold-3" />
            </h2>
            <p className="mt-6 max-w-md text-[0.98rem] leading-[1.85] text-paper/60">
              {subscribe.body}
            </p>
          </div>
          <div className="flex flex-col items-start gap-5 lg:items-end">
            <Button external href={WA.channel} variant="light">
              {subscribe.waCtaLabel}
            </Button>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40">
              Delivered on WhatsApp — leave any time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
