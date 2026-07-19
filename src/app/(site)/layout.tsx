import SmoothScroll from "@/components/motion/SmoothScroll";
import Header from "@/components/chrome/Header";
import Footer from "@/components/chrome/Footer";
import WhatsAppFloat from "@/components/chrome/WhatsAppFloat";
import JsonLd from "@/components/seo/JsonLd";
import { organizationLd, websiteLd } from "@/lib/seo";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <JsonLd data={[organizationLd(), websiteLd()]} />
      <noscript>
        <style>{`[data-reveal]{opacity:1!important}[data-lines]{visibility:visible!important}`}</style>
      </noscript>
      <SmoothScroll />
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
