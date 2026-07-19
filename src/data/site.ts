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
