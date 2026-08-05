/**
 * Captures the benchmark set into docs/reference/.
 * These are the comparison targets every critic is measured against:
 * award-winning architecture practices, luxury residential developers,
 * and material-led design studios. Not real-estate templates.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'docs/reference');
mkdirSync(out, { recursive: true });

const refs = [
  { slug: 'norm-architects', url: 'https://normarchitects.com/', why: 'Danish studio. Light material palette, restraint, photography carries the page.' },
  { slug: 'john-pawson', url: 'https://johnpawson.com/', why: 'Minimalism benchmark. Type discipline, enormous negative space.' },
  { slug: '111-west-57th', url: 'https://111w57.com/', why: 'Luxury residential development with a genuinely large budget. Direct competitor category.' },
  { slug: 'vipp', url: 'https://www.vipp.com/en/hotels', why: 'Material-led, light theme, product photography treated architecturally.' },
  { slug: 'snohetta', url: 'https://www.snohetta.com/', why: 'Award-winning practice. Motion and structural layout.' },
  { slug: 'david-chipperfield', url: 'https://davidchipperfield.com/', why: 'Architectural rigour, editorial typography, quiet.' },
];

const browser = await chromium.launch();
const results = [];

for (const ref of refs) {
  for (const [device, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
    const ctx = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 2,
      userAgent:
        device === 'mobile'
          ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
          : undefined,
      isMobile: device === 'mobile',
      hasTouch: device === 'mobile',
    });
    const page = await ctx.newPage();
    try {
      await page.goto(ref.url, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(3500);
      // dismiss the usual consent furniture so it doesn't cover the design
      for (const sel of ['text=/^(Accept|Allow all|I agree|OK|Got it)/i', '[id*="accept" i]', '[class*="accept" i]']) {
        try { await page.locator(sel).first().click({ timeout: 1200 }); await page.waitForTimeout(700); break; } catch {}
      }
      await page.screenshot({ path: join(out, `${ref.slug}--${device}-fold.png`) });
      if (device === 'desktop') {
        // scrolled state shows how the page actually behaves, not just its cover
        await page.mouse.wheel(0, height * 2.2);
        await page.waitForTimeout(2500);
        await page.screenshot({ path: join(out, `${ref.slug}--desktop-scrolled.png`) });
      }
      results.push(`${ref.slug} ${device} OK`);
      console.log(`  captured  ${ref.slug} ${device}`);
    } catch (e) {
      results.push(`${ref.slug} ${device} FAILED ${e.message.split('\n')[0]}`);
      console.error(`  failed    ${ref.slug} ${device}: ${e.message.split('\n')[0]}`);
    }
    await ctx.close();
  }
}

await browser.close();
console.log('\n' + results.join('\n'));
