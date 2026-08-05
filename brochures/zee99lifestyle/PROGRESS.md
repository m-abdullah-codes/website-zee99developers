# PROGRESS — Zee99 Lifestyle

Working memory for the build. Newest round at the top.

---

## Round 10 — the shipping pass

Client, finalising for delivery. Six items, all done.

- **"Built small, on purpose" is gone.** It led with the limit and made a virtue
  of it, which is an apology wearing a headline. Now **"Every square foot earns
  its place."** Same fact, stated as an advantage.
- **Every CTA removed.** The three mid-document contact blocks added last round
  are deleted, and the Maps link lost its button shape, which made it the only
  button in the document and pointed off the page. `facts.md` was right and the
  round-9 addition was wrong: the closing block is the only contact surface.
- **The four commercial states are now told apart by ground, not by ring.** They
  differed only in border hue at one pixel: an oklch(62%) ring and an oklch(74%)
  ring, eleven pixels across, over a photographic drawing, are the same circle.
  Available is solid accent, reserved is an accent wash with a full-strength
  ring, booked is a flat grey disc with no ring, sold is struck through. The key
  is drawn at the marker's own size so the two can be held against each other.
- **The page no longer narrates its own gaps.** Out: the paragraph under the
  chart explaining why two payments are not on the axis, the "Not answered here"
  list of eight, the unpublished-terms line on the rental programme, the "ask for
  them in writing" clause, and three repetitions of "date to be confirmed". The
  gaps are unchanged and nothing unsourced has been added; they now travel in
  **QUESTIONS.md**, which is the client's list, not the buyer's.
- **Site photographs are in.** Four supplied, moved to `assets/site-progress/`,
  through the same pipeline as everything else. Sequenced by what is visible in
  each frame rather than by filename: crane and frame rising, slabs to the upper
  floors, topped out, facade and planting. **No dates, because none were
  supplied** — see QUESTIONS.md item 4.
  - Laid out as a **2×2 grid of equal cells at every width.** The first attempt
    gave the most recent frame full width and ran the other three small beneath
    it, on the theory that "where is it now" is the only question. Wrong twice:
    it made one image read as a different kind of object from the other three,
    and it shrank the three that carry the actual progression to about a hundred
    pixels each. Four photographs of one corner at four times are four of the
    same thing, so they are the same size, and the sequence reads across then
    down. Captions cut to two to four words each so all four sit on one line at
    360px and the two rows align.
  - The lead read **"No renders below this line."** It only meant anything to a
    reader still holding thirty screens of renders in mind; alone it is a note
    about the document, not about the building. Now it says what the four
    photographs are and that they are in order.
- **Em dashes out of the copy.** Every one in reader-visible text is now a comma,
  a colon or a full stop. En dashes stay in numeric ranges (`305–486 sq ft`),
  which is what they are for.

**One thing worth knowing:** every gate figure in round 9 was measured against a
stale `astro dev` server left running from an earlier session, which was serving
old CSS over new markup. It is killed; `npm run preview` now serves the real
`dist/`, and every number below is re-measured against the build that ships.

| Gate | Budget | 360px | 1440px |
|---|---|---|---|
| Horizontal overflow | none | none | none |
| Text clipped past viewport | none | none | none |
| Touch targets < 44px | none | **0** | n/a |
| Console errors | none | 0 | 0 |
| Document height | — | 37.8 screens | 30.5 screens |
| Initial view | < 2 MB | **0.82 MB** | |
| Interactive (4G + 4× CPU) | < 2,500 ms | **334–428 ms** over 4 runs | |
| CLS | < 0.1 | **0** | |
| Data reconciliation | 0 mismatches | **0** across 54 assertions | |
| Copy gate | clean | **clean** | |

---

## Round 9 — findability

Client direction, verbatim: *anyone who wants to see the photos, payment plan
etc. for studio / 1 BED / 2 BED or commercial shops should find no difficulty in
doing so.* Mid-round: *make the payment plan of each one expandable and
collapsable, it is making the whole page a mess of numbers*; then *the floor plan
and the interior images were looking good above and below each other and you have
now injected the payment plan between them*; then *the first and foremost
priority is mobile view*.

The document was 37 phone screens with **no navigation of any kind** — the
brochure conceit ("a brochure does not have one") held right up until the point
where the thing being asked for was three thousand pixels away with no route to
it. That was the round.

- **An index.** The rail already reported position; it now also returns you.
  One word — INDEX — opens a sheet with seven destinations (Studio · 1 Bedroom ·
  2 Bedroom · Shops · Payment plans · What is left · Contact) over the fourteen
  sections, with the reader's current section marked. The desktop ticks became
  links at a 24px pitch: at the old 7px the fourteen hit areas overlapped, so a
  click meant for §07 landed on §06.
- **Each plan's payment schedule sits with its plan**, not nineteen screens
  down in §08. Folded shut, after the client's note: the summary carries the
  monthly and the total, the five components that reach the total are one tap
  away. DOM order is head → schedule → prose → plan, so on a phone the drawing
  still runs straight into the photographs; above 900px the grid lifts the
  schedule beside the plan, into a column that was empty for its whole height.
- **Commercial got prices.** Five screens of shops had contained no shop price
  at all — every rupee figure was a *rate*, and the only route to a unit's
  figures was tapping a marker, so with scripting off all twenty-three were
  unreachable. Now: a price band in each floor's facts, and a disclosure listing
  every unit with size, price, down payment, monthly and state, as plain markup.
  Tapping a marker lights its row and the panel gained down/monthly.
- **The drawings enlarge.** Every photograph had tap-to-enlarge; the floor
  plans — the one thing on the page a buyer has to *read* — did not, and at
  360px the residential plate renders 318px wide with three-pixel lettering.
  One shared dialog now serves all seven drawings, opening at ~2× the frame
  and panning, with the affordance stated rather than implied.
- **The chooser shows rooms.** Three empty outline squares were the first thing
  a skimmer met of the homes, and an empty bordered square is indistinguishable
  from an image that failed to load. Each tile is now a real interior with area,
  price and what is left; the to-scale comparison keeps its own device below.
- **Contact three times, and dialable.** It appeared once, at 98.9% of the page,
  with no `tel:` anywhere. A quiet rule with the number now closes the homes,
  the commercial section and the numbers.
- **The cover names the product.** "Apartments" first appeared at screen 2.2 and
  the first price at screen 3.6; both are now stamped on the first frame.
- **Inventory: 48 cards → 6 rows of marks.** 3,947px of identical bordered
  rectangles answering a question the four totals above already answered. The
  floor is the unit of interest and the unit number is the whole label.
- Exteriors re-cast: the corner view opens (render 5), the dusk view closes
  (render 3). Three sections took a sunk ground, so the numbers stand alone on
  paper as the brightest thing in the document. Dangling separator pipes gone
  from the amenity lists and the inventory legend. The keys bar was a grey
  skeleton with the colour logic inverted; it is now thirty-six months with the
  last six lit.

Net: 39.8 → **39.5 screens** despite everything added. Initial view 0.82MB,
interactive 278ms, CLS 0, zero clipped text, zero sub-44px targets on mobile.

---

## Current state — round 7

**Stack:** Astro 5 (static, no CMS, no backend) · sharp image pipeline · Playwright for
evidence capture. Self-hosted Archivo Variable + Newsreader (57KB total, latin subset).

**Automated gates — all passing**

| Gate | Budget | Actual |
|---|---|---|
| Data reconciliation | 0 mismatches | **0** across 54 assertions |
| Copy | no banned phrases | **clean** |
| Interactive (4G + 4× CPU) | < 2,500 ms | **286 ms** |
| Initial view | < 2 MB | **0.83 MB** |
| FCP / LCP | — | 1,324 ms |
| CLS | < 0.1 | **0** |
| Horizontal overflow @360 | none | **none** |
| Text clipped past the viewport | none | **none** |
| Touch targets < 44px | none | **none** |
| Console errors | none | **none** |

`npm run build` runs the data gate → build → copy gate. A hallucinated figure or a
banned phrase fails the build rather than shipping.

---

## Decisions that govern everything

**Concept — "One Evening" (direction.md option A).** Carried as a real material
progression, not a colour gimmick: cool dusk ground throughout, warm interior imagery
warming the middle, the accent used as lamplight. Never stated on the page.

**Palette is sampled, not chosen.** `scripts/sample-palette.mjs` reads pixels from the
renders. The building has a genuine two-hue axis — dusk glazing at hue ~248, timber and
laminate at hue ~71, near complementary. Ground is `oklch(97.6% 0.0045 252)`: blue-grey,
explicitly *not* hue-85 cream. The accent appears in exactly two places (available
inventory, the possession marker) and nowhere else.

**Type inverts the cliché.** Grotesque (Archivo, true tabular figures) for display,
labels, tables and every number; warm serif (Newsreader) for body prose only. The AI tell
is serif *display* on cream; this is the opposite pairing on a cool ground.

**Boldness is spent on scale and air, not on inversion.** Round 4 had the numbers section
as a deep inverted panel. Client direction mid-build was explicit — light, minimal,
sophisticated — so it was rebuilt light. It earns its status as the peak through the
largest type in the document and the most generous spacing. Only the opening cover is
dark, and that is a photograph, not a theme.

**Section order — the homes second, the builder after the numbers.** The reader
opened this from WhatsApp already knowing the price and already interested, so the
thing itself comes before the evidence for it; the address, specification and floor
plate follow. On the builder, `direction.md` offers both positions and calls each
defensible. Doubt peaks the moment the price is seen; the run that follows (record →
what is left → the site) answers a buyer's questions in the order they occur.

**Motion — one orchestrated moment.** The payment timeline draws once on first view:
bars grow left to right, then the keys marker and the after-handover band arrive as the
run passes month 30. Nothing else on the page animates on scroll. `prefers-reduced-motion`
disables it; the plot is visible by default and only hidden once JS confirms it will
reveal, so a failed observer can never leave a blank figure.

---

## Round 8 — what three critics found

Three Opus critics against the rendered build, pixels only. Full reports and the
ranked backlog are in **CRITIQUE-r7.md** — read that before the next round.

Fixed here:

- **The fixed rail printed on top of body text.** Two critics found it
  independently; one measured it at glyph level across 516 scroll positions —
  **60 positions, 11.6%, with true overlap**, 50 distinct strings, including
  `Rs 6,840,000` struck through 35×16px. The 27px bar was transparent. It now
  has an opaque ground, a scrim over the cover, no `mix-blend-mode`, and the
  document has `scroll-padding-top` so anchors do not land underneath it.
- **The payment figure card did not add up.** `TOTAL Rs 9,000,000` sat beside
  down + monthly×36 + at-possession, which is **Rs 6,540,000**. The structure
  and half-yearly payments were exiled below the chart under "Not on the axis" —
  correct for the axis, wrong for the card. All five components are now in the
  card and a line under it shows the arithmetic resolving to the total. Off the
  axis they remain, with only the reason left down there.
- **The four "photograph pending" boxes are gone.** Named by one critic as the
  single cheapest-looking thing in the document: dashed border, flat grey fill,
  a wireframe image glyph — the only icon in 28,000px, and it was a placeholder
  icon. Admitting the gap in a sentence is candid; drawing four empty frames to
  illustrate the gap is a wireframe on a finished page.
- **One landmark list, not three.** §05's map key, §05's own list and §06's
  "Across the road" printed the same eleven names — the last two identical down
  to the wording, 1,400px apart. §06 now points back to the map.
- The page's only sub-44px target, a 60×15px cross-reference.

Document 40.7 → **39.8 screens**; the backlog in CRITIQUE-r7.md accounts for
roughly 7 more.

## Round 7 — the homes come third

Client direction, verbatim: too much boring scroll before the *Three plans*
section arrives; that section is good. The worst and cheapest-looking thing is
the small section with the three squares. It must be absorbable by someone who
does not like to read, and it must look attractive and clean.

**Measured before touching anything.** At 360px the document ran 41.4 screens
and *Three plans* did not begin until **screen 10.6** — cover (1.0), the
proposition (2.0), the address (2.1), the three squares (1.2), the
specification (1.9), the typical floor (2.4). Ten screens of preamble for a
reader who arrived from WhatsApp already knowing the price.

- **The homes moved from sixth to second.** They now begin at **screen 2.8**.
  The address, the specification and the floor plate are all *evidence*, and
  evidence reads better after the thing it supports than in front of it. Whole
  document renumbered, 15 sections down to 14.
- **The three squares are gone as a section.** "Built small, on purpose" was
  never a separate idea — it is the premise of the three plans, and a reader
  choosing between them wants the premise and the choice in one glance. It is
  now the opener of §02.
- **What replaced them: the chooser.** The entire residential offer in about
  200px — three areas drawn to scale on a shared ground line, each with its
  area set large, its price in lakh/crore, and how many are left in the accent.
  Each tile is an anchor into its own plan below. A skimmer gets the whole
  residential proposition without reading a sentence.
- **Why the old version looked cheap, specifically.** A 45° `repeating-linear-
  gradient` hatch. Hatching reads as *placeholder* — the thing a drawing does
  before it is finished. The first replacement swapped it for a flat grey fill,
  which read as an image that had failed to load; a bordered card around each
  square then cut the shared ground line, which is the only thing that makes
  three squares legible as a scale comparison. What works is the outline on a
  ground line, and nothing else in the box.
- **Proposition cut from two paragraphs to one.** The dropped sentence — eight
  floors, two commercial, six residential, corner plot — is already the four
  figures standing directly under it.

Initial view 0.83MB → **0.78MB**, interactive 286ms → **251ms**.

## Round 6 — dead controls, and keys that key nothing

Round 5's critics never reported — the session ended mid-run. This round was a
census of every interactive-looking thing on the page, every legend, and every
box that could be laid out wider than the phone holding it. Done against the
rendered build, measured rather than eyeballed.

- **48 buttons in §11 that did nothing.** Every apartment tile was a
  `<button type="button">` with a pointer cursor, a hover state, a place in the
  tab order and a verbose `aria-label` — and no click handler anywhere in the
  codebase. A pointer user clicked and got nothing; a keyboard user tabbed
  through 48 dead controls. Tiles are now static. This was the page's one false
  affordance: a census of the remaining controls (29 gallery thumbs, 23 plate
  markers, 6 arrows, 3 unit tabs, 7 questions, 3 links) confirms every other one
  is wired.
- **The tiles were hiding what a buyer wants.** `sq ft` and price sat in the
  markup at `display: none` — announced to screen readers, shown to nobody.
  Area is now on the face of every tile. Price is not: one rate covers every
  floor, so it is stated once in §09, and printing it 30 times would argue
  against the section that makes that point.
- **§11's key explained nothing.** Four circles — a filled dot and three rings —
  standing in for a grid of rectangles distinguished by fill, border weight and
  a dashed edge. Nothing mapped, and the ring pattern read as a radio group.
  Each swatch is now a miniature of the tile it names.
- **§08's key had drifted.** Round 5 gave every plate marker an opaque ground so
  a sold unit could not vanish into the drawing. The legend kept its hollow
  rings, and drew *sold* in a colour the plate no longer used. Both corrected.
- **§08 was losing half its text on a phone, and had been for five rounds.**
  `.floors` is a grid with no declared track, so its items took `min-width:auto`
  and sized to min-content — 660px, the floor the plate holds below 760px to keep
  its markers tappable. Every floor block was therefore laid out 660px wide in a
  320px column: the plate's own scroller never engaged, and the four facts
  (units, sizes, rate, available), the descriptive paragraph and the caption ran
  off the right edge, where an ancestor clipped them. On a 360px phone *"Sizes
  305–486 sq ft"* and *"Available 4"* simply did not exist. One line —
  `grid-template-columns: minmax(0, 1fr)` — and the plate pans as designed.
  The `minmax(0, …)` at line 154 shows the author knew the idiom; the outer
  track was just left implicit.
- **The overflow gate could not see it, so the gate was widened.** It only ever
  asked whether the *document* scrolled sideways. Content clipped by an ancestor
  never reaches `documentElement.scrollWidth`, so five rounds of green meant
  nothing here. `shoot.mjs` now also walks every text leaf and fails on any whose
  box falls outside the viewport, exempting anything inside a real horizontal
  scroller. Confirmed against the regression: reverting the one line above turns
  `clipped:0` into `clipped:27`, naming the elements.
- **The monthly run read as a dotted line.** At 1440 the plot is 1,120px wide
  with a 30px column pitch, and a 17px bar cap left 13px of gap — 44% of the
  axis was empty, which broke thirty-six payments into thirty-six dots. The cap
  is now high enough that the percentage governs at every width the plot reaches
  (gap 44% → 26%). Bar *heights* are untouched: a monthly installment is 5% of
  the down payment and the chart says so.

**Looked at and deliberately left alone.** The 20:1 height ratio in the payment
plot — it is the truth, and a cumulative curve would be worse, not better: the
structure payment and the six half-yearlies have no defined month, so any
"paid to date" line would silently omit 27% of the price. The plot's refusal to
place them is the honest choice and it stays.

## Round 5 — gallery restructure, video weight

- **Gallery was making the document unfinishable.** The staggered desktop grid ran the
  homes section to **22,882px on its own**. Replaced with a horizontal filmstrip at every
  breakpoint, keeping a small deterministic vertical offset for rhythm. Desktop page
  height 35,451 → **28,689px**. Pointer users get explicit arrow controls, since a
  horizontal track is not discoverable with a mouse the way it is with a thumb.
- **Video down to 571KB on phones.** Three renditions (540/720/1080). Initial view
  1.52MB → **0.83MB**. Still skipped entirely on save-data, 2G/3G, or reduced-motion.
- Kiosk marker was rendering as "1" alongside shop L1 on the same plate — now "K".
- Sold markers were invisible against the drawing; every marker now keeps an opaque
  ground so a taken unit reads as taken rather than as missing.
- Inventory state totals combine residential and commercial; each now shows its split so
  "44 available" is never mistaken for the apartment count.

## Round 4 — light rebuild

- Numbers section and closing frame converted from deep-inverted to light.
- Timeline rebuilt from SVG to CSS: an SVG scaled to fit either shrank labels to ~5px on
  a 360px phone or distorted them with `preserveAspectRatio="none"`.
- Monthly bars widened (9px → 17px cap): at 5% of plot height they were reading as a
  dotted line rather than as thirty-six payments.
- Keys and band labels were colliding at 360px — now stacked on separate lines.

## Round 3 — performance

- **Interactive 3,700ms → 257ms.** `Picture.astro` carried an `is:inline` script and the
  component renders 45 times, so the same 530-byte block shipped 45 times. Moved to a
  single delegated listener in the layout.
- `scopedStyleStrategy: 'class'` — `data-astro-cid-*` was 47KB across ~2,000 elements.
- WebP ladder moved onto `<img srcset>` instead of a second `<source>`.
- Lightbox now reads srcsets off the clicked thumbnail instead of embedding 18KB of
  duplicate JSON.
- HTML 302KB → 260KB (38KB gzipped).

## Round 2 — first render, first defects

- All three unit-type panels rendered at once: a class setting `display:flex` beats the
  UA sheet's `[hidden]`. Fixed globally.
- `color-mix` in oklch between hue 71 and hue 264 takes the long way round and lands on
  purple. Stated directly instead.

## Round 1 — foundation

- Data gate written first and run before any design work. **54 assertions, 0 mismatches.**
  Every residential schedule sums exactly to its total; all 23 commercial schedules
  reconcile to the rupee; the 18,000/sqft rate holds on all 48 apartments.
- Image pipeline: 640MB of source (29 interiors at 3840×2804) → **23MB** of AVIF+WebP
  derivatives across 46 images, with inline LQIP and dominant colour.
- Benchmark set captured to `docs/reference/` — see `NOTES.md` for what was taken from it.

---

## Verified against the drawings, not just the text

Several lines in `direction.md` asserted things `facts.md` does not contain. Each was
checked against the actual drawing before being allowed on the page:

- **"One five-foot corridor"** — the residential plan letters `CORRIDOR 5'-0" WIDE`. Kept.
- **Lift and stair at the centre of the plate** — confirmed on the plan. Kept.
- **Studio's "separator wall, not a curtain"** — drawn as a solid partition; the edge is
  lettered `BACK VENTILATION`. Kept.
- **2-bed "dining table for six"** — six chairs are drawn. **"Bedrooms at opposite ends"**
  — confirmed. **A laundry** — a washing machine is drawn. Kept.
- **Shop 09's discount** — the plan shows it landlocked between shops 01, 02, 05, 06 and
  the corridor, with no arcade frontage. This is now stated on the page rather than hidden.

### Cut because nothing supports them

- *"The last one finished early"* (draft headline, §10) — **false**. Takwa Center and
  Safari Apartments are delivered with no timing given; Zee99 Arcade is still running.
  Replaced with "Two delivered. The third is ahead of schedule."
- *"costs less than a plot two sectors out"* — an unsourced price comparison.
- *"a neighbourhood that stopped waiting for its future a decade ago"* — invented date.
- *"across the 80-foot road"* — `facts.md` gives 40-foot and 60-foot roads only.
- *"Chosen for service records in this market, not for the logo"* — asserts a rationale
  nothing supports. Replaced with what the table itself demonstrates.
- The *100+ Happy Customers* laurel, per the brief.

---

## Known gaps — see QUESTIONS.md

Nothing below is invented or filled with a plausible placeholder.

1. Structure and half-yearly payment **months are undefined**, so those payments are
   listed as amounts and deliberately kept off the timeline axis, with a visible note.
2. **Rental programme terms** unpublished — described qualitatively, gap stated on the page.
3. **No named owners** — testimonials may not be invented.
4. **Site photographs do not exist** — slots admit they are placeholders; no render is
   used as a stand-in.
5. `facts.md` and `direction.md` **disagree on the road description**; resolved in favour
   of `facts.md`, flagged for confirmation.
6. "Nishter" vs "Nishtar" — set exactly as sourced, flagged.

---

## Next

- A final read of the whole document top to bottom at 360px, judged as a reader
  receiving it on WhatsApp rather than as a set of sections — the one thing
  section-by-section review cannot catch is whether 41 screens finish.
- The six items in QUESTIONS.md still need a human answer; none of them are
  design work.
