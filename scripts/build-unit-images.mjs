// Rebuilds the Zee99 Lifestyle unit renders + floor plans in
// public/images/projects/zee99-lifestyle/ from the masters in
// brochures/zee99lifestyle/assets/ (gitignored — they live on the shared drive).
//
// One file per image, deliberately: the same picture is also uploaded to R2 from
// the dashboard, so a responsive ladder would mean uploading each render five
// times. The list below is the curated set — near-duplicate scenes (alternate
// crops of a shot already in the gallery) are left out on purpose.
//
//   node scripts/build-unit-images.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const ASSETS = "brochures/zee99lifestyle/assets";
const OUT = "public/images/projects/zee99-lifestyle";

/** [master, output basename] — order matches the gallery order on the site. */
const RENDERS = [
  ["STUDIO/Scene 18.png", "studio-lounge"],
  ["STUDIO/Scene 19.png", "studio-bedroom"],
  ["STUDIO/Scene 20.png", "studio-kitchen"],
  ["STUDIO/Scene 25.png", "studio-bedside"],

  ["1-BED/Scene 1.png", "1-bed-living"],
  ["1-BED/Scene 3.png", "1-bed-lounge"],
  ["1-BED/Scene 4.png", "1-bed-kitchen"],
  ["1-BED/Scene 9.png", "1-bed-bedroom"],
  ["1-BED/Scene 6.png", "1-bed-bed"],
  ["1-BED/Scene 7.png", "1-bed-wardrobe"],
  ["1-BED/Scene 8.png", "1-bed-bedroom-media"],

  ["2-BED/Scene 10.png", "2-bed-living"],
  ["2-BED/Scene 11.png", "2-bed-lounge"],
  ["2-BED/Scene 12.png", "2-bed-living-art"],
  ["2-BED/Scene 17.png", "2-bed-kitchen"],
  ["2-BED/Scene 13.png", "2-bed-master-bedroom"],
  ["2-BED/Scene 14.png", "2-bed-master-dressing"],
  ["2-BED/Scene 15.png", "2-bed-second-bedroom"],
  ["2-BED/Scene 23.png", "2-bed-second-bedroom-media"],
];

const PLANS = [
  ["floor-plans/studio-floorplan.jpg", "studio-floor-plan"],
  ["floor-plans/1Bed-floorplan.jpg", "1-bed-floor-plan"],
  ["floor-plans/2Bed-floorplan.jpg", "2-bed-floor-plan"],
];

// The roof, landscape and full-bleed. It is the headline amenity plate on the
// project page and on the e-brochure (aspect-[16/9], up to the full width of a
// phone), and the master is a 3840px render — so it gets a wider cap and a
// notch more quality than the interior renders, which are only ever seen
// inside a dialog. The three portrait roof frames beside it in
// assets/roof-top/ are the light brochure's, built by its own pipeline.
const ROOF = [["roof-top/rooftop-cinema.png", "rooftop-cinema"]];

// The two commercial floors. Rendered plates rather than line drawings — full
// of furniture, lighting and marble — so they are treated like the renders
// above (capped and compressed) instead of like the apartment drawings.
const COMMERCIAL_PLANS = [
  ["floor-plans/commercial-ground-floorplan.jpg", "commercial-ground-floor-plan"],
  ["floor-plans/commercial-lowerGround-floorplan.jpg", "commercial-lower-ground-floor-plan"],
];

await mkdir(OUT, { recursive: true });

// 1400px is ~1.8× the largest place a render is ever shown (the dialog plate on
// a desktop), and the site is read on a phone first — so weight wins over pixels
// nobody sees.
for (const [src, name] of RENDERS) {
  const file = path.join(OUT, `${name}.webp`);
  const { size } = await sharp(path.join(ASSETS, src))
    .resize({ width: 1400, withoutEnlargement: true })
    .webp({ quality: 74, effort: 6 })
    .toFile(file);
  console.log(`${file}  ${(size / 1024).toFixed(0)} KB`);
}

for (const [src, name] of ROOF) {
  const file = path.join(OUT, `${name}.webp`);
  const { size } = await sharp(path.join(ASSETS, src))
    .resize({ width: 1800, withoutEnlargement: true })
    .webp({ quality: 78, effort: 6 })
    .toFile(file);
  console.log(`${file}  ${(size / 1024).toFixed(0)} KB`);
}

// Line drawings: no downscale (the masters are already small) and a higher
// quality, because lettering and hairlines are what a floor plan is.
for (const [src, name] of PLANS) {
  const file = path.join(OUT, `${name}.webp`);
  const { size } = await sharp(path.join(ASSETS, src))
    .webp({ quality: 90, effort: 6 })
    .toFile(file);
  console.log(`${file}  ${(size / 1024).toFixed(0)} KB`);
}

for (const [src, name] of COMMERCIAL_PLANS) {
  const file = path.join(OUT, `${name}.webp`);
  const { size } = await sharp(path.join(ASSETS, src))
    .resize({ width: 1400, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(file);
  console.log(`${file}  ${(size / 1024).toFixed(0)} KB`);
}
