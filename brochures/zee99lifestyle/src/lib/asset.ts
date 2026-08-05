/**
 * Paths to files in public/.
 *
 * The brochure is served from a sub-path of the main site, not from a domain
 * root, so `/img/x.avif` would resolve against zee99developers.com and 404.
 * Astro rewrites only the assets it bundles itself (`_astro/*`); the image
 * ladder, the cover video, the fonts and the OG image are ours to prefix.
 *
 * Every hand-written reference to public/ goes through here. Vite inlines
 * BASE_URL at build time, so this costs nothing at runtime and works the same
 * inside a client <script> as it does in frontmatter.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** `asset('/img/hero/640.avif')` → `/zee99lifestyle-e-brochure/img/hero/640.avif` */
export const asset = (path: string) => `${BASE}${path}`;

/**
 * Absolute, origin-included form. Required for og:image: WhatsApp and Facebook
 * do not resolve relative URLs when they unfurl a link, and an unfurled card is
 * the first thing a buyer sees of this building.
 *
 * The origin comes from `site` in astro.config.mjs — the one place it is
 * written down. Drop that config and this throws at build rather than shipping
 * a card that silently points at the wrong host.
 */
export const absoluteAsset = (path: string) =>
  new URL(asset(path), import.meta.env.SITE).href;
