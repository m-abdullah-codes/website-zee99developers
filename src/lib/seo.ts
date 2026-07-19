// Structured-data (JSON-LD) builders and URL helpers, shared across pages.
// The graph is anchored on stable @id nodes so the Organization and WebSite are
// declared once and referenced everywhere else.
import { SITE } from "@/data/site";
import { GLOBAL_SEO } from "@/data/content";
import type { Project } from "@/data/projects";
import type { Post } from "@/data/posts";

const BASE = SITE.domain.replace(/\/$/, "");
export const ORG_ID = `${BASE}/#organization`;
export const SITE_ID = `${BASE}/#website`;

/** Resolve a site path (or pass through an absolute URL) to a full URL. */
export const absUrl = (path: string) =>
  /^https?:\/\//.test(path)
    ? path
    : `${BASE}${path.startsWith("/") ? path : `/${path}`}`;

/** The developer, as a RealEstateAgent — declared once, referenced by @id. */
export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": ORG_ID,
    name: SITE.name,
    url: BASE,
    logo: absUrl("/images/logo.svg"),
    image: GLOBAL_SEO.ogImage,
    description: GLOBAL_SEO.description,
    telephone: SITE.phoneIntl,
    email: SITE.email,
    foundingDate: "2010",
    areaServed: { "@type": "Place", name: "Bahria Town, Lahore, Pakistan" },
    address: {
      "@type": "PostalAddress",
      streetAddress: "22 Nishter, Main Boulevard, Bahria Town",
      addressLocality: "Lahore",
      addressRegion: "Punjab",
      addressCountry: "PK",
    },
    priceRange: "₨₨",
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    url: BASE,
    name: SITE.name,
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
  };
}

type Crumb = { name: string; path: string };

export function breadcrumbLd(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absUrl(it.path),
    })),
  };
}

/** A blog post → BlogPosting, attributed to the developer. */
export function articleLd(post: Post) {
  const url = absUrl(`/blog/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt,
    image: post.seo?.ogImage || post.cover,
    datePublished: post.dateISO,
    dateModified: post.dateISO,
    inLanguage: "en",
    keywords: post.tags.join(", "),
    articleSection: post.category,
    mainEntityOfPage: url,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}

/** A project → a Residence/Place with its offered units as Product offers. */
export function projectLd(project: Project) {
  const url = absUrl(`/projects/${project.slug}`);
  const offers = (project.units ?? []).map((u) => {
    const total = u.down + u.monthly * u.months;
    return {
      "@type": "Offer",
      name: `${project.name} — ${u.name}`,
      priceCurrency: "PKR",
      price: total,
      availability: "https://schema.org/InStock",
      url,
    };
  });
  return {
    "@context": "https://schema.org",
    "@type": "Residence",
    "@id": `${url}#residence`,
    name: project.name,
    description: project.seo?.description || project.short,
    url,
    image: project.seo?.ogImage || project.heroImage,
    address: {
      "@type": "PostalAddress",
      streetAddress: project.location,
      addressLocality: "Lahore",
      addressRegion: "Punjab",
      addressCountry: "PK",
    },
    ...(offers.length
      ? {
          makesOffer: offers,
          numberOfAccommodationUnits: project.units!.length,
        }
      : {}),
    provider: { "@id": ORG_ID },
  };
}

export function faqLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
