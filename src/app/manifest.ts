import type { MetadataRoute } from "next";
import { SITE } from "@/data/site";
import { GLOBAL_SEO } from "@/data/content";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: "Zee99",
    description: GLOBAL_SEO.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f6f2e9",
    theme_color: "#f6f2e9",
    lang: "en",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any", purpose: "any" },
    ],
  };
}
