/**
 * Responsive image pipeline.
 *
 * The source set is ~640MB: 29 interior renders at 3840x2804 PNG, five exteriors,
 * six floor plans, three rooftop portraits and two bird's-eye maps. Shipped naively
 * the page is unopenable on a Pakistani mobile connection, so nothing reaches the
 * page except through here.
 *
 * For every source it emits AVIF + WebP at capped widths, a ~300-byte inline LQIP,
 * and the dominant colour (used as the placeholder tint so there is no white flash
 * and no layout shift). Results are cached against source mtime, so re-runs are free.
 *
 * Output: public/img/<key>/<width>.<fmt>  +  src/generated/images.json
 */
import sharp from 'sharp';
import { mkdirSync, writeFileSync, existsSync, statSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';
import { readdir } from 'node:fs/promises';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'assets');
const OUT = join(root, 'public/img');
const MANIFEST = join(root, 'src/generated/images.json');

sharp.cache(false);
sharp.concurrency(Math.max(2, (await import('node:os')).cpus().length - 1));

// Width ladders differ by role. A floor plan gets pushed wider because it is
// pinch-zoomed and read; a gallery thumbnail never needs more than 900.
const LADDERS = {
  hero: [640, 960, 1400, 1920, 2400],
  gallery: [420, 640, 900, 1280, 1800],
  plan: [640, 1000, 1500, 2200, 3000],
  map: [640, 1000, 1500, 2000],
  portrait: [400, 600, 900, 1200],
};

const GROUPS = [
  { dir: 'building-renders', key: 'exterior', role: 'hero' },
  { dir: '1-BED', key: '1bed', role: 'gallery' },
  { dir: '2-BED', key: '2bed', role: 'gallery' },
  { dir: 'STUDIO', key: 'studio', role: 'gallery' },
  { dir: 'roof-top', key: 'rooftop', role: 'portrait' },
  { dir: 'floor-plans', key: 'plan', role: 'plan' },
  { dir: "Bird's Eye views", key: 'map', role: 'map' },
  /* Site photography. Filenames carry the sequence: these are the same corner
     at four points in the build, and the order is the whole content. */
  { dir: 'site-progress', key: 'site', role: 'gallery' },
];

const slug = (s) =>
  s.replace(/\.(png|jpe?g)$/i, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const manifest = {};
let encoded = 0, cached = 0, bytesOut = 0;

for (const group of GROUPS) {
  let files;
  try { files = (await readdir(join(SRC, group.dir))).filter((f) => /\.(png|jpe?g)$/i.test(f)); }
  catch { console.warn(`  skip (missing): ${group.dir}`); continue; }

  // "Scene 10" must sort after "Scene 9"
  files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  for (const file of files) {
    const abs = join(SRC, group.dir, file);
    const key = `${group.key}/${slug(file)}`;
    const dir = join(OUT, key);
    mkdirSync(dir, { recursive: true });

    const meta = await sharp(abs).metadata();
    const srcMtime = statSync(abs).mtimeMs;
    const ladder = LADDERS[group.role].filter((w) => w <= meta.width).concat(
      LADDERS[group.role].every((w) => w > meta.width) ? [meta.width] : []
    );
    if (!ladder.includes(meta.width) && ladder.length === 0) ladder.push(meta.width);

    const entry = {
      key,
      group: group.key,
      role: group.role,
      src: relative(root, abs).replace(/\\/g, '/'),
      width: meta.width,
      height: meta.height,
      aspect: +(meta.width / meta.height).toFixed(4),
      avif: [],
      webp: [],
    };

    for (const w of ladder) {
      for (const [fmt, opts] of [
        ['avif', { quality: 50, effort: 4, chromaSubsampling: '4:2:0' }],
        ['webp', { quality: 76, effort: 4 }],
      ]) {
        const outPath = join(dir, `${w}.${fmt}`);
        const fresh = existsSync(outPath) && statSync(outPath).mtimeMs > srcMtime;
        if (!fresh) {
          const buf = await sharp(abs).resize(w, null, { withoutEnlargement: true })
            .toFormat(fmt, opts).toBuffer();
          writeFileSync(outPath, buf);
          encoded++;
        } else cached++;
        const size = statSync(outPath).size;
        bytesOut += size;
        entry[fmt].push({ w, path: `/img/${key}/${w}.${fmt}`, bytes: size });
      }
    }

    // LQIP — 20px wide, blurred, inlined in the markup. Costs ~300 bytes and
    // removes the white flash without a network round trip.
    const lq = await sharp(abs).resize(20, null, { withoutEnlargement: true })
      .blur(1.1).webp({ quality: 32 }).toBuffer();
    entry.lqip = `data:image/webp;base64,${lq.toString('base64')}`;

    const { dominant } = await sharp(abs).resize(80).stats();
    entry.color = `#${[dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;

    manifest[key] = entry;
    process.stdout.write(`\r  ${String(Object.keys(manifest).length).padStart(3)} images  ${encoded} encoded  ${cached} cached   ${key.padEnd(38).slice(0, 38)}`);
  }
}

mkdirSync(dirname(MANIFEST), { recursive: true });
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

// --- video: a mobile-weight rendition + poster, both derived from the source ---
const VID = join(SRC, 'decorative-cinematic-video.mp4');
const vidOut = join(root, 'public/video');
mkdirSync(vidOut, { recursive: true });
if (existsSync(VID)) {
  const { execSync } = await import('node:child_process');
  const poster = join(OUT, 'video-poster');
  mkdirSync(poster, { recursive: true });
  const posterPng = join(poster, 'frame.png');
  try {
    if (!existsSync(posterPng)) {
      execSync(`ffmpeg -y -loglevel error -ss 0.5 -i "${VID}" -frames:v 1 "${posterPng}"`, { stdio: 'pipe' });
    }
    const pm = await sharp(posterPng).metadata();
    const pEntry = { key: 'video-poster', group: 'video', role: 'hero', width: pm.width, height: pm.height, aspect: +(pm.width / pm.height).toFixed(4), avif: [], webp: [] };
    for (const w of LADDERS.hero.filter((w) => w <= pm.width)) {
      for (const [fmt, opts] of [['avif', { quality: 52, effort: 4 }], ['webp', { quality: 78, effort: 4 }]]) {
        const p = join(poster, `${w}.${fmt}`);
        if (!existsSync(p)) writeFileSync(p, await sharp(posterPng).resize(w).toFormat(fmt, opts).toBuffer());
        pEntry[fmt].push({ w, path: `/img/video-poster/${w}.${fmt}`, bytes: statSync(p).size });
      }
    }
    const lq = await sharp(posterPng).resize(20).blur(1.1).webp({ quality: 32 }).toBuffer();
    pEntry.lqip = `data:image/webp;base64,${lq.toString('base64')}`;
    const { dominant } = await sharp(posterPng).resize(80).stats();
    pEntry.color = `#${[dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
    manifest['video-poster'] = pEntry;
    writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

    // Three renditions. The 540p is what a phone actually gets: this is an
    // ambient 10-second loop behind a scrim with type over it, so quality
    // demands are modest and a megabyte of decoration on a Pakistani mobile
    // connection is not defensible.
    const rends = [
      ['opening-540.mp4', 'scale=-2:540', 33],
      ['opening-720.mp4', 'scale=-2:720', 31],
      ['opening-1080.mp4', 'scale=-2:1080', 28],
    ];
    const made = [];
    for (const [name, vf, crf] of rends) {
      const p = join(vidOut, name);
      if (!existsSync(p)) {
        execSync(`ffmpeg -y -loglevel error -i "${VID}" -an -vf "${vf}" -c:v libx264 -crf ${crf} -preset slow -movflags +faststart -pix_fmt yuv420p "${p}"`, { stdio: 'pipe' });
      }
      made.push(`${name.replace('opening-', '').replace('.mp4', '')} ${(statSync(p).size / 1024).toFixed(0)}KB`);
    }
    console.log(`\n  video  poster + ${made.join(' + ')}, audio stripped`);
  } catch (e) {
    console.warn(`\n  video step skipped: ${String(e.message).split('\n')[0]}`);
  }
}

console.log(`\n\n  ${Object.keys(manifest).length} images  ${encoded} encoded  ${cached} cached  ${(bytesOut / 1048576).toFixed(1)}MB derivatives`);
console.log(`  manifest -> ${relative(root, MANIFEST)}\n`);
