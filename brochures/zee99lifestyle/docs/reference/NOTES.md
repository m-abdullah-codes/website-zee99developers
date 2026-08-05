# The benchmark set

Captured by `scripts/capture-refs.mjs` into this folder. These are the comparison
targets — award-winning practices and luxury residential developers, not real-estate
templates. The bar: a stranger shown our page beside these cannot tell which had the
biggest budget.

## What was captured

| File | What it is | Why it's here |
|---|---|---|
| `john-pawson--*` | John Pawson, architect | The minimalism benchmark |
| `snohetta--*` | Snøhetta | Award-winning practice; layout and motion |
| `111-west-57th--*` | 111 West 57th St, NYC | Luxury residential development, very large budget — our direct category |
| `norm-architects--*` | An architecture practice (see caveat) | Editorial grid, image-led |
| `vipp--*` | Vipp — **failed**, landed behind a cookie wall on a Refunds page | Recapture or discard |
| `david-chipperfield--*` | David Chipperfield Architects | Architectural rigour, editorial type |

**Caveat:** `normarchitects.com` resolves to a practice publishing Turkish projects
(Acıbadem, Galataport), not the Danish studio Norm Architects (`normcph.com`). The
capture is still usable as a grid/whitespace reference; it is not the studio intended.

---

## What the references actually teach

### 1. Type is small relative to the image, and light in weight
Pawson sets the practice name at roughly 24px on a 2880px-wide frame — perhaps 0.8% of
the width. Snøhetta's opening statement is large but its **weight is regular, not bold**.
Impact comes from size and space, never from weight. Bold display type is what cheap
pages reach for.

→ *Applied:* display weights held at 470–500 throughout. Nothing on the page is 700.

### 2. Confidence is a full bleed and nothing else
Pawson's page is one dusk photograph filling the viewport, name in the corner, no
headline, no CTA, no scroll indicator competing for attention. Notably it is the exact
register of our own assets: blue hour, dark massing, warm lit windows.

→ *Applied:* the cover is the video full-bleed, title low and left, one line after two
beats. No centred hero. No button.

### 3. Images bleed off the edges and stagger; they do not sit in tidy cards
Snøhetta's grid is deliberately irregular — images run off both edges at different
vertical offsets and different widths, overlapping the type block above. A neat
three-column card deck is the tell of a template.

→ *Applied:* galleries and section imagery break the container and stagger rather than
aligning to a card grid.

### 4. Captions are a pair: dark label over grey sub-label, both small
"Rohde & Schwarz Campus" / "Sculptural high-rise for Munich" — set small, tight, two
tones of the same neutral. Never centred, never boxed.

→ *Applied:* the caption pattern is one component reused everywhere.

### 5. Enormous vertical space is doing the work
All three leave half a viewport empty below a content block. The space is the luxury
signal; ornament is not.

→ *Applied:* `--section-y` runs to 10rem at desktop, and no section is allowed to fill
its viewport edge to edge.

### 6. Backgrounds are near-white and cool, not cream
Snøhetta and Chipperfield both sit on a very light neutral with a cool cast. None of the
references uses a warm cream ground with a serif display face — the exact combination the
brief flags as the current AI-design tell.

→ *Applied:* ground is `oklch(97.6% 0.0045 252)` — hue 252, blue-grey, sampled from the
building's own dusk glazing. Display is a grotesque; the serif is used for *body* only,
inverting the cliché pairing.
