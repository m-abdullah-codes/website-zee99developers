# Open questions — Zee99 Lifestyle

Everything here is **missing from `docs/facts.md` and `data/inventory.json`**, and is therefore
**not on the page**. Nothing in this list has been guessed, approximated, or filled with a
plausible-sounding placeholder. Each item notes what the page does instead.

Last reviewed: 2026-08-05

> **Read this before the client does.** Until the shipping pass, the page carried
> short notes admitting each of these gaps in the reader's view: a paragraph under
> the payment chart explaining why two payments are not on the axis, a "Not answered
> here" list of eight unanswered buyer questions, a line saying the rental programme's
> terms are unpublished, and a line saying no site photographs existed. Those are
> notes to *you*, not to a buyer, and they have been removed from the page. The gaps
> themselves are unchanged and are listed below. The page still never states anything
> unsourced; it simply no longer narrates its own omissions.
>
> This list is what to feed the client dashboard when it is built.

---

## A. Blocking a section from being as strong as it could be

**1. Payment trigger months — which month is "on structure"? Which six months carry the half-yearly payments?**
`docs/facts.md` states plainly: *"Structure and half-yearly payment months are not defined. Do not imply a schedule you can't source."*
→ **On the page:** the payment timeline plots the 36 monthly installments and the possession
milestone at month 30, both of which are sourced. The structure payment and the six half-yearly
payments are shown as amounts in the schedule table but are **not** placed on the time axis, and
the timeline says so in a visible note rather than hiding the gap. Supplying these two dates would
let the timeline plot every payment and would measurably strengthen the strongest section on the page.

**2. Rental-management programme terms — management fee, guaranteed-rent period (if any), who pays for what, minimum tenancy.**
Confirmed to exist (`facts.md`: Zee99 finds tenants, handles maintenance, transfers rent to the
owner's account) but with no commercial detail behind it.
→ **On the page:** described qualitatively, exactly as sourced, with no numbers.
This is the single largest unexploited argument in the document — a buy-to-let buyer's first
question is "what does it cost me", and the page currently cannot answer it.

**3. Named owners.** No testimonial may be invented (`facts.md` → Never claim: *Named testimonials*).
→ **On the page:** the "100+ Happy Customers" laurel is cut, as the brief directs. The delivered-projects
list carries the credibility instead. Three real sentences from Takwa Center or Safari Apartments
owners would outperform every other trust device here.

**4. Site photographs — RESOLVED, except for their dates.**
Four supplied 2026-08-05 and now in `assets/site-progress/`, sequenced oldest to newest by what is
visible in each frame: crane and frame rising, slabs poured to the upper floors, structure topped
out, facade and planting going in.
→ **On the page:** §11 leads on the most recent at full width and runs the three earlier ones as a
band beneath it. **No dates are shown, because none were supplied with the files.** Each caption
describes only what is visible in its own frame. Send the four shoot dates and they can be printed;
until then the section says "the most recent photograph" rather than naming a month.
Note: the milestone dates for LDA / TMA / FBR are also unsourced, and those rows now carry no date
column at all rather than three repetitions of "date to be confirmed".

---

## B. Questions buyers actually ask, which the page cannot currently answer

All six are listed in `docs/direction.md` §13 as needing client input. The FAQ answers only what is
sourced and does not paper over these.

5. **What is being bought — registry, sub-lease, or allotment? And transferred at what point?**
6. **Monthly maintenance charge**, and what it covers.
7. **Parking** — is a bay allotted per apartment, and is it included in the price? (`facts.md` lists
   "visitor parking" as a building amenity; it says nothing about resident parking. The page therefore
   says "visitor parking" and nothing more, which a buyer will notice.)
8. **Resale before possession** — permitted? Transfer fee?
9. **Late installment** — what is the consequence, and is there a grace period?
10. **Discount for full or accelerated payment** — exists?
11. **What the "at possession" payment covers** — utility connections, meters, completion certificate?
12. **Contractor, structural and seismic specification.** `facts.md` lists "earthquake-resistant
    structure" as an amenity; no standard, code, or contractor is named. Stated as given, unelaborated.

---

## C. Conflicts in the source material — resolved, but worth confirming

**13. The road description conflicts between the two source documents.**
- `docs/facts.md`: *"on a 40-foot road between two 60-foot double roads"*
- `docs/direction.md` §02 map caption: *"on a 40-foot road, between a 60-foot double road and the Safari Sports Complex"*
→ **Resolved in favour of `facts.md`**, which is designated the source of truth. Please confirm which is correct.

**14. Office address spelling — "Nishter" vs the more common "Nishtar".**
→ **On the page:** set exactly as written in `facts.md` ("22 Nishter, Main Boulevard"). Flagged in
`direction.md` §5 too. Confirm before this goes to buyers.

**15. Ground-floor commercial rate is not uniform.**
`facts.md` gives the ground rate as Rs 55,000/sqft, but **G9 (450 sqft) is Rs 50,000/sqft** — an
intentional discount for an interior unit without arcade frontage. Verified against
`data/inventory.json` by `scripts/verify-data.mjs`.
→ **On the page:** the ground rate is never stated as a flat "every shop". G9's different rate is
shown on the unit itself and explained. This is deliberate — an unexplained cheaper unit reads as
a defect, whereas an explained one reads as candour.

**16. Commercial possession timeline.** `facts.md` gives 30 months possession / 36 months plan under
*Project*, and the commercial schedules run 36 monthly + 6 bi-annual, consistent with it. The page
treats 30/36 as project-wide. Confirm it applies to the retail floors too.

**17. Studio terrace.** `facts.md`: all types have a private terrace *"the Studio has back ventilation
in place of a terrace"*. The page states this as written. Confirm the Studio genuinely has no terrace,
since the floor plan is the thing a buyer will check it against.

---

## D. Deliberately excluded, per the brief

Not questions — recording that these were considered and left out on purpose.

- **Rental yield / ROI figures** — forbidden by `facts.md` → Never claim.
- **Any completion date beyond the 30-month possession** — forbidden.
- **Anything about Bahria Town's corporate situation** — forbidden.
- **`Perfectly Located.jpeg`** — unused; its numbering conflicts with the bird's-eye render.
  One map image only, per `facts.md`.
- **Any call to action, lead form, countdown, popup, or chat widget** — out of scope by instruction.
  The closing contact block is the only contact surface.
