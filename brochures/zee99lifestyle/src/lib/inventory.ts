/* ============================================================================
   The only place inventory.json is read.

   Every count, total, rate and range the page displays is computed here from
   the source file at build time. Nothing downstream is permitted to type a
   figure. If someone flips a unit's status in data/inventory.json, the page
   tells the truth on the next build without anyone editing a component.

   scripts/verify-data.mjs independently recomputes the same quantities and
   fails the build on disagreement.
   ========================================================================= */

import raw from '../../data/inventory.json';

export type Status = 'available' | 'reserved' | 'booked' | 'sold';
export type Facing = 'sports complex' | 'residence';

export interface ResUnit {
  id: string; floor: number; type: 'studio' | '1bed' | '2bed';
  sqft: number; price: number; facing: Facing; status: Status;
}
export interface ComUnit {
  id: string; floor: 'Ground' | 'Lower Ground'; type: 'Shop' | 'Kiosk';
  sqft: number; ratePerSqft: number; price: number; status: Status;
  plan: { down: number; monthly: number; monthlyCount: number; biAnnual: number; biAnnualCount: number; structure: number; possession: number };
}

export const meta = raw.meta;
export const residential = raw.residential;
export const commercial = raw.commercial;

export const resUnits = raw.residential.units as ResUnit[];
export const groundUnits = raw.commercial.ground.units as ComUnit[];
export const lowerUnits = raw.commercial.lowerGround.units as ComUnit[];
export const comUnits: ComUnit[] = [...groundUnits, ...lowerUnits];

export const STATUS_ORDER: Status[] = ['available', 'reserved', 'booked', 'sold'];

/** The four state labels, exactly as data/inventory.json defines them.
 *  Publishing the token/installment/paid-in-full distinction is the candid
 *  move the brief asks for, so the wording is taken from source, not softened. */
export const STATUS_LABEL: Record<Status, string> = {
  available: 'Available',
  reserved: 'Reserved',
  booked: 'Booked',
  sold: 'Sold',
};
export const STATUS_MEANING: Record<Status, string> = {
  available: 'Unsold',
  reserved: raw.meta.statusKey.reserved,   // "Token paid"
  booked: raw.meta.statusKey.booked,       // "On installments"
  sold: raw.meta.statusKey.sold,           // "Paid in full"
};

const tally = <T extends { status: Status }>(list: T[]) => {
  const c = { available: 0, reserved: 0, booked: 0, sold: 0 } as Record<Status, number>;
  for (const u of list) c[u.status]++;
  return { ...c, total: list.length };
};

export const resCount = tally(resUnits);
export const comCount = tally(comUnits);
export const totalUnits = resUnits.length + comUnits.length;

/** Floor-by-floor stack for the residential inventory view. */
export const resByFloor = Array.from(
  new Set(resUnits.map((u) => u.floor)))
  .sort((a, b) => b - a)                       // top floor first, as a stack reads
  .map((floor) => {
    const units = resUnits.filter((u) => u.floor === floor).sort((a, b) => a.id.localeCompare(b.id));
    return { floor, units, ...tally(units) };
  });

/* --- residential types ---------------------------------------------------- */

export const resTypes = (['studio', '1bed', '2bed'] as const).map((key) => {
  const t = raw.residential.types[key];
  const p = t.plan;
  const monthlyTotal = p.monthly * p.monthlyCount;
  const halfYearlyTotal = p.halfYearly * p.halfYearlyCount;
  const sum = p.down + monthlyTotal + p.structure + halfYearlyTotal + p.possession;
  const units = resUnits.filter((u) => u.type === key);
  return {
    key, label: t.label, sqft: t.sqft, price: t.price, plan: p,
    monthlyTotal, halfYearlyTotal,
    /** computed, then asserted below — never asserted from the source table */
    ratePerSqft: t.price / t.sqft,
    reconciles: sum === t.price,
    scheduleSum: sum,
    downPct: (p.down / t.price) * 100,
    count: units.length,
    available: units.filter((u) => u.status === 'available').length,
  };
});

export const resRate = raw.residential.ratePerSqft;
export const possessionMonths = raw.residential.possessionMonths;
export const planMonths = raw.residential.planMonths;
/** The line nobody has used: keys land before the last installment does. */
export const keysBeforeFinalMonths = planMonths - possessionMonths;

/* --- commercial ----------------------------------------------------------- */

const range = (ns: number[]) => ({ min: Math.min(...ns), max: Math.max(...ns) });

const groundShops = groundUnits;
const lowerShops = lowerUnits.filter((u) => u.type === 'Shop');
const kiosks = lowerUnits.filter((u) => u.type === 'Kiosk');

export const ground = {
  rate: raw.commercial.ground.ratePerSqft,
  arcadeWidthFt: raw.commercial.ground.arcadeWidthFt,
  units: groundUnits,
  count: groundUnits.length,
  sqft: range(groundShops.map((u) => u.sqft)),
  ...tally(groundUnits),
  /** G9 sits inside the plate without arcade frontage and is priced below the
   *  headline rate. Surfaced deliberately: an unexplained cheaper unit reads as
   *  a defect, an explained one reads as candour. */
  offRate: groundUnits.filter((u) => u.ratePerSqft !== raw.commercial.ground.ratePerSqft),
};

export const lower = {
  rate: raw.commercial.lowerGround.ratePerSqft,
  units: lowerUnits,
  count: lowerUnits.length,
  shopCount: lowerShops.length,
  kioskCount: kiosks.length,
  kioskSqft: kiosks[0]?.sqft,
  sqft: range(lowerShops.map((u) => u.sqft)),
  ...tally(lowerUnits),
};

export const comSplit = raw.commercial.paymentSplit;

/* --- formatting ------------------------------------------------------------
   One formatter, used everywhere, so digits never disagree between sections. */

const nf = new Intl.NumberFormat('en-PK');

export const rs = (n: number) => `Rs ${nf.format(Math.round(n))}`;
export const num = (n: number) => nf.format(Math.round(n));

/** Crore/lakh reads naturally to this buyer; plain rupees are kept alongside
 *  wherever the exact figure matters, so nothing is only ever approximate. */
export function short(n: number): string {
  if (n >= 1e7) {
    const c = n / 1e7;
    return `${c % 1 === 0 ? c : c.toFixed(2).replace(/\.?0+$/, '')} crore`;
  }
  if (n >= 1e5) {
    const l = n / 1e5;
    return `${l % 1 === 0 ? l : l.toFixed(2).replace(/\.?0+$/, '')} lakh`;
  }
  return nf.format(n);
}

export const words: Record<number, string> = {
  1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven',
  8: 'Eight', 9: 'Nine', 10: 'Ten', 11: 'Eleven', 12: 'Twelve', 13: 'Thirteen',
  14: 'Fourteen', 23: 'Twenty-three', 30: 'Thirty', 36: 'Thirty-six', 48: 'Forty-eight',
};

/* --- build-time assertions -------------------------------------------------
   A component that renders a wrong number is worse than a build that fails. */

const die = (m: string) => { throw new Error(`[inventory] ${m}`); };

for (const t of resTypes) {
  if (!t.reconciles) die(`${t.label}: schedule sums to ${t.scheduleSum}, price is ${t.price}`);
  if (t.ratePerSqft !== resRate) die(`${t.label}: rate ${t.ratePerSqft} != ${resRate}`);
}
for (const u of resUnits) {
  if (u.price / u.sqft !== resRate) die(`unit ${u.id} breaks the flat rate`);
}
for (const u of comUnits) {
  if (u.price !== u.sqft * u.ratePerSqft) die(`unit ${u.id}: price != sqft x rate`);
  const p = u.plan;
  const sum = p.down + p.monthly * p.monthlyCount + p.biAnnual * p.biAnnualCount + p.structure + p.possession;
  if (sum !== u.price) die(`unit ${u.id}: schedule sums to ${sum}, price is ${u.price}`);
}
if (resUnits.length !== raw.residential.floors * raw.residential.unitsPerFloor) {
  die(`expected ${raw.residential.floors * raw.residential.unitsPerFloor} apartments, found ${resUnits.length}`);
}

/** True only if every residential schedule reconciles exactly — the page makes
 *  this claim in words, so it is gated on the computation, not on trust. */
export const allSchedulesReconcile = resTypes.every((t) => t.reconciles);
