/**
 * Copy gate. Reads the rendered page (not the source) and fails on the
 * property-brochure clichés the brief bans outright, plus the vague
 * intensifiers that survive being pasted onto any other building.
 *
 * Run against dist/index.html after a build.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'dist/index.html'), 'utf8');

// strip tags, scripts, styles — judge only what a reader sees
const text = html
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z]+;/g, ' ')
  .replace(/\s+/g, ' ');

/** Automatic fail — named in the brief. */
const BANNED = [
  'nestled', 'dream home', 'luxury redefined', 'elevate', 'unparalleled',
  'world-class', 'world class', 'state-of-the-art', 'state of the art',
  'your journey begins', 'experience the difference', 'prime location',
  'investment opportunity of a lifetime',
];

/** Vague intensifiers and filler that would survive on another building's page. */
const WEAK = [
  'stunning', 'breathtaking', 'exquisite', 'iconic', 'bespoke', 'curated',
  'seamless', 'vibrant', 'lavish', 'opulent', 'timeless elegance', 'oasis',
  'haven', 'sanctuary', 'redefining', 'reimagined', 'unmatched', 'unrivalled',
  'unrivaled', 'cutting-edge', 'best-in-class', 'premier destination',
  'a testament to', 'nestling', 'discerning buyer', 'lifestyle you deserve',
  'more than just', 'not just a', 'welcome to your',
];

/** Emoji anywhere in the UI is banned by the brief. */
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u;

let fail = 0;
const hit = (list, label, hard) => {
  for (const term of list) {
    const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const found = text.match(re);
    if (found) {
      if (hard) fail++;
      const i = text.search(re);
      console[hard ? 'error' : 'warn'](
        `  ${hard ? 'FAIL' : 'WARN'}  ${label}: "${found[0]}" (${found.length}x)\n        ...${text.slice(Math.max(0, i - 60), i + 70).trim()}...`
      );
    }
  }
};

console.log('\n== banned phrases ==');
hit(BANNED, 'banned', true);
console.log('== vague intensifiers ==');
hit(WEAK, 'weak', true);

console.log('== emoji ==');
if (EMOJI.test(text)) { fail++; console.error('  FAIL  emoji found in rendered copy'); }

// Exclamation marks: the voice is declarative and unhurried.
const bangs = (text.match(/!/g) || []).length;
if (bangs) { fail++; console.error(`  FAIL  ${bangs} exclamation mark(s)`); }

// Anything that looks like a funnel.
console.log('== funnel language ==');
const CTA = ['book now', 'enquire now', 'limited time', 'hurry', "don't miss", 'act fast', 'register your interest', 'sign up', 'subscribe'];
hit(CTA, 'cta', true);

console.log('\n' + '-'.repeat(60));
if (fail) { console.error(`COPY GATE FAILED — ${fail} issue(s).`); process.exit(1); }
console.log('COPY GATE PASSED — no banned phrases, intensifiers, emoji or funnel language.');
console.log('-'.repeat(60) + '\n');
