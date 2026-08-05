/**
 * Data gate. Recomputes every derived figure from data/inventory.json and
 * cross-checks it against docs/facts.md. Exits non-zero on any mismatch.
 * Run before every build: nothing ships if this fails.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const inv = JSON.parse(readFileSync(join(root, 'data/inventory.json'), 'utf8'));

let fail = 0;
const pass = [];
const check = (label, actual, expected) => {
  const ok = actual === expected;
  if (!ok) {
    fail++;
    console.error(`  FAIL  ${label}\n        got ${actual}  expected ${expected}`);
  } else {
    pass.push(label);
  }
  return ok;
};

const fmt = (n) => n.toLocaleString('en-US');

console.log('\n== RESIDENTIAL: schedule reconciliation ==');
for (const [key, t] of Object.entries(inv.residential.types)) {
  const p = t.plan;
  const sum =
    p.down +
    p.monthly * p.monthlyCount +
    p.structure +
    p.halfYearly * p.halfYearlyCount +
    p.possession;
  check(`${t.label} schedule sums to price (${fmt(sum)})`, sum, t.price);
  check(`${t.label} rate = ${fmt(inv.residential.ratePerSqft)}/sqft`, t.price / t.sqft, inv.residential.ratePerSqft);
}

console.log('\n== RESIDENTIAL: unit integrity ==');
const units = inv.residential.units;
check('unit count', units.length, inv.residential.floors * inv.residential.unitsPerFloor);
for (const u of units) {
  const t = inv.residential.types[u.type];
  if (!t) { fail++; console.error(`  FAIL  unit ${u.id} unknown type ${u.type}`); continue; }
  if (u.sqft !== t.sqft) { fail++; console.error(`  FAIL  unit ${u.id} sqft ${u.sqft} != type ${t.sqft}`); }
  if (u.price !== t.price) { fail++; console.error(`  FAIL  unit ${u.id} price ${u.price} != type ${t.price}`); }
  if (u.price / u.sqft !== inv.residential.ratePerSqft) {
    fail++; console.error(`  FAIL  unit ${u.id} rate ${u.price / u.sqft}`);
  }
}
// facts.md: units 01,02,03,05,06,07 are 1 Bed; 04 is 2 Bed; 08 is Studio.
// 01-04 face sports complex; 05-08 face residences.
const expectType = { 1: '1bed', 2: '1bed', 3: '1bed', 4: '2bed', 5: '1bed', 6: '1bed', 7: '1bed', 8: 'studio' };
for (const u of units) {
  const pos = Number(u.id.slice(-2));
  if (u.type !== expectType[pos]) { fail++; console.error(`  FAIL  ${u.id} type ${u.type} != ${expectType[pos]}`); }
  const facing = pos <= 4 ? 'sports complex' : 'residence';
  if (u.facing !== facing) { fail++; console.error(`  FAIL  ${u.id} facing ${u.facing} != ${facing}`); }
}
console.log(`  layout: unit positions + facings consistent across all ${units.length} units`);

console.log('\n== RESIDENTIAL: status counts (facts.md claims 30/6/10/2 of 48) ==');
const rCount = (s) => units.filter((u) => u.status === s).length;
check('available', rCount('available'), 30);
check('reserved', rCount('reserved'), 6);
check('booked', rCount('booked'), 10);
check('sold', rCount('sold'), 2);
check('total', units.length, 48);

// facts.md: "Floor 2 is fully taken. Floor 5 holds the only two sold apartments."
const f2 = units.filter((u) => u.floor === 2);
check('floor 2 fully taken', f2.every((u) => u.status !== 'available'), true);
const soldFloors = [...new Set(units.filter((u) => u.status === 'sold').map((u) => u.floor))];
check('sold units only on floor 5', JSON.stringify(soldFloors), JSON.stringify([5]));

console.log('\n== COMMERCIAL: schedule reconciliation ==');
const comm = [...inv.commercial.ground.units, ...inv.commercial.lowerGround.units];
check('commercial unit count', comm.length, 23);
const drift = [];
for (const u of comm) {
  const p = u.plan;
  const sum = p.down + p.monthly * p.monthlyCount + p.biAnnual * p.biAnnualCount + p.structure + p.possession;
  if (sum !== u.price) {
    drift.push(`${u.id}: sum ${fmt(sum)} vs price ${fmt(u.price)} (delta ${sum - u.price})`);
  }
  check(`${u.id} price = ${fmt(u.sqft)} x ${fmt(u.ratePerSqft)}`, u.price, u.sqft * u.ratePerSqft);
}
if (drift.length) {
  fail++;
  console.error('  FAIL  commercial schedules do not reconcile:\n        ' + drift.join('\n        '));
} else {
  console.log(`  all ${comm.length} commercial schedules reconcile to the rupee`);
}

console.log('\n== COMMERCIAL: payment split matches declared percentages ==');
const sp = inv.commercial.paymentSplit;
for (const u of comm) {
  const p = u.plan;
  const parts = [
    ['down', p.down, sp.downPct],
    ['monthly block', p.monthly * p.monthlyCount, sp.monthlyPct],
    ['bi-annual block', p.biAnnual * p.biAnnualCount, sp.biAnnualPct],
    ['structure', p.structure, sp.structurePct],
    ['possession', p.possession, sp.possessionPct],
  ];
  for (const [name, amount, pct] of parts) {
    const target = (u.price * pct) / 100;
    // rounding tolerance: monthly/bi-annual are rounded to the rupee then multiplied
    const tol = Math.max(36, Math.abs(target) * 0.0005);
    if (Math.abs(amount - target) > tol) {
      fail++;
      console.error(`  FAIL  ${u.id} ${name} ${fmt(amount)} != ${pct}% (${fmt(target)})`);
    }
  }
}
console.log('  every commercial unit follows 20 / 30 / 20 / 10 / 20 within rounding');

console.log('\n== COMMERCIAL: rates ==');
const g = inv.commercial.ground.units;
check('ground units', g.length, 9);
check('lower ground units', inv.commercial.lowerGround.units.length, 14); // 13 shops + 1 kiosk
const gStd = g.filter((u) => u.ratePerSqft === inv.commercial.ground.ratePerSqft);
check('ground units at headline 55,000 rate', gStd.length, 8);
const gOdd = g.filter((u) => u.ratePerSqft !== inv.commercial.ground.ratePerSqft);
console.log(`  exception: ${gOdd.map((u) => `${u.id} @ ${fmt(u.ratePerSqft)}`).join(', ')} — page copy must not say "every ground shop is 55,000"`);
const gSizes = g.map((u) => u.sqft);
check('ground size range 305-486', `${Math.min(...gSizes)}-${Math.max(...gSizes)}`, '305-486');
const lgShops = inv.commercial.lowerGround.units.filter((u) => u.type === 'Shop');
const lgSizes = lgShops.map((u) => u.sqft);
check('lower ground shops', lgShops.length, 13);
check('lower ground shop range 180-390', `${Math.min(...lgSizes)}-${Math.max(...lgSizes)}`, '180-390');
const kiosk = inv.commercial.lowerGround.units.filter((u) => u.type === 'Kiosk');
check('kiosk count', kiosk.length, 1);
check('kiosk sqft', kiosk[0].sqft, 70);

console.log('\n== COMMERCIAL: status counts (facts.md claims 14/3/4/2 of 23) ==');
const cCount = (s) => comm.filter((u) => u.status === s).length;
check('available', cCount('available'), 14);
check('reserved', cCount('reserved'), 3);
check('booked', cCount('booked'), 4);
check('sold', cCount('sold'), 2);

console.log('\n== TOTALS ==');
check('71 units in total', units.length + comm.length, 71);
check('possession 30 months', inv.residential.possessionMonths, 30);
check('plan 36 months', inv.residential.planMonths, 36);
check('keys arrive 6 months before final installment', inv.residential.planMonths - inv.residential.possessionMonths, 6);

console.log('\n' + '-'.repeat(64));
if (fail) {
  console.error(`DATA GATE FAILED — ${fail} mismatch(es). Build blocked.`);
  process.exit(1);
}
console.log(`DATA GATE PASSED — ${pass.length} assertions, 0 mismatches.`);
console.log('-'.repeat(64) + '\n');
