import Link from "next/link";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";

/**
 * The 404, at the root of app/ rather than inside the (site) group.
 *
 * Only the *root* not-found handles URLs that match no route at all, and only
 * the root one is exported as `out/404.html` — which is the file the Worker
 * serves for every unmatched path (`not_found_handling: "404-page"` in
 * wrangler.jsonc). Inside the route group this component was never reached:
 * every miss got Next's built-in "404: This page could not be found."
 *
 * Being at the root means the (site) layout does not wrap it, so it carries
 * its own mark and its own way back.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center bg-paper px-6 text-center">
      <Link href="/" aria-label="Zee99 Developers — home" className="mb-14">
        <Logo />
      </Link>
      <p className="folio mb-9 text-ink-2">404 — Not on the map</p>
      <h1 className="max-w-2xl font-display font-[340] text-[clamp(2.6rem,6vw,5.4rem)] leading-[1.03] tracking-[-0.02em] text-ink">
        This plot is <em className="italic text-gold">empty.</em>
      </h1>
      <p className="mt-8 max-w-md text-[1rem] leading-[1.85] text-ink-2">
        The page you&rsquo;re after isn&rsquo;t on our drawings. The good corners
        are listed on the projects page.
      </p>
      <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
        <Button href="/" arrow>
          Back home
        </Button>
        <Button href="/projects" variant="outline">
          See the projects
        </Button>
      </div>
      <Link href="/blog" className="link-mono mt-12 text-ink-2 hover:text-gold">
        Or read the market notes
      </Link>
    </div>
  );
}
