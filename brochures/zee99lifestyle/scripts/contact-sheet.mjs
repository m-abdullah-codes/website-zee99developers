/** Contact sheets, so gallery order can be judged rather than guessed.
 *  Scene numbers in assets/ are non-contiguous and carry no narrative order. */
import sharp from 'sharp';
import { readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const groups = { STUDIO: 'studio', '1-BED': '1bed', '2-BED': '2bed' };
mkdirSync('shots/sheets', { recursive: true });

for (const [dir, key] of Object.entries(groups)) {
  const files = readdirSync(join('assets', dir))
    .filter(f => /\.png$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const cols = 4, cw = 380, ch = 278;
  const rows = Math.ceil(files.length / cols);
  const tiles = [];
  for (let i = 0; i < files.length; i++) {
    const buf = await sharp(join('assets', dir, files[i]))
      .resize(cw - 8, ch - 24, { fit: 'cover' }).toBuffer();
    tiles.push({
      input: await sharp({ create: { width: cw, height: ch, channels: 3, background: '#ffffff' } })
        .composite([
          { input: buf, top: 20, left: 4 },
          { input: Buffer.from(
              `<svg width="${cw}" height="18"><text x="4" y="13" font-family="monospace" font-size="13" fill="#111">${i + 1}. ${files[i].replace('.png','')}</text></svg>`
            ), top: 0, left: 0 },
        ]).png().toBuffer(),
      top: Math.floor(i / cols) * ch,
      left: (i % cols) * cw,
    });
  }
  const out = `shots/sheets/${key}.png`;
  await sharp({ create: { width: cols * cw, height: rows * ch, channels: 3, background: '#ffffff' } })
    .composite(tiles).png().toFile(out);
  console.log(`${out}  ${files.length} images`);
}
