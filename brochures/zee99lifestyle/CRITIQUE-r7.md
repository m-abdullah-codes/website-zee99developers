# Critique — round 7 build

Three Opus critics run against the rendered build at 360 / 1440. They saw pixels
only: no source, no PROGRESS.md, no direction.md. Evidence in `shots/critic-*/`.

Nothing below is fixed yet except where marked **DONE**.

---

## Design / AI-tell critic — full report received

### The single cheapest-looking thing
**§11 Site progress — the four "PHOTOGRAPH PENDING" boxes.** Dashed 1px grey
border + flat grey fill + a generic 4-pane image glyph + centred letterspaced
grey caps. That combination *is* the universal wireframe-placeholder idiom. It
is the only icon in a 28,000px document and it is a placeholder icon. At 360 the
2×2 grid fills 470px of a 780px screen, so the lead scrolls into most of a phone
screen of empty grey boxes. The copy under it points *down* at slots that are
*above* it.
→ Delete the slots; let the one honest sentence stand, or replace with a dated
single-column log.

### Ranked, worst first

1. **§11 placeholder boxes** — above. Also: the milestone table's third column
   reads "Date to be confirmed" three times, and three identical dots encode
   three identical states. 3 facts, 6 units of filler. ~185px void after.
2. **§10 inventory — 71 peach cells, a spreadsheet wearing a card grid.**
   Available fill `oklch(0.964 0.015 76)` on a ground of `oklch(0.976 0.0045
   252)`: 1.2% darker but **176° opposite in hue** — a conditional-format cell,
   not a design decision. 2-across × 24 rows at 360 = **3,947px, five phone
   screens** of identical bordered rectangles. "AVAILABLE" repeats 44 times in
   ochre caps saying what the fill already says.
   → Drop the box-per-unit; one dense grid of unit numbers per floor, with
   availability carried by weight rather than fill.
3. **Nothing is the peak — measured.** 11 of 14 section headings are set at
   *exactly* 46px / 500 / −0.874px tracking. 12 of 14 sections carry *exactly*
   122.4px top and bottom padding (only `numbers` differs, at 187.2). Every
   section after the hero is `background: transparent` — 27,400px of one value.
   "Questions." gets the same rank as "Two floors of shopfront on the corner
   everyone walks past." No crescendo, no relief, nothing to remember.
   → Give two or three sections a different ground; drop at least three headings
   to sub-display size so the display sizes mean something.
4. **§08 the keys bar reads as a loading skeleton.** The headline is paid off by
   one flat grey rectangle labelled "Months 1–30" with an orange tail "6 more".
   No axis, no marker, no scale. The colour logic is inverted: the good news is
   the small tail, the grey mass is the waiting.
5. **§08 the payment plot is 93% empty.** ~1,250 × 380px of blank plot. The two
   oranges in the legend are ~15% apart in value at 10px — indistinguishable.
   A 3-line grey note admitting figures are "not placed on the axis" sits under
   the chart, which makes the chart look unfinished.
   → Move the caveat out of the visual. (Bar *heights* stay: the 20:1 ratio is
   the truth, and a cumulative curve would omit 27% of the price — see round 6.)
6. **Content stranded left, dead right half at 1440.** §05 leaves an ~860×1,340px
   empty rectangle; §07 has 540px holes inside both left columns; §09 a 540px
   hole under the stats; §12 strands the +/− **~950px** from the question text.
7. **The fixed rail strikes through body copy on mobile.** At 360 the rail is
   fixed 360×27 with **no background fill**: in `proposition--360.png` the
   hairline runs straight through "live in the middle of it." Elsewhere the
   counter collides with "7 available" and clips the "6 FLOOR" numeral. At 1440
   it duplicates the eyebrow that is already on screen.
8. **Four different four-up stat bars** — §01, §09, §10, §02, all the same idea
   in four inconsistent executions. §09 jams "15years" as one word. At 360 in
   §01 "MONTHS TO POSSESSION" wraps so **"30" sits ~170px below "23"**.
9. **The same 10 facts printed twice, 1,400px apart** — §05 "Within a few
   blocks" and §06 "Across the road" list an identical set in two styles. §05's
   map key repeats 5 of its own 7 items in the list directly below it.
10. **Numbered pins blot out the labels they point at** — pin ① sits exactly on
    "SHOP-01", ② on "SHOP-02", ⑤ eats "GROSS AREA 399SFT".
11. **Dangling separators and stub rules** — three trailing pipes at end-of-line
    in §06; the §02 scale baseline **overshot its box by ~120px**. **DONE**
12. **Arbitrary rule lengths** — three different rule widths inside §06, three
    more inside §09. Two status legends for the same four states (§07 circles,
    §10 boxes).
13. **No system in the measure** — body paragraph widths at 1440 measured 544,
    528, 439, 423, 361, 327 and 593px: an **81% spread**.
14. **Numbers that should align, don't** — the three comparison prices are
    left-aligned in 519px cells so the comma groups never stack; lakh and crore
    mix in one row; "Rs" floats ~10px above the "18,000" baseline.
15. **Wrong affordances** — "Tap a unit on the plan" renders on a 1440 desktop.
    The only button-looking thing sends the lead to Google Maps. "FBR / LDA /
    TMA" sit as three bare grey acronyms in an 800px band, exactly where three
    logos look like they failed to load.
    (Note: the phone number *is* a `wa.me` link. facts.md specifies it stay
    quiet and unstyled — "set by a typographer, not a marketer" — so the fix is
    affordance, not a button.)
16. **Hero wordmark fights the render's own signage** — "Zee99 Lifestyle" sits
    in the same optical band as the render's "SAPPHIRE" lettering, and a ~155px
    void splits the lockup into two blocks.

### Do not break these three
1. **The hero.** The only dark, image-led, high-contrast surface in the document.
2. **`Rs 18,000 / PER SQUARE FOOT`.** The one place where scale itself is the
   argument. Fix the "Rs" baseline, touch nothing else.
3. **The annotated architectural drawings** — the site plan and its numbered
   key, the typical-floor plate, the unit plans with their "FACING RESIDENCE" /
   "BACK VENTILATION" annotation rules. The only thing on the page that reads
   like an architecture studio made it.

---

## Absorption critic — full report received

Where the 40.7 screens went. Top four sections were **51% of the document**:
homes 5.73 · numbers 5.06 · inventory 5.06 · commercial 5.02 · building 3.49 ·
floor 2.36 · questions 2.26 · address 2.10 · spec 1.93 · builder 1.90 ·
proposition 1.79 · closing 1.64 · progress 1.36 · opening 1.00.

Also counted: **21 paragraphs of ≥20 words** averaging 31 words, and **426 of
~772 text elements rendering at 10–12px**.

1. **`commercial` — 5 screens of shops and not one price.** Every rupee figure
   in the section is a *rate*: `Rs 55,000/sq ft`, `Rs 35,000/sq ft`. No shop
   total appears anywhere in 31,736px, while every apartment gets a real number
   and a payment schedule. A buyer must do 380 × 55,000 in their head.
   → Put a rupee total, or a "from Rs X", beside each size band.
2. **`numbers` — the figure card came up Rs 2,460,000 short of its own total.**
   `TOTAL 9,000,000` against `DOWN 1,800,000 + MONTHLY×36 90,000 + AT POSSESSION
   1,500,000` = 6,540,000. The missing structure and half-yearly payments sat
   below the chart under "Not on the axis". **DONE** — all five components are
   now in the card, plus a line showing the arithmetic resolving to the total.
3. **`progress` — the "is it real?" section was four empty boxes.** 1.36 screens
   of negative-value content. **DONE** — slots deleted.
4. **Contact appears once, at 98.9% of the page.** `a[href^="tel:"]` → **0
   results**. One `wa.me` link at y=31,401 of 31,736. No name to ask for, no
   action verb; the label is just "WHATSAPP".
   → Repeat the number mid-document, after the homes and after the numbers.
5. **The same landmark list printed three times inside four screens** — the §05
   map key, §05's "Within a few blocks", and §06's "Across the road", the last
   two identical down to the wording. ≈1.4 screens for one list. **DONE** —
   §06's list replaced by a pointer back to the map.
6. **1.42 screens and 13 photos for a plan with none left.** `#home-2bed` is
   1,108px plus a **3,761px-wide** gallery track (~10 swipes) for a type the
   compare block directly above already marks `None left`.
   → Collapse sold-out plans; cap live galleries at 4–5 images.
7. **`inventory` — 3.58 screens of 48 cards answering a question already
   answered** at the top *and* the bottom of the same section.
   → Put the by-floor grid behind a "See all 48 units" disclosure.
8. **Floor plans are illegible at 360px and cannot be enlarged.** The `#floor`
   plate renders 318×318 css px with label cap-heights of ~3–4px, and the
   caption points at lettering the reader cannot read. Every interior render is
   `clickable: true`; **every floor plan is `clickable: false`**.
   → Give the plans the same tap-to-enlarge the photographs already have.
9. **Commercial plate shows 5 of 9 shops with no pan cue, pins over labels.**
10. **The cover names no product and no price.** "Apartments" first appears at
    screen 2.2 at 10.55px; "shop" at screen 18.6; the first price at screen 3.6
    at 12.06px. → A one-line stamp on the cover.
11. **`proposition` — "MONTHS TO POSSESSION 30 / Plan runs 36"** reads as a
    contradiction, and `30` appears twice in the same grid meaning two things.

Best three, unprompted: **the new chooser** ("the best thing on the page" —
answers what / how big / what it costs / what's left in under one screen), the
§01 four-up figure grid, and `builder`.

---

## Mobile / interaction critic — full report received

Driven with real touch drags at 320 / 360 / 390.

### Actually broken
1. **The fixed counter prints on top of body text.** Glyph-level scan over 516
   scroll positions: **60 positions (11.6%) with true overlap**, 50 distinct
   strings — `Rs 6,840,000` overlapped 35×16px, `Rs 14,400,000` 35×10px,
   `7 available`, `Fully taken`, `500 sq ft`. **DONE** — opaque ground, scrim
   over the cover, `mix-blend-mode` dropped, `scroll-padding-top` added.
2. **The lightbox barely enlarges anything.** `img` box 360×699 but painted area
   360×262 → **437px of dead space**; the thumbnail was 275×206, so "enlarge"
   buys ~31% linear. → Size the frame to the image's aspect ratio; allow pinch.
3. **No-JS: all 23 commercial units become unreachable** and the plate still
   says "tap a unit". Unit data lives only in inline JSON. Tabs and gallery
   thumbnails also stay tappable-looking and dead.
   → Render the unit table as real markup, enhanced away when JS runs.
4. **One WhatsApp link, at 40.7 viewport-heights down.** No `tel:` anywhere.
5. **Browser Back exits the brochure instead of closing the lightbox.**
   [Caveat from the critic: Chrome-on-Android's CloseWatcher may intercept this;
   headless cannot verify. Confirm on a real device before acting.]
6. **One sub-44px target** — the "section 07" cross-reference at 60×15px.
   **DONE.**

### Works, but not discoverable
7. **Half of each commercial plate is off-screen with no pan cue** — 320 of
   660px visible (48%; 42% at 320px). Panning works, but `scrollbar-width: thin`
   shows nothing on Android and the caption never says the plan slides. Plate 1
   has 7 of 14 markers off-screen at rest.
   *The galleries get this right* — 53px peek, live counter, drag works.
8. **The unit-type tabs change the numbers, not the picture** — the 36 monthly
   bars move by under 1px between types, so a user watching the chart sees
   nothing happen.
9. **Tapping the lightbox photo does nothing** — backdrop-close is implemented
   but the image covers the whole dialog, so the backdrop is unreachable.

### Verified working — do not "fix" these
Zero non-scroller horizontal overflow at 320/360/390. Payment timeline animates
in and **ends fully visible**; with `prefers-reduced-motion` it is drawn from
the first frame and never blank. Lightbox focus is properly trapped (8 tabs
never escaped), Escape closes, focus returns to the originating thumbnail, page
scroll preserved exactly. Plate markers 46×46, each populating the panel
correctly. Plan tiles are genuine anchors landing 0–2px from target. Accordions
work with and without JS. Gallery counters track and clamp. Vertical scroll is
not hijacked by the horizontal tracks. Gallery arrows collapse to 0×0 on mobile
and leave the tab order. No console errors.

### Worth knowing
**597KB of the 817KB initial payload is `opening-540.mp4`**, a decorative cover
loop that plays despite `preload="none"`. Both posters are fetched as well
(56KB avif + 43KB webp = 99KB) for a video that autoplays anyway.

---

## Fixed in round 8

- Rail overlay (mobile critic 1, design critic 7)
- Payment figure card reconciliation (absorption critic 2)
- §11 placeholder boxes (design critic's "cheapest thing"; absorption critic 3)
- Triplicated landmark list (design critic 9, absorption critic 5)
- Sub-44px cross-reference (mobile critic 6)
- Chooser ground-line stub (design critic 11)

## Still open, ranked by value

1. Commercial has no prices — 5 screens, half the inventory (absorption 1)
2. Inventory grid behind a disclosure — returns 3.6 screens (absorption 7)
3. Nothing is the peak: 11/14 headings identical, 12/14 paddings identical,
   every ground transparent (design 3)
4. No mid-document contact, no `tel:` (absorption 4, mobile 4)
5. Floor plans illegible and not enlargeable (absorption 8)
6. Lightbox dead space (mobile 2)
7. No-JS commercial units unreachable (mobile 3)
8. Commercial plate pan cue + pins over labels (design 10, absorption 9, mobile 7)
9. Sold-out 2-bed still gets 1.4 screens and 13 photos (absorption 6)
10. Four inconsistent stat bars (design 8); measure spread 81% (design 13);
    number alignment (design 14); stranded content at 1440 (design 6)
11. Cover names no product or price (absorption 10)
12. 597KB decorative video on the first impression (mobile)
