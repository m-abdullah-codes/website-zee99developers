/**
 * Derives the page palette from the building's own renders rather than taste.
 * Samples named regions of specific assets — the dusk sky, the aluminium
 * glazing, the concrete piers, the lit windows — and reports OKLCH so the
 * result can be reasoned about in lightness/chroma terms.
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const A = (p) => join(root, 'assets', p);

// srgb -> oklch, so lightness ramps can be built on perceptual footing
function srgbToOklch(r, g, b) {
  const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.sqrt(a * a + bb * bb);
  let H = (Math.atan2(bb, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L: +(L * 100).toFixed(1), C: +C.toFixed(4), H: +H.toFixed(1) };
}
const hex = (r, g, b) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

/** average colour of a fractional region {l,t,w,h} of an image */
async function sample(file, region, label) {
  const img = sharp(file);
  const { width, height } = await img.metadata();
  const left = Math.round(region.l * width), top = Math.round(region.t * height);
  const w = Math.max(1, Math.round(region.w * width)), h = Math.max(1, Math.round(region.h * height));
  const { data, info } = await sharp(file)
    .extract({ left, top, width: w, height: h })
    .resize(1, 1, { fit: 'fill' })
    .removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const [r, g, b] = [data[0], data[1], data[2]];
  const o = srgbToOklch(r, g, b);
  console.log(
    `${label.padEnd(30)} ${hex(r, g, b)}   rgb(${String(r).padStart(3)},${String(g).padStart(3)},${String(b).padStart(3)})   ` +
    `oklch(${String(o.L).padStart(5)}% ${o.C.toFixed(3)} ${String(o.H).padStart(5)})`
  );
  return { label, hex: hex(r, g, b), rgb: [r, g, b], ...o };
}

console.log('\nEXTERIOR — Render 1, dusk\n' + '-'.repeat(92));
await sample(A('building-renders/Render 1.png'), { l: 0.05, t: 0.02, w: 0.2, h: 0.08 }, 'sky, upper (dusk blue)');
await sample(A('building-renders/Render 1.png'), { l: 0.05, t: 0.45, w: 0.15, h: 0.08 }, 'sky, horizon haze');
await sample(A('building-renders/Render 1.png'), { l: 0.34, t: 0.19, w: 0.06, h: 0.012 }, 'slab edge (pale concrete)');
await sample(A('building-renders/Render 1.png'), { l: 0.50, t: 0.30, w: 0.02, h: 0.05 }, 'pier (grey stone)');
await sample(A('building-renders/Render 1.png'), { l: 0.29, t: 0.24, w: 0.015, h: 0.04 }, 'timber soffit');
await sample(A('building-renders/Render 1.png'), { l: 0.40, t: 0.235, w: 0.03, h: 0.03 }, 'lit window (interior glow)');
await sample(A('building-renders/Render 1.png'), { l: 0.33, t: 0.775, w: 0.10, h: 0.015 }, 'shopfront fascia (dark)');
await sample(A('building-renders/Render 1.png'), { l: 0.30, t: 0.20, w: 0.015, h: 0.03 }, 'planting (green)');

console.log('\nEXTERIOR — Render 3 / 5\n' + '-'.repeat(92));
await sample(A('building-renders/Render 3.png'), { l: 0.02, t: 0.03, w: 0.15, h: 0.10 }, 'r3 sky');
await sample(A('building-renders/Render 5.png'), { l: 0.02, t: 0.03, w: 0.15, h: 0.10 }, 'r5 sky');

console.log('\nINTERIOR — warm end of the evening\n' + '-'.repeat(92));
await sample(A('2-BED/Scene 14.png'), { l: 0.30, t: 0.12, w: 0.10, h: 0.06 }, '2bed wall (warm plaster)');
await sample(A('2-BED/Scene 14.png'), { l: 0.06, t: 0.10, w: 0.03, h: 0.10 }, '2bed timber slat');
await sample(A('1-BED/Scene 3.png'), { l: 0.40, t: 0.20, w: 0.10, h: 0.10 }, '1bed midtone');
await sample(A('STUDIO/Scene 18.png'), { l: 0.40, t: 0.20, w: 0.10, h: 0.10 }, 'studio midtone');

console.log('\nROOFTOP — night\n' + '-'.repeat(92));
await sample(A('roof-top/rooftop-1.png'), { l: 0.05, t: 0.05, w: 0.15, h: 0.10 }, 'rooftop sky (night)');

console.log('');
