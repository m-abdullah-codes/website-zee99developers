/** Viewport-sized tiles down the whole document, for eyeballing. */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const W = Number(process.argv[2] || 390);
const H = Number(process.argv[3] || 844);
const tag = process.argv[4] || `t${W}`;
const out = `C:/Users/LENOVO/AppData/Local/Temp/claude/D--works-websites-Contour-Systems-zee99lifestyle/e1878ff3-e110-4523-9f0c-18f0365e7ca0/scratchpad/${tag}`;
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: W, height: H }, deviceScaleFactor: 1,
  isMobile: W < 700, hasTouch: W < 700,
});
const page = await ctx.newPage();
await page.goto('http://localhost:4321', { waitUntil: 'load' });
await page.evaluate(async () => {
  await new Promise((res) => {
    let y = 0;
    const step = () => {
      y += window.innerHeight * 0.8;
      window.scrollTo(0, y);
      if (y < document.body.scrollHeight) setTimeout(step, 60);
      else { window.scrollTo(0, 0); setTimeout(res, 600); }
    };
    step();
  });
});
await page.waitForTimeout(1000);

const total = await page.evaluate(() => document.documentElement.scrollHeight);
const n = Math.ceil(total / H);
for (let i = 0; i < n; i++) {
  await page.evaluate((y) => window.scrollTo(0, y), i * H);
  await page.waitForTimeout(220);
  await page.screenshot({ path: `${out}/${String(i).padStart(2, '0')}.png` });
}
console.log(`${n} tiles, doc ${total}px -> ${out}`);
await browser.close();
