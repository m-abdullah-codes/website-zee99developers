import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/motion/SmoothScroll";
import Header from "@/components/chrome/Header";
import Footer from "@/components/chrome/Footer";
import WhatsAppFloat from "@/components/chrome/WhatsAppFloat";
import { SITE } from "@/data/site";

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
    default: "Zee99 Developers — We publish our numbers",
    template: "%s — Zee99 Developers",
  },
  description:
    "Fifteen years of building in Bahria Town Lahore. Every project delivered, every price on record. Now booking: Zee99 Lifestyle — terrace apartments facing the Safari Sports Complex.",
  openGraph: {
    siteName: SITE.name,
    type: "website",
    locale: "en_US",
    images: ["/images/home/featured-lifestyle.jpg"],
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
      <body className="grain min-h-screen">
        <noscript>
          <style>{`[data-reveal]{opacity:1!important}[data-lines]{visibility:visible!important}`}</style>
        </noscript>
        <SmoothScroll />
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
