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
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.domain }],
  creator: SITE.name,
  publisher: SITE.name,
  manifest: "/manifest.webmanifest",
  keywords: [
    "Zee99 Developers",
    "Bahria Town Lahore apartments",
    "Zee99 Lifestyle",
    "apartments for sale Bahria Town",
    "installment plan apartments Lahore",
    "property in Bahria Town Lahore",
    "overseas property Pakistan",
  ],
  formatDetection: { telephone: true, address: true, email: true },
  alternates: { canonical: "/" },
  openGraph: {
    siteName: SITE.name,
    type: "website",
    locale: GLOBAL_SEO.locale,
    url: SITE.domain,
    title: GLOBAL_SEO.titleDefault,
    description: GLOBAL_SEO.description,
    images: [{ url: GLOBAL_SEO.ogImage, width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: GLOBAL_SEO.titleDefault,
    description: GLOBAL_SEO.description,
    images: [GLOBAL_SEO.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f2e9",
  colorScheme: "light",
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
