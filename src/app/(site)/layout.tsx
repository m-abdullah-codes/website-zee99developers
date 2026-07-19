import SmoothScroll from "@/components/motion/SmoothScroll";
import Header from "@/components/chrome/Header";
import Footer from "@/components/chrome/Footer";
import WhatsAppFloat from "@/components/chrome/WhatsAppFloat";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
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
