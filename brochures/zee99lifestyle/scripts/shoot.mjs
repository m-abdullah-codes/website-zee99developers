/**
 * Renders the built page and captures the evidence the critics judge.
 * Critics never see reasoning or source — only what comes out of here.
 *
 *   node scripts/shoot.mjs                  full page, 360 / 768 / 1440
 *   node scripts/shoot.mjs --section=money  just that section, all widths
 *   node scripts/shoot.mjs --perf           network + timing audit on throttled 4G
 *   node scripts/shoot.mjs --tag=r3         label the output folder
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);

const URL_BASE = args.url || 'http://localhost:4321';
const tag = args.tag || 'latest';
const out = join(root, 'shots', String(tag));
mkdirSync(out, { recursive: true });

const WIDTHS = [
  { name: '360', width: 360, height: 780, mobile: true },
  { name: '768', width: 768, height: 1024, mobile: false },
  { name: '1440', width: 1440, height: 900, mobile: false },
];

const browser = await chromium.launch();
const report = { url: URL_BASE, tag, widths: {}, problems: [] };

for (const w of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width: w.width, height: w.height },
    deviceScaleFactor: 2,
    isMobile: w.mobile,
    hasTouch: w.mobile,
  });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));

  await page.goto(URL_BASE, { waitUntil: 'load', timeout: 60000 });
  // walk the whole page so lazy content resolves, then return to the top
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const step = () => {
        y += window.innerHeight * 0.8;
        window.scrollTo(0, y);
        if (y < document.body.scrollHeight) setTimeout(step, 90);
        else { window.scrollTo(0, 0); setTimeout(res, 700); }
      };
      step();
    });
  });
  await page.waitForTimeout(1200);

  // horizontal overflow is an automatic mobile-critic fail
  const overflow = await page.evaluate(() => {
    const de = document.documentElement;
    const guilty = [];
    if (de.scrollWidth > de.clientWidth + 1) {
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && (r.right > de.clientWidth + 1 || r.left < -1)) {
          guilty.push({
            tag: el.tagName.toLowerCase(),
            cls: (typeof el.className === 'string' ? el.className : '').slice(0, 70),
            left: Math.round(r.left), right: Math.round(r.right),
          });
        }
      }
    }
    return { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, guilty: guilty.slice(0, 12) };
  });

  // Text laid out past the viewport but clipped by an ancestor never reaches the
  // document's scrollWidth, so the check above cannot see it — §08's floor blocks
  // shipped that way for five rounds. This one reads the words instead: any leaf
  // carrying text whose box starts or ends outside the viewport is unreadable,
  // whether or not the page can be scrolled sideways to it. Elements inside a
  // deliberate horizontal scroller (a filmstrip, a floor plate) are exempt —
  // panning to them is the design.
  const clipped = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const inScroller = (el) => {
      for (let n = el.parentElement; n; n = n.parentElement) {
        const ox = getComputedStyle(n).overflowX;
        if ((ox === 'auto' || ox === 'scroll') && n.scrollWidth > n.clientWidth + 1) return true;
      }
      return false;
    };
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      if (el.children.length) continue;
      const text = (el.textContent || '').trim();
      if (!text) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right <= vw + 1 && r.left >= -1) continue;
      if (inScroller(el)) continue;
      out.push({
        tag: el.tagName.toLowerCase(),
        cls: (typeof el.className === 'string' ? el.className : '').slice(0, 50),
        left: Math.round(r.left), right: Math.round(r.right),
        text: text.replace(/\s+/g, ' ').slice(0, 46),
      });
    }
    return out;
  });
  if (clipped.length) {
    report.problems.push(`${w.name}px: ${clipped.length} text element(s) laid out past the viewport and clipped`);
  }

  // Touch targets below 44px are a mobile-critic fail. WCAG 2.5.8 exempts a
  // link sitting inline inside a sentence, so those are not counted — the
  // surrounding line-height is the target there and enlarging it would break
  // the paragraph.
  const smallTargets = await page.evaluate(() =>
    [...document.querySelectorAll('a, button, [role="button"], summary, input, select')]
      .filter((el) => getComputedStyle(el).display !== 'inline')
      .map((el) => { const r = el.getBoundingClientRect(); return { r, el }; })
      .filter(({ r }) => r.width > 0 && r.height > 0 && (r.height < 43.5 || r.width < 43.5))
      .map(({ r, el }) => ({
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || '').trim().slice(0, 34),
        w: Math.round(r.width), h: Math.round(r.height),
      }))
      .slice(0, 20)
  );

  const metrics = await page.evaluate(() => ({
    docHeight: document.body.scrollHeight,
    screens: +(document.body.scrollHeight / window.innerHeight).toFixed(1),
  }));

  if (overflow.scrollWidth > overflow.clientWidth + 1) {
    report.problems.push(`${w.name}px: horizontal overflow ${overflow.scrollWidth} > ${overflow.clientWidth}`);
  }
  if (w.mobile && smallTargets.length) {
    report.problems.push(`${w.name}px: ${smallTargets.length} touch target(s) under 44px`);
  }
  if (consoleErrors.length) report.problems.push(`${w.name}px: ${consoleErrors.length} console error(s)`);

  report.widths[w.name] = { overflow, clipped, smallTargets, metrics, consoleErrors };

  if (args.section) {
    const el = page.locator(`#${args.section}`);
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    await el.screenshot({ path: join(out, `${args.section}--${w.name}.png`) });
  } else {
    await page.screenshot({ path: join(out, `full--${w.name}.png`), fullPage: true });
    await page.screenshot({ path: join(out, `fold--${w.name}.png`) });
  }

  console.log(`  ${w.name}px  height ${metrics.docHeight}px (${metrics.screens} screens)  overflow:${overflow.scrollWidth > overflow.clientWidth + 1 ? 'YES' : 'no'}  clipped:${clipped.length}  smallTargets:${smallTargets.length}  errors:${consoleErrors.length}`);
  for (const c of clipped.slice(0, 6)) console.log(`      clipped  ${c.left}→${c.right}  .${c.cls.split(' ')[0]}  "${c.text}"`);
  await ctx.close();
}

if (args.perf) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  // Regular 4G, and a 4x CPU slowdown to stand in for a mid-range Android
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false, latency: 150, downloadThroughput: (4 * 1024 * 1024) / 8, uploadThroughput: (3 * 1024 * 1024) / 8,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  const reqs = [];
  page.on('response', async (r) => {
    try {
      const h = r.headers();
      reqs.push({
        url: r.url().replace(URL_BASE, ''),
        type: h['content-type'] || '',
        size: Number(h['content-length'] || 0),
        status: r.status(),
      });
    } catch {}
  });

  const t0 = Date.now();
  await page.goto(URL_BASE, { waitUntil: 'load', timeout: 120000 });
  const loadMs = Date.now() - t0;
  await page.waitForTimeout(2500);

  // measure what the *initial view* actually costs: everything transferred
  // before the user scrolls. Below-the-fold images must not appear here.
  const sizes = await page.evaluate(() =>
    performance.getEntriesByType('resource').map((e) => ({
      name: e.name, transfer: e.transferSize, type: e.initiatorType, start: e.startTime, end: e.responseEnd,
    }))
  );
  const nav = await page.evaluate(() => {
    const n = performance.getEntriesByType('navigation')[0];
    const paints = Object.fromEntries(performance.getEntriesByType('paint').map((p) => [p.name, Math.round(p.startTime)]));
    return { domInteractive: Math.round(n.domInteractive), domContentLoaded: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd), ...paints };
  });
  const lcp = await page.evaluate(() => new Promise((res) => {
    let v = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) v = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    setTimeout(() => res(Math.round(v)), 1200);
  }));
  const cls = await page.evaluate(() => new Promise((res) => {
    let v = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) v += e.value; }).observe({ type: 'layout-shift', buffered: true });
    setTimeout(() => res(+v.toFixed(4)), 1200);
  }));

  const initialBytes = sizes.reduce((a, b) => a + (b.transfer || 0), 0);
  const byType = {};
  for (const s of sizes) {
    const k = /\.(avif|webp|png|jpe?g)/i.test(s.name) ? 'image' : /\.mp4/i.test(s.name) ? 'video' : /\.js/i.test(s.name) ? 'js' : /\.css/i.test(s.name) ? 'css' : /\.(woff2?|ttf)/i.test(s.name) ? 'font' : 'other';
    byType[k] = (byType[k] || 0) + (s.transfer || 0);
  }

  report.perf = {
    loadMs, nav, lcp, cls,
    initialBytes,
    initialMB: +(initialBytes / 1048576).toFixed(2),
    byTypeKB: Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, Math.round(v / 1024)])),
    requestCount: sizes.length,
    heaviest: sizes.filter((s) => s.transfer > 40000).sort((a, b) => b.transfer - a.transfer).slice(0, 12)
      .map((s) => `${Math.round(s.transfer / 1024)}KB  ${s.name.replace(URL_BASE, '')}`),
  };

  const BUDGET_MB = 2, BUDGET_TTI = 2500;
  if (report.perf.initialMB > BUDGET_MB) report.problems.push(`PERF: initial view ${report.perf.initialMB}MB > ${BUDGET_MB}MB budget`);
  if (nav.domInteractive > BUDGET_TTI) report.problems.push(`PERF: interactive ${nav.domInteractive}ms > ${BUDGET_TTI}ms budget`);
  if (cls > 0.1) report.problems.push(`PERF: CLS ${cls} > 0.1`);

  console.log(`\n  PERF on throttled 4G + 4x CPU`);
  console.log(`    initial view   ${report.perf.initialMB} MB   (budget 2 MB)`);
  console.log(`    interactive    ${nav.domInteractive} ms      (budget 2500 ms)`);
  console.log(`    FCP ${nav['first-contentful-paint']} ms   LCP ${lcp} ms   CLS ${cls}`);
  console.log(`    by type (KB)   ${JSON.stringify(report.perf.byTypeKB)}`);
  console.log(`    requests       ${sizes.length}`);
  await ctx.close();
}

await browser.close();
writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 2));

console.log('\n' + (report.problems.length ? 'PROBLEMS:\n  - ' + report.problems.join('\n  - ') : 'No automated problems detected.'));
console.log(`\nshots/${tag}/`);
