/* ============================================================================
   Every word on the page.

   Kept in one file so the copy can be read as a continuous argument rather than
   discovered a component at a time, and so scripts/lint-copy.mjs can hold the
   whole thing against the banned-phrase list.

   Rule applied throughout: no sentence survives here that would also be true of
   a different building. Where the brief's draft asserted something unsourced,
   it was either verified against a drawing (and kept), or cut.
   ========================================================================= */

import { possessionMonths, planMonths, keysBeforeFinalMonths } from './inventory';

export const project = {
  name: 'Zee99 Lifestyle',
  developer: 'Zee99 Developers',
  location: 'Bahria Town Lahore, Sector B',
  short: 'Sector B, Bahria Town Lahore',
};

/* Section register. The numbering is a finiteness device: it tells the reader
   where they are and how much is left, which a scrolling page otherwise hides. */
/* Order note: the homes come third, immediately after the cover and the one
   screen that says what this is. A reader arriving from WhatsApp already knows
   the price and has already said they are interested — what they want is the
   thing itself, not six screens of preamble. Everything that was in front of it
   (the address, the specification, the floor plate) is evidence, and evidence
   belongs after the thing it supports. */
export const sections = [
  { id: 'opening',    no: '00', name: 'Cover' },
  { id: 'proposition',no: '01', name: 'The proposition' },
  { id: 'homes',      no: '02', name: 'The three homes' },
  { id: 'floor',      no: '03', name: 'The typical floor' },
  { id: 'spec',       no: '04', name: 'Specification' },
  { id: 'address',    no: '05', name: 'The address' },
  { id: 'building',   no: '06', name: 'The building' },
  { id: 'commercial', no: '07', name: 'Commercial' },
  { id: 'numbers',    no: '08', name: 'The numbers' },
  { id: 'builder',    no: '09', name: 'The builder' },
  { id: 'inventory',  no: '10', name: 'What is left' },
  { id: 'progress',   no: '11', name: 'Site progress' },
  { id: 'questions',  no: '12', name: 'Questions' },
  { id: 'closing',    no: '13', name: 'End' },
] as const;

/* The index.

   A printed brochure needs no navigation because the hand already has one — you
   feel the thickness, you thumb to the plans, you go back. Thirty-odd screens of
   scroll take that away and give nothing back, and the first thing anyone opening
   this actually wants is one of seven things: a plan, its photographs, its
   payment schedule, the shops, what is left, or the number to call.

   So: not a nav bar. The rail that already reports position gains one word, and
   that word opens this. Seven destinations first, because they are what is
   wanted; the fourteen sections under them, because someone who has read half of
   it wants back to where they were. */
export const jumpTo = [
  { href: '#home-studio', label: 'Studio' },
  { href: '#home-1bed', label: '1 Bedroom' },
  { href: '#home-2bed', label: '2 Bedroom' },
  { href: '#commercial', label: 'Shops' },
  { href: '#numbers', label: 'Payment plans' },
  { href: '#inventory', label: 'What is left' },
  { href: '#closing', label: 'Contact' },
] as const;

/* --- 00 ------------------------------------------------------------------ */
export const opening = {
  title: 'Zee99 Lifestyle',
  place: 'Bahria Town Lahore, Sector B',
  /* Both halves are sourced: the plot faces the Safari Sports Complex, and the
     developer is fifteen years old. The pun on facing/backing is the only
     decoration allowed this early. */
  line: 'Facing the sports complex. Backing a fifteen-year record.',
  scrollHint: 'Scroll',
};

/* --- 01 ------------------------------------------------------------------ */
export const proposition = {
  head: 'A finished address, not a promise of one.',
  /* One paragraph, not two. The cut sentence — eight floors, two commercial,
     six residential, corner plot — is already the four figures standing under
     it, and a number read once beats the same number read twice. */
  body: [
    'Sector B is already built. The roads are laid, the schools are running, the market is busy, the hospital is open. What was missing was somewhere to live in the middle of it.',
  ],
};

/* --- 02 ------------------------------------------------------------------ */
export const address = {
  head: 'You will not need the car.',
  body: [
    'Most projects sell a location by describing what is coming. This is a list of what is already there.',
  ],
  /* Every entry appears in facts.md under "Across the road". Nothing added. */
  near: [
    { k: '01', name: 'Safari Sports Complex', note: 'Padel, tennis, badminton, cricket, football, jogging track' },
    { k: '02', name: 'Safari Mall', note: 'Next door' },
    { k: '03', name: 'Qartaba Masjid', note: '' },
    { k: '04', name: 'Bahria Hospital', note: '' },
    { k: '05', name: 'Green Valley Supermart', note: '' },
    { k: '06', name: "Bahria's largest mobile market", note: '' },
    { k: '07', name: 'Schools and study centres', note: '' },
    { k: '08', name: 'Safari Park, Safari Zoo, Kids Park', note: '' },
    { k: '09', name: 'Money exchanger', note: '' },
  ],
  /* Numbering matches the bird's-eye render's own key, per facts.md. */
  mapKeys: [
    { n: 1, label: 'Zee99 Lifestyle' },
    { n: 2, label: 'Sports Complex' },
    { n: 3, label: 'Safari Mall' },
    { n: 4, label: 'Qartaba Masjid' },
    { n: 5, label: 'Kids Park' },
    { n: 6, label: 'Safari Park' },
    { n: 7, label: 'Safari Zoo' },
  ],
  mapCaption: 'A corner plot on a 40-foot road, between two 60-foot double roads.',
  mapAlt:
    "Bird's-eye render of Sector B with Zee99 Lifestyle marked 1, the Safari Sports Complex 2, Safari Mall 3, Qartaba Masjid 4, Kids Park 5, Safari Park 6 and Safari Zoo 7.",
};

/* Opens the homes. Was its own section of prose and three hatched squares; it
   is now the first thing inside §02, because "built small" is the premise of
   the three plans rather than a separate idea, and because a reader deciding
   between them wants the comparison and the choice in the same glance. */
export const plans = {
  /* "Built small, on purpose" put the smallness first and made a virtue of a
     limit, which is an apology wearing a headline. The plans are not small;
     they are undiluted, and that is the same fact stated as an advantage. */
  head: 'Every square foot earns its place.',
  lead: 'Every square foot costs the same, so size is the only variable. Each plan spends its area on rooms that get used, with no formal drawing room nobody sits in.',
  scaleNote: 'Drawn to scale, area for area',
  /* Says what the tile leads to. "Tap a plan" told a reader to act without
     telling them what they would get, which is the reason nobody tapped. */
  pickHint: 'Each one opens its floor plan, its photographs and its payment schedule.',
};

/* --- 04 ------------------------------------------------------------------ */
export const spec = {
  head: 'Premium is a word. This is the list.',
  lead: 'Fitted in every apartment before a single piece of your own furniture goes in.',
  /* Verbatim from facts.md § Specification. Brands are listed as given. */
  rows: [
    { item: 'Kitchen',    detail: 'High-pressure laminate, tempered glass', brands: ['ZRK', 'Al-Noor', 'Formite'] },
    { item: 'Wardrobes',  detail: 'Floor-to-ceiling, high gloss',          brands: ['ZRK', 'Al-Noor', 'Master Wood'] },
    { item: 'Doors',      detail: 'Semi-solid engineered wood',            brands: ['ZRK', 'Al-Noor', 'Adamjee'] },
    { item: 'Art walls',  detail: 'Decorative laminate',                   brands: ['Formite', 'Al-Noor'] },
    { item: 'Windows',    detail: 'Double-glazed, heavy-gauge aluminium',  brands: ['Al-Cop', 'Pak-Aluminium', 'Awami'] },
    { item: 'Sanitary',   detail: 'Concealed cisterns, chrome fittings',   brands: ['Faisal', 'Sonex', 'Master'] },
    { item: 'Appliances', detail: 'Integrated hood and stove',             brands: ['Cannon', 'Waves', 'Schneider'] },
    { item: 'Smart',      detail: 'Motorised curtains, smart lighting',    brands: ['Schneider Electric', 'Legrand', 'Philips'] },
  ],
  /* Replaces the brief's "chosen for service records, not the logo", which
     asserted a rationale nothing in the source supports. This says only what
     the table itself demonstrates. */
  close: 'Every line names its brands. A substitution would be visible.',
};

/* --- 05 ------------------------------------------------------------------ */
export const floor = {
  /* "5'-0" WIDE" is lettered on the residential floor plan, so the headline is
     quoting the drawing rather than estimating. */
  head: 'Eight homes to a floor. One five-foot corridor.',
  body: [
    'A corner plot gives the building two good faces instead of one. Four apartments on every floor look out at the sports complex and four at the residences behind, so there is no dead elevation.',
    'The lift and the staircase sit at the centre of the plate, which is what keeps the corridor down to a single five-foot run.',
  ],
  note: 'All six residential floors are identical. This drawing is any of them.',
  planAlt:
    'Typical residential floor plan. Eight apartments around a central lift and staircase, on a five-foot corridor. Apartments 01, 02, 03, 05, 06 and 07 are 500 sq ft one-bedrooms; apartment 04 is an 800 sq ft two-bedroom; apartment 08 is a 380 sq ft studio.',
};

/* --- 06 ------------------------------------------------------------------
   Every claim below was checked against the unit drawings:
     studio  — separator wall drawn solid; "BACK VENTILATION" lettered on the edge
     1 bed   — "FACING SPORTS COMPLEX" lettered; terrace drawn with table
     2 bed   — bedrooms at opposite ends; dining table drawn with six chairs;
               washing machine drawn (the laundry)
   ------------------------------------------------------------------------ */
export const homes = {
  head: 'Three plans.',
  lead: 'The same rate buys a different amount of the same building.',
  types: {
    studio: {
      head: 'One room, thought all the way through.',
      body: 'A separator wall rather than a curtain, an attached bath, a full kitchen and a wardrobe run along the wall. Nothing in it is decorative, which is why it lives larger than the number suggests.',
      facing: 'Facing residence, back ventilation',
      planAlt: 'Studio floor plan, 380 sq ft. A separator wall divides the sleeping area from the living space. Kitchen along the lower wall, attached bathroom to the right, edge lettered "Facing Residence" and "Back Ventilation".',
    },
    '1bed': {
      head: 'A bedroom that closes. A terrace that opens.',
      body: 'The lounge runs out onto a private terrace. The kitchen is open but properly equipped, one you cook in rather than photograph. Attached bath, full wardrobe wall.',
      facing: 'Facing sports complex',
      planAlt: 'One-bedroom floor plan, 500 sq ft. Private terrace at the far end, bedroom with attached bathroom, open kitchen and a lounge. Edge lettered "Facing Sports Complex".',
    },
    '2bed': {
      head: 'Two bedrooms, at opposite ends of the plan.',
      body: 'Both have attached baths, and they sit at opposite ends so nobody walks through anyone else’s room to get anywhere. A dining table for six without moving the sofa. A laundry. A private terrace.',
      facing: 'Facing sports complex',
      planAlt: 'Two-bedroom floor plan, 800 sq ft. Bedrooms at opposite ends, each with an attached bathroom, living and dining between them, kitchen and laundry to one side, terrace to the other. Edge lettered "Facing Sports Complex".',
    },
  },
  galleryLabel: 'Interiors',
  galleryHint: 'Tap to enlarge',
};

/* Scene numbers in assets/ are non-contiguous and carry no narrative order, so
   the sequence is set here by eye rather than by filename. The shape is the
   same for each type: establish the room wide, show the kitchen (it is the
   thing the specification section makes a claim about), move to the sleeping
   area, close on a detail. Odd overhead camera angles go last. */
export const gallerySequence: Record<string, string[]> = {
  studio: [
    'studio/scene-18',   // widest — sofa, bed and the separator wall in one frame
    'studio/scene-20',   // the kitchen run
    'studio/scene-19',
    'studio/scene-24',
    'studio/scene-25',
  ],
  '1bed': [
    '1bed/scene-1',      // lounge with the open kitchen behind it
    '1bed/scene-5',
    '1bed/scene-2',
    '1bed/scene-4',      // kitchen
    '1bed/scene-3',
    '1bed/scene-10',
    '1bed/scene-6',      // bedroom
    '1bed/scene-9',
    '1bed/scene-7',      // the wardrobe wall the copy claims
    '1bed/scene-8',
    '1bed/scene-11',
  ],
  '2bed': [
    '2bed/scene-11',     // widest lounge
    '2bed/scene-10',
    '2bed/scene-30',
    '2bed/scene-12',     // through to dining
    '2bed/scene-17',     // kitchen
    '2bed/scene-13',     // first bedroom
    '2bed/scene-28',
    '2bed/scene-14',
    '2bed/scene-16',     // second bedroom
    '2bed/scene-15',
    '2bed/scene-23',
    '2bed/scene-22',     // overhead angles last
    '2bed/scene-29',
  ],
};

/* --- 07 ------------------------------------------------------------------ */
export const building = {
  head: 'Experience every evening.',   /* the developer's own line; it is good */
  body: [
    'A cinema on the roof. A BBQ lounge beside it. Solar above both.',
  ],
  /* The split the brief asks for. Presenting a hospital across the road as a
     building feature is the exact move that costs trust on a page whose only
     job is to build it. */
  inBuilding: {
    label: 'In the building',
    groups: [
      { g: 'Roof',     items: ['Rooftop cinema', 'BBQ lounge', 'Rooftop solar'] },
      { g: 'Shared',   items: ['Gymnasium', 'Clubhouse', 'Indoor games', 'Kids play area'] },
      { g: 'Security', items: ['Card access', 'Reception desk', '24/7 CCTV', 'Guard', 'Video door phone', 'Intercom', 'Gated access', 'Fire safety system'] },
      { g: 'Services', items: ['Lift', 'Room service', 'Maintenance staff', '24x7 water', 'Power backup', 'Visitor parking', 'EV charging', 'Rainwater harvesting', 'Earthquake-resistant structure'] },
    ],
  },
  acrossRoad: {
    label: 'Across the road',
    note: 'Not ours. Listed because it is why the address works, and because the difference is worth being clear about.',
    items: [
      'Safari Sports Complex: padel, tennis, badminton, cricket, football, jogging track',
      'Safari Mall', 'Qartaba Masjid', 'Kids Park', 'Safari Park', 'Safari Zoo',
      'Green Valley Supermart', 'Bahria Hospital', 'Schools and study centres',
      "Bahria's largest mobile market", 'Money exchanger',
    ],
  },
  serviced: {
    head: 'These are serviced apartments.',
    body: 'Zee99 runs a rental programme: their team finds the tenant, handles the maintenance, and transfers the rent to your account. If you are buying to let, that is the part that matters.',
  },
};

/* --- 08 ------------------------------------------------------------------ */
export const commercialCopy = {
  head: 'Two floors of shopfront on the corner everyone walks past.',
  body: [
    'The footfall is not speculative. The sports complex is across the road, Safari Mall is next door, and forty-eight households live directly upstairs.',
  ],
  ground: {
    head: 'Ground',
    sub: 'Nine shops behind a ten-foot arcade.',
    body: 'The arcade runs the length of the frontage: shade in June, cover in monsoon, and enough depth to put a display outside the door. Shops 04, 05, 06 and 07 open directly onto it. This is the floor you take if the street is your customer.',
  },
  lower: {
    head: 'Lower Ground',
    sub: 'Small-format retail on six-foot corridors.',
    body: 'The smallest cells are the size that works for phone accessories, opticians, tailoring and cosmetics, the trades already doing volume a few blocks away at the mobile market. Lower entry, lower rate, faster to fill.',
  },
  /* G9's discount, explained rather than hidden. Verified on the drawing: it is
     landlocked between Shops 01, 02, 05, 06 and the corridor. */
  exception: {
    head: 'One shop is priced below the others.',
    body: 'Shop 09 sits inside the plate with no arcade frontage, so it is sold at a lower rate than the eight around it. It is a worse shop and it is priced like one.',
  },
  planGroundAlt: 'Ground floor plan. Nine shops from 305 to 486 sq ft around a five- and six-foot corridor, with a ten-foot covered arcade along the frontage, central lift, two staircases and toilets including an accessible one.',
  planLowerAlt: 'Lower ground floor plan. Thirteen shops from 180 to 390 sq ft plus a 70 sq ft kiosk, on six-foot corridors, with a patio, lift and accessible bathroom.',
};

/* --- 09 — the peak ------------------------------------------------------- */
export const numbers = {
  head: 'One rate. Every apartment, every floor.',
  lead: 'No premium for a better view, no discount for a worse one. Three hundred and eighty square feet or eight hundred, the arithmetic is identical.',
  /* The strongest unused fact in the client's material. Stated precisely: a
     large payment falls due AT possession, and six monthly installments follow. */
  keys: {
    head: `The keys arrive ${keysBeforeFinalMonths} months before the last installment does.`,
    body: `Possession is at month ${possessionMonths}. The plan runs to month ${planMonths}. A larger payment falls due at possession itself, and six monthly installments follow it, so the last half-year of paying happens in a flat you already have the keys to.`,
  },
  reconcile: 'Every schedule sums to its total exactly. Checked on each build.',
  timeline: {
    head: 'The plan, drawn.',
    hint: 'Choose a plan below. The shape of the schedule holds, only the scale changes.',
    /* The structure payment and the six half-yearly payments still have no
       defined month, so they are still listed as amounts and still kept off
       the axis. What is gone is the paragraph explaining that to the reader:
       it is a note to the client about the source data, and it now travels
       with the handover instead of sitting under the chart looking like an
       unfinished drawing. */
    axisLabel: 'Months from booking',
  },
  commercial: {
    head: 'Commercial is priced differently.',
    body: 'Two floors, two rates, and the same split on every unit.',
  },
  footnote: 'Prelaunch pricing. It moves with construction progress, demand and supply.',
};

/* --- 10 ------------------------------------------------------------------ */
export const builder = {
  /* The brief's draft headline was "The last one finished early." That is not
     true of anything in facts.md: Takwa Center and Safari Apartments are
     delivered with no timing given, and Zee99 Arcade is still running. */
  head: 'Two delivered. The third is ahead of schedule.',
  body: [
    'Zee99 Arcade’s structure is complete. Possession is eight months out with fifteen months still to run on its payment plan, which in this market is the credential that counts.',
  ],
  stats: [
    { n: '15', unit: 'years', label: 'Building' },
    { n: '50+', unit: '', label: 'Homes delivered' },
    { n: '6', unit: '', label: 'Commercial projects' },
    { n: '2', unit: '', label: 'High-rise developments' },
  ],
  projects: [
    { name: 'Takwa Center',    status: 'Delivered', note: '' },
    { name: 'Safari Apartments', status: 'Delivered', note: '' },
    { name: 'Zee99 Arcade',    status: 'Structure complete', note: 'Possession in 8 months, 15 months left on plan' },
    { name: 'Zee99 Lifestyle', status: 'Current', note: 'This building' },
  ],
  /* The laurel is cut per the brief. Saying why is more convincing than the
     graphic was. */
  customers: 'Zee99 counts more than a hundred customers across those projects. We have not put their faces in a badge, because a badge is not evidence. The delivered buildings are.',
};

/* --- 11 ------------------------------------------------------------------ */
export const inventoryCopy = {
  head: 'What is left.',
  lead: 'Sold and booked units go quiet. Available stays lit.',
  resLabel: 'Residential, floor by floor',
  comLabel: 'Commercial, on the plate',
  stateNote: 'Four states, and the difference between them is worth publishing.',
  footnote: 'The rate on this page is a prelaunch rate. It holds until construction says otherwise.',
  updatedPrefix: 'Updated',
};

/* --- 12 ------------------------------------------------------------------ */
export const progress = {
  head: 'On site.',
  /* Was "No renders below this line." It only meant anything to someone who had
     just scrolled past thirty screens of renders and was still holding that in
     mind; on its own it is a note about the document rather than about the
     building. This says what the four photographs are and that they are in
     order, which is the one thing a reader needs before looking at them. */
  lead: 'Four photographs of the same corner, in the order the building went up.',
  latestLabel: 'Most recent',
  /* Ordered oldest to newest. Each caption describes only what is visible in
     its own frame: the crane, the count of poured slabs, the scaffold, the
     planting. No dates, because none are given with the photographs. */
  stages: [
    {
      src: 'site/stage-1',
      caption: 'Crane up, frame rising',
      alt: 'The site with a tower crane in place and the concrete frame poured to roughly five levels, reinforcement standing above the top slab.',
    },
    {
      src: 'site/stage-2',
      caption: 'Slabs to the upper floors',
      alt: 'The concrete frame poured to the upper floors with the crane still standing, scaffolding to full height and materials stacked at ground level.',
    },
    {
      src: 'site/stage-3',
      caption: 'Structure topped out',
      alt: 'The frame complete to its full height with the roof slab formed, scaffolding and safety netting across the elevations.',
    },
    {
      src: 'site/stage-4',
      caption: 'Facade and planting in',
      alt: 'The completed frame with glazing installed on the lower floors, planting established along the balcony edges and the shopfronts hoarded at street level.',
    },
  ],
  milestones: [
    { label: 'LDA approval', status: 'Approved' },
    { label: 'TMA approval', status: 'Approved' },
    { label: 'FBR registration', status: 'Registered' },
  ],
};

/* --- 13 ------------------------------------------------------------------ */
export const questions = {
  head: 'Questions.',
  /* Answered only where facts.md answers them. The unanswered ones are named
     rather than omitted — a buyer who spots a missing answer trusts the page
     less than one who is told it is missing. */
  answered: [
    { q: 'Is the project approved?', a: 'LDA and TMA approved. Zee99 Developers is registered with the FBR.' },
    { q: 'When is possession?', a: `Thirty months. The payment plan runs thirty-six, so the last six months of installments fall after you have the keys.` },
    { q: 'Is the apartment furnished?', a: 'Semi-furnished. The kitchen, wardrobes, doors, art walls, bathroom fittings, hood and stove, smart lighting and motorised curtains are all fitted. The furniture is yours.' },
    { q: 'Can Zee99 rent it out for me?', a: 'Yes. Their team finds the tenant, handles the maintenance, and transfers the rent to your account.' },
    { q: 'Will the price change?', a: 'Yes. These are prelaunch rates and they move with construction progress, demand and supply.' },
    { q: 'How many apartments are there?', a: 'Six identical residential floors of eight homes each, forty-eight in total, plus twenty-three commercial units across two floors.' },
    { q: 'Do all the floors cost the same?', a: 'Yes. Eighteen thousand rupees a square foot on every residential floor, with no premium for height or view.' },
  ],
};

/* --- 14 ------------------------------------------------------------------ */
export const closing = {
  title: 'Zee99 Lifestyle',
  lines: [
    'Sector B, facing the Safari Sports Complex.',
    'Approved, registered, and under way.',
  ],
  marks: ['FBR', 'LDA', 'TMA'],
  contact: {
    company: 'Zee99 Developers',
    /* Spelling exactly as facts.md gives it. Flagged in QUESTIONS.md item 14. */
    address: '22 Nishter, Main Boulevard, Bahria Town, Lahore',
    whatsappLabel: '0312 0000321',
    whatsappHref: 'https://wa.me/923120000321',
  },
  colophon: 'Prices and availability on this page are generated from the project’s own inventory file and were current on the date shown above.',
};
