import type { ReactNode } from "react";

export type Category =
  | "Market Analysis"
  | "Construction Updates"
  | "Buying Guides"
  | "Overseas Buyers";

export const CATEGORIES: Category[] = [
  "Market Analysis",
  "Construction Updates",
  "Buying Guides",
  "Overseas Buyers",
];

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  readTime: number;
  date: string;
  dateISO: string;
  cover: string;
  thumb: string;
  coverAlt: string;
  featured?: boolean;
  body: ReactNode;
};

function LedgerTable() {
  return (
    <figure className="overflow-x-auto border border-ink/10">
      <table className="w-full min-w-[420px] border-collapse font-mono text-[12px] tracking-[0.08em]">
        <thead>
          <tr className="border-b border-ink/10 bg-paper-2/60 text-left uppercase text-[10px] tracking-[0.22em] text-ink-2">
            <th className="px-5 py-3.5 font-medium">Booked / traded</th>
            <th className="px-5 py-3.5 font-medium">2 Bed</th>
            <th className="px-5 py-3.5 font-medium">1 Bed</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Dec 2024", "1.20 Cr", "72 Lacs", false],
            ["Jun 2025", "1.35 Cr", "84 Lacs", false],
            ["Dec 2025", "1.44 Cr", "90 Lacs", false],
            ["Now", "1.61 Cr", "107 Lacs", true],
          ].map(([t, two, one, hot]) => (
            <tr key={t as string} className="border-b border-ink/10 last:border-0">
              <td className="px-5 py-3.5 text-ink-2">{t}</td>
              <td className={`px-5 py-3.5 ${hot ? "font-bold text-gold" : "text-ink"}`}>{two}</td>
              <td className={`px-5 py-3.5 ${hot ? "font-bold text-gold" : "text-ink"}`}>{one}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption className="border-t border-ink/10 px-5 py-3 font-mono text-[9px] uppercase tracking-[0.24em] text-ink-2/70">
        Zee99 Arcade — transfer record, Dec 2024 → today
      </figcaption>
    </figure>
  );
}

export const POSTS: Post[] = [
  {
    slug: "what-34-percent-in-18-months-actually-looks-like",
    title: "What 34% in 18 months actually looks like",
    excerpt:
      "Everyone promises returns. Here's the price sheet of a building you can go stand in front of.",
    category: "Market Analysis",
    readTime: 4,
    date: "12 Jul 2026",
    dateISO: "2026-07-12",
    cover: "/images/blog/roi-cover.jpg",
    thumb: "/images/blog/roi-thumb.jpg",
    coverAlt: "Zee99 Arcade structure against the sky",
    featured: true,
    body: (
      <>
        <p>
          Every developer in Lahore promises &ldquo;high ROI.&rdquo; It&rsquo;s printed on flyers,
          shouted in reels, stamped on billboards. Almost none of them will show you a dated price
          history, because almost none of them have one worth showing.
        </p>
        <p>So here&rsquo;s ours.</p>
        <p>
          In December 2024, a two-bed apartment at Zee99 Arcade was booked at 1.20 crore. By June
          2025 it was trading at 1.35. December 2025: 1.44. Today, with handover approaching, the
          same unit is worth 1.61 crore. The one-beds followed the same curve — 72 lacs to 107.
        </p>
        <LedgerTable />
        <p>
          That&rsquo;s 34% in eighteen months. Not projected. <em>Traded.</em>
        </p>
        <h3>Where did the growth come from?</h3>
        <p>
          Not from luck, and not from the market alone — Bahria Town overall didn&rsquo;t move 34%
          in that window. Three things did the work.
        </p>
        <p>
          <strong>The corner.</strong> Arcade sits on plot R-102–109, main road, Tauheed Block,
          minutes from the Eiffel Tower. Frontage is finite. When a block matures, its corners
          appreciate first and fastest, because retail tenants and residents both pay for
          visibility. We didn&rsquo;t invent this rule; we just kept buying corners.
        </p>
        <p>
          <strong>The speed.</strong> Construction risk is the biggest discount priced into any
          under-construction project. Every month a site sits idle, buyers quietly mark it down.
          Arcade&rsquo;s grey structure was completed in 8 months — a stage that routinely takes 18
          to 24 in this market. Each published milestone removed risk, and removed risk shows up as
          price.
        </p>
        <p>
          <strong>The timing.</strong> Pakistan&rsquo;s real estate is exiting what we&rsquo;ve
          called <a href="/blog/the-end-of-the-casino-era">the casino era</a> — file trading is
          dying, and money is moving into buildings that actually get built. When capital flees
          paper for concrete, finished structures on good plots absorb it first.
        </p>
        <h3>The honest part</h3>
        <p>
          Could the market have gone the other way? Yes. Property can fall, and anyone who tells
          you otherwise is selling something too hard. What you can control is what you buy: a
          titled unit, on a corner, from a developer whose construction pace you can verify with
          your own eyes.
        </p>
        <p>
          Arcade&rsquo;s chart is closed to new buyers — that appreciation belongs to the people
          who booked in 2024. <a href="/projects/zee99-lifestyle">Zee99 Lifestyle</a>, one block
          over in Safari Block, is on the same method: corner plot, sports-complex frontage,
          published payment plan, monthly photo updates.
        </p>
        <p>
          We&rsquo;ll publish its price history the same way. Check back in eighteen months — or be
          on the chart this time.
        </p>
        <blockquote>
          Have questions about the numbers? WhatsApp us at 0312&nbsp;0000321. We&rsquo;ll show you
          the transfer record.
        </blockquote>
      </>
    ),
  },
  {
    slug: "buying-an-apartment-in-lahore-from-4000-miles-away",
    title: "Buying an apartment in Lahore from 4,000 miles away",
    excerpt:
      "No flights, no middlemen cousins, no guesswork. How overseas Pakistanis actually buy from us — step by step.",
    category: "Overseas Buyers",
    readTime: 5,
    date: "28 Jun 2026",
    dateISO: "2026-06-28",
    cover: "/images/blog/overseas-cover.jpg",
    thumb: "/images/blog/overseas-thumb.jpg",
    coverAlt: "Construction update shared to a phone screen",
    body: (
      <>
        <p>
          Every week we take calls from Manchester, Dubai, Sydney, Toronto. The question is always
          some version of the same one: <em>&ldquo;I want to own something back home — but I
          can&rsquo;t be there. How does this actually work without me getting burned?&rdquo;</em>
        </p>
        <p>
          Fair question. Distance is where most overseas property stories go wrong. Here&rsquo;s
          the honest, step-by-step answer.
        </p>
        <h3>1. Choose the unit on a video call</h3>
        <p>
          We walk the site live on WhatsApp — the actual floor, the actual view, the actual street
          noise. You&rsquo;ll see the neighboring plots too, because context matters more than
          renders. Floor plans, areas, and the full payment schedule land in your inbox the same
          day, in writing.
        </p>
        <h3>2. Book without flying</h3>
        <p>
          Booking needs your CNIC or NICOP, a filled form, and the down payment. No physical
          presence required. If you want a family member to sign locally, a simple power of
          attorney handles it — we&rsquo;ll send you the exact format your notary needs.
        </p>
        <h3>3. Pay through banking channels, always</h3>
        <p>
          Installments go through normal remittance to documented accounts. Never send property
          money through informal channels — you lose the paper trail that protects you, and under
          current regulations, banked remittances are what make your ownership clean. For{" "}
          <a href="/projects/zee99-lifestyle">Zee99 Lifestyle</a>, plans start around £695 or $899
          a month, which is the point: it&rsquo;s paced like a car payment, not a lump sum.
        </p>
        <h3>4. Watch it get built</h3>
        <p>
          This is where developers earn or lose overseas trust. We publish dated construction
          photos every month — the same updates that let Arcade buyers abroad watch a grey
          structure go up in 8 months from three continents. You should never have to ask a cousin
          to drive past the site.
        </p>
        <h3>5. Handover, rent, or hold</h3>
        <p>
          At completion you can take the keys, list the unit for rent (we&rsquo;ll connect you to
          managers working in Bahria Town), or hold. Titled apartments in established blocks rent
          quickly here — the same security and maintenance that attracts families attracts
          tenants.
        </p>
        <h3>Three red flags, wherever you buy</h3>
        <p>
          Not just with us — anywhere: a developer who won&rsquo;t put the full payment plan in
          writing; a site with no dated progress photos; and anyone who suggests keeping payments
          off the books &ldquo;to make it easier.&rdquo; Walk away from all three.
        </p>
        <h3>The short version</h3>
        <p>
          Buying from abroad isn&rsquo;t risky. Buying blind is. Insist on written plans, banked
          payments, and visible construction — and the distance stops mattering.
        </p>
        <blockquote>
          If you want to see how it works in practice, message us on WhatsApp at
          +92&nbsp;312&nbsp;0000321 with your city and budget. We&rsquo;ll do the site walk on your
          lunch break, your time zone.
        </blockquote>
      </>
    ),
  },
  {
    slug: "choosing-a-down-payment-like-an-investor",
    title: "10, 15, or 20: choosing a down payment like an investor",
    excerpt:
      "Three stops on the slider, three different strategies. How to pick the one your cash flow can actually keep.",
    category: "Buying Guides",
    readTime: 3,
    date: "30 May 2026",
    dateISO: "2026-05-30",
    cover: "/images/home/payment-schedule.jpg",
    thumb: "/images/home/payment-schedule.jpg",
    coverAlt: "A printed payment schedule",
    body: (
      <>
        <p>
          Every Zee99 plan comes with three down payment stops — 10%, 15%, and 20% — and the same
          question follows: <em>which one is right?</em> The honest answer is that it depends on
          your cash flow, not on the property. Here&rsquo;s how we&rsquo;d think about it.
        </p>
        <h3>10% — keep your powder dry</h3>
        <p>
          The smallest cheque at booking, the highest monthly after it. Right for buyers with
          strong, steady income who&rsquo;d rather hold cash for emergencies — or for a second
          unit. You&rsquo;re paying for flexibility with a heavier installment.
        </p>
        <h3>15% — the balanced default</h3>
        <p>
          The stop most buyers land on. A meaningful commitment at booking, a monthly that
          doesn&rsquo;t dominate the household budget. If you can&rsquo;t decide, decide this.
        </p>
        <h3>20% — the investor&rsquo;s stop</h3>
        <p>
          The lowest monthly and the calmest three years. Suited to overseas buyers paying by
          remittance and to anyone planning to rent the unit out at handover — the lighter the
          installment, the sooner rent covers it.
        </p>
        <h3>The rule that actually matters</h3>
        <p>
          Pick the monthly you can pay in a <strong>bad</strong> month, not a good one. A plan you
          keep beats a plan you stretch for. And if life interrupts anyway, talk to us before the
          due date — we build grace into every schedule; we&rsquo;d rather adjust than penalize.
        </p>
        <p>
          The fastest way to feel the difference is to move the slider yourself — the{" "}
          <a href="/projects/zee99-lifestyle#payment">payment visualizer</a> on the Lifestyle page
          shows all three plans side by side, to the rupee.
        </p>
        <blockquote>
          Ten minutes on WhatsApp — 0312&nbsp;0000321 — and we&rsquo;ll tell you which stop fits
          your situation. In writing, as always.
        </blockquote>
      </>
    ),
  },
  {
    slug: "arcade-month-by-month",
    title: "Arcade, month by month: a grey structure in eight months",
    excerpt:
      "The dated log of the build everyone said was too fast to be true — from excavation to top-out.",
    category: "Construction Updates",
    readTime: 3,
    date: "18 Apr 2026",
    dateISO: "2026-04-18",
    cover: "/images/projects/construction-1.jpg",
    thumb: "/images/projects/construction-1.jpg",
    coverAlt: "Concrete frame under construction",
    body: (
      <>
        <p>
          When we say Arcade&rsquo;s grey structure went up in eight months, people assume
          rounding. So here is the log as we published it, month by month, dates and all. This is
          the same record every Arcade buyer received on WhatsApp — many of them from three
          continents away.
        </p>
        <h3>The log</h3>
        <p>
          <strong>Dec 2024 — Launch.</strong> Bookings open at 1.20 Cr for a two-bed, 72 lacs for
          a one-bed. Mobilization begins the same month.
        </p>
        <p>
          <strong>Jan 2025 — Excavation and plinth.</strong> Foundations poured within weeks of
          launch. First dated photo set published.
        </p>
        <p>
          <strong>Mar 2025 — Floors rising.</strong> A slab roughly every three weeks. The
          photographs run in order; the dates don&rsquo;t skip.
        </p>
        <p>
          <strong>Aug 2025 — Grey structure topped out.</strong> Month eight. A stage this market
          routinely takes 18 to 24 months to reach.
        </p>
        <p>
          <strong>Since then</strong> — brickwork closed out in February 2026, finishes are
          underway now, and handover is approaching on schedule.
        </p>
        <h3>Why speed is a buyer&rsquo;s insurance</h3>
        <p>
          Every idle month on a construction site is a discount buyers quietly apply to your
          asset. Speed removes that discount — which is a large part of{" "}
          <a href="/blog/what-34-percent-in-18-months-actually-looks-like">
            how Arcade appreciated 34% before handover
          </a>
          . We don&rsquo;t build fast for the applause. We build fast because it&rsquo;s the
          cheapest protection a buyer can get.
        </p>
        <p>
          <a href="/projects/zee99-lifestyle">Zee99 Lifestyle</a> gets the same treatment: monthly
          photos, real dates, and a schedule you can hold us to.
        </p>
      </>
    ),
  },
  {
    slug: "the-end-of-the-casino-era",
    title: "The end of the casino era",
    excerpt:
      "File trading made a few people rich and a lot of people tired. The money is moving — here's where.",
    category: "Market Analysis",
    readTime: 4,
    date: "22 Feb 2026",
    dateISO: "2026-02-22",
    cover: "/images/home/arcade.jpg",
    thumb: "/images/home/arcade.jpg",
    coverAlt: "Zee99 Arcade at dusk",
    body: (
      <>
        <p>
          For twenty years, Pakistani real estate had a casino running in the middle of it: the
          file market. Plots that existed on paper, sold on momentum, flipped between dealers —
          sometimes twice in a day — while no brick was ever laid. It minted stories of overnight
          wealth, and it quietly buried many more stories of people who bought the top of a queue
          that led nowhere.
        </p>
        <h3>What changed</h3>
        <p>
          Three things, all at once. Documentation: taxes and filer requirements made anonymous
          flipping expensive. Banking: overseas money now moves through channels that want a real
          asset on the other end. And fatigue: a generation of buyers watched paper promises age
          badly, and started asking a very simple question — <em>where is the building?</em>
        </p>
        <h3>Where the money goes instead</h3>
        <p>
          Capital leaving paper doesn&rsquo;t leave property. It moves to titled units in projects
          that are visibly rising — developers with published schedules, dated photos, and
          finished structures. You can see it in our own numbers: through 2025, while file prices
          in most schemes went sideways, Arcade&rsquo;s two-beds moved from 1.20 to 1.44 crore —
          every step tied to a construction milestone you could photograph.
        </p>
        <h3>The three tests</h3>
        <p>
          If the casino era taught anything, it&rsquo;s this checklist. Before you buy anywhere —
          from us or anyone — ask for three things: a title you can verify, a payment plan in
          writing, and dated construction photos. A project that passes all three isn&rsquo;t a
          bet. It&rsquo;s a building.
        </p>
        <p>
          The casino is closing. The construction site is open — and{" "}
          <a href="/projects/zee99-lifestyle">the next one is booking now</a>.
        </p>
      </>
    ),
  },
];

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);

export const latestPosts = (n: number) =>
  [...POSTS].sort((a, b) => b.dateISO.localeCompare(a.dateISO)).slice(0, n);
