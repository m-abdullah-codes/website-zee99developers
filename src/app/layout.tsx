import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";
import { SITE } from "@/data/site";
import { GLOBAL_SEO } from "@/data/content";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const splineMono = Spline_Sans_Mono({
  variable: "--font-spline",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.domain),
  title: {
    default: GLOBAL_SEO.titleDefault,
    template: GLOBAL_SEO.titleTemplate,
  },
  description: GLOBAL_SEO.description,
  openGraph: {
    siteName: SITE.name,
    type: "website",
    locale: GLOBAL_SEO.locale,
    images: [GLOBAL_SEO.ogImage],
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f2e9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} ${splineMono.variable} antialiased`}
    >
      <body className="grain min-h-screen">{children}</body>
    </html>
  );
}
