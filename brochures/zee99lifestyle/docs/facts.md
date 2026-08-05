# Zee99 Lifestyle — Locked Facts

*Single source of truth for the build, alongside `data/inventory.json`. Nothing goes on the page that isn't here.*

## Project

Zee99 Lifestyle. Developer: Zee99 Developers. Bahria Town **Lahore**, Sector B. Corner plot, facing the Safari Sports Complex, on a 40-foot road between two 60-foot double roads. LDA and TMA approved; developer is FBR-registered.

8 floors: Lower Ground + Ground commercial, floors 1–6 residential. All six residential floors are identical. **48 apartments, 23 commercial units, 71 in total.**

These are **serviced apartments** — reception desk, room service, and Zee99 operates a rental-management programme that finds tenants, handles maintenance, and transfers rent directly to the owner's account.

Possession: 30 months. Payment plan: 36 months. **Keys arrive six months before the last installment does** — this is true, unusual, and appears nowhere in the client's own material. Use it. Note precisely that a large payment falls due *at* possession, then six monthly installments follow.

Prices are prelaunch and move with construction progress, demand and supply.

## Residential

**Rs 18,000 per square foot — the same rate for every unit type, on every floor.** No premium for a better view, no discount for a worse one. This is verifiable from the data and it is one of the strongest things on the page.

Eight apartments per floor. Units 01, 02, 03, 05, 06, 07 are 1 Bed. Unit 04 is 2 Bed. Unit 08 is Studio. Units 01–04 face the sports complex; 05–08 face the residences.

| | Studio · 380 sqft | 1 Bed · 500 sqft | 2 Bed · 800 sqft |
|---|---|---|---|
| Total | 6,840,000 | 9,000,000 | 14,400,000 |
| Down payment | 1,400,000 | 1,800,000 | 3,000,000 |
| 36 monthly | 75,000 | 90,000 | 150,000 |
| On structure | 700,000 | 900,000 | 1,500,000 |
| 6 half-yearly | 150,000 | 260,000 | 300,000 |
| At possession | 1,140,000 | 1,500,000 | 2,700,000 |

Every schedule sums to its total exactly. Say so if you find a good way to.

**Call it Studio everywhere** — never "Convertible." It is 380 sqft. Ignore any older drawing that labels it 480.

All three types: attached bathroom(s), open kitchen, wardrobe, private terrace — the Studio has back ventilation in place of a terrace. The 2 Bed has two bedrooms, both with attached baths, plus a laundry room. All semi-furnished.

Structure and half-yearly payment months are not defined. Do not imply a schedule you can't source.

## Commercial

Two retail floors with different characters. Don't flatten them into one section.

**Ground — 9 shops, 305 to 486 sqft, Rs 55,000/sqft.** Fronted by a **10-foot covered arcade**, with 6-foot and 5-foot internal corridors, lift, two staircases, and toilets including an accessible one. Shops 04, 05, 06 and 07 open onto the arcade.

*Shop 09 (450 sqft) is priced at Rs 50,000/sqft — an intentional discount. It sits in the interior of the plate without arcade frontage. If you reference the ground-floor rate, phrase it so this remains true.*

**Lower Ground — 13 shops from 180 to 390 sqft, plus a 70 sqft kiosk, Rs 35,000/sqft.** Small-format retail on 6-foot corridors, with a patio, lift and accessible bath. The 180 sqft cells suit the accessory and mobile-accessory trade that already thrives in Sector B — Bahria's largest mobile market is a few blocks away.

**Payment split, identical for every commercial unit:** 20% down · 30% across 36 monthly · 20% across 6 bi-annual · 10% on structure · 20% at possession.

Full unit list, sizes, prices and payment schedules are in `data/inventory.json`. Every schedule reconciles to its total to the rupee.

## Live inventory

Source: `data/inventory.json`. Four states — **Available**, **Reserved** (token paid), **Booked** (on installments), **Sold** (paid in full).

Residential: 30 available, 6 reserved, 10 booked, 2 sold, of 48. Floor 2 is fully taken. Floor 5 holds the only two sold apartments.
Commercial: 14 available, 3 reserved, 4 booked, 2 sold, of 23.

**Never hardcode these counts.** Derive them from the data file so the page stays correct when it's edited.

Residential should read as a floor-by-floor stack; commercial reads best against the actual floor plates, since the plans are good enough to sell from. Sold and booked units go quiet, available stays lit.

## Track record

15 years. 100+ customers. 50+ residential homes, 6 commercial projects, 2 high-rise developments.

- **Takwa Center** — delivered
- **Safari Apartments** — delivered
- **Zee99 Arcade** — structure complete, possession in 8 months, 15 months left on its payment plan, running ahead of schedule
- **Zee99 Lifestyle** — current

## Specification (semi-furnished, fitted in every apartment)

- Kitchen — high-pressure laminate, tempered glass · ZRK, Al-Noor, Formite
- Wardrobes — floor-to-ceiling high gloss · ZRK, Al-Noor, Master Wood
- Doors — semi-solid engineered wood · ZRK, Al-Noor, Adamjee
- Art walls — decorative laminate · Formite, Al-Noor
- Windows — double-glazed, heavy-gauge aluminium · Al-Cop, Pak-Aluminium, Awami
- Sanitary — concealed cisterns, chrome fittings · Faisal, Sonex, Master
- Appliances — integrated hood and stove · Cannon, Waves, Schneider
- Smart — motorised curtains, smart lighting · Schneider Electric, Legrand, Philips

## Amenities

**Split these into two groups on the page — do not present them as one undifferentiated grid.** The client's list mixes what's in the building with what's across the road, and blurring the two is exactly the kind of thing that costs trust.

*In the building:* rooftop cinema, BBQ lounge, rooftop solar, lift, card access, video door phone, intercom, reception desk, room service, 24/7 CCTV, guard, fire safety system, maintenance staff, 24x7 water, power backup, visitor parking, gated access, EV charging, rainwater harvesting, earthquake-resistant structure, gymnasium, clubhouse, indoor games, kids play area.

*Across the road:* Safari Sports Complex (padel, tennis, badminton, cricket, football, jogging track), Safari Mall, Qartaba Masjid, Kids Park, Safari Park, Safari Zoo, Green Valley Supermart, Bahria Hospital, schools and study centres, Bahria's largest mobile market, money exchanger.

## Location

Use `assets/Bird's Eye Views/Zee99 Lifestyle bird eye view.jpg.jpg` as the primary map — it's better than any embed. Numbered keys: **1** Zee99 Lifestyle · **2** Sports Complex · **3** Safari Mall · **4** Qartaba Masjid · **5** Kids Park · **6** Safari Park · **7** Safari Zoo.

*`Perfectly Located.jpeg` in the same folder uses conflicting numbering. Use one image, not both.*

## Site progress

Photographs exist but are not in the assets folder yet. Build the section as a **dated photograph grid** with clearly-marked placeholder slots sized to the real aspect ratios, ready to drop images into. Seed it with the approval and registration milestones (LDA, TMA, FBR) as dated entries so it reads as a real timeline rather than an empty frame. Do not use stock or render images as stand-ins — a placeholder that admits it's a placeholder is more honest than a render pretending to be a photograph.

## Contact — the closing block

Not a CTA. The back of a brochure.

> **Zee99 Developers**
> 22 Nishter, Main Boulevard, Bahria Town, Lahore
> WhatsApp — 0312 0000321 · `https://wa.me/923120000321`

Quiet, plain, no button styling, no form. It should look like it was set by a typographer, not a marketer.

## Assets

```
assets/
  decorative-cinematic-video.mp4        16:9, ambient, muted, non-blocking
  STUDIO/                               5 interior renders
  1-BED/                                11 interior renders
  2-BED/                                13 interior renders
  Building-Renders/                     5 exteriors
  Roof-Top/                             3, all portrait
  Bird's Eye Views/                     2
  Floor-Plans/
    studio-floorplan.jpg                ~16:9
    1Bed-floorplan.jpg                  ~16:9
    2Bed-floorplan.jpg                  ~16:9
    residential-1-to-6-floorplan.jpg    1:1 — covers all six floors
    commercial-ground-floorplan.jpg     1:1 — 9 shops, arcade
    commercial-lowerGround-floorplan.jpg 1:1 — 13 shops + kiosk
```

Interior renders are 3840×2804. Scene numbers are non-contiguous and carry no narrative order — sequence them by what reads best.

The client wants a **gallery** for the Studio, 1 Bed and 2 Bed interiors. It should feel like the most considered thing on the page: high-end, obvious to operate, and pleasant on a phone with one thumb.

## Never claim

Rental yields or ROI figures. Completion dates beyond the 30-month possession. Named testimonials. Anything about Bahria Town's own corporate situation. Any number not in `docs/facts.md` or `data/inventory.json`.
