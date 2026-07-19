import { POSTS } from "@/data/posts";
import { SITE } from "@/data/site";
import { GLOBAL_SEO } from "@/data/content";

// Rendered once at build time into out/rss.xml.
export const dynamic = "force-static";

const esc = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export function GET() {
  const items = [...POSTS]
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO))
    .map((p) => {
      const url = `${SITE.domain}/blog/${p.slug}`;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${p.dateISO}T00:00:00Z`).toUTCString()}</pubDate>
      <category>${esc(p.category)}</category>
      <description>${esc(p.excerpt)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.name)} — Notes on the market</title>
    <link>${SITE.domain}/blog</link>
    <atom:link href="${SITE.domain}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>${esc(GLOBAL_SEO.description)}</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
