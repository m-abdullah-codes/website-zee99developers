import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export served as Cloudflare Worker assets; the Worker runs only for /api/*.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
