// Sourced from D1 at build time (npm run pull → content/settings.json).
import settings from "../../content/settings.json";

type SiteSettings = {
  name: string;
  tagline: string;
  domain: string;
  phoneDisplay: string;
  phoneIntl: string;
  waNumber: string;
  email: string;
  address: string;
  directionsUrl: string;
  waMessages: { default: string; siteVisit: string; overseas: string; channel: string };
};

export const SITE = settings.site as SiteSettings;

export type SocialLink = { label: string; url: string };

/**
 * Seed list, used until the `social` settings row exists in D1 — saving that
 * tab in the dashboard creates the row and takes over from here. Also what the
 * dashboard pre-fills the editor with, so both paths start from one list.
 */
export const DEFAULT_SOCIAL: SocialLink[] = [
  { label: "Facebook", url: "https://www.facebook.com/Zee99developersofficial/" },
  { label: "Instagram", url: "https://www.instagram.com/zee99developersofficial" },
  { label: "YouTube", url: "https://www.youtube.com/@zee99developersofficial" },
  { label: "TikTok", url: "https://www.tiktok.com/@zee99developersofficial" },
];

/** Social profiles, in dashboard order. */
export const SOCIAL: SocialLink[] = (
  (settings as Record<string, unknown>).social as { links?: SocialLink[] } | undefined
)?.links?.filter((l) => l?.url && l?.label) ?? DEFAULT_SOCIAL;

export const waLink = (message?: string) =>
  `https://wa.me/${SITE.waNumber}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export const WA = {
  default: waLink(SITE.waMessages.default),
  siteVisit: waLink(SITE.waMessages.siteVisit),
  overseas: waLink(SITE.waMessages.overseas),
  channel: waLink(SITE.waMessages.channel),
};

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/payment-planner", label: "Planner" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
] as const;

export type Stat = { value: number; suffix: string; label: string };

export const STATS = (settings.stats as { items: Stat[] }).items;
