// Builds the Zee99 Lifestyle e-brochure and drops it into public/, so that
// `next build` copies it into out/ and the Worker serves it at
//   https://zee99developers.com/zee99lifestyle-e-brochure-lightweight
//
// This is the light brochure: one static Astro page, no framework, sent where
// bandwidth is the constraint. `/zee99lifestyle-e-brochure` (no suffix) is now
// the full one, a Next route under src/app.
//
// The brochure is a standalone Astro site under brochures/. It is not part of
// the Next app and never imports from it; the only contract between them is the
// route below, which is also hard-coded as `base` in the brochure's
// astro.config.mjs. Change one and you must change the other.
//
// Run on its own with `npm run build:brochure`; `npm run build` runs it first.
import { execSync } from "node:child_process";
import { cpSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const ROUTE = "zee99lifestyle-e-brochure-lightweight";
const SRC_DIR = join(process.cwd(), "brochures", "zee99lifestyle");
const DIST = join(SRC_DIR, "dist");
const OUT = join(process.cwd(), "public", ROUTE);

if (!existsSync(join(SRC_DIR, "node_modules"))) {
  console.error(
    `Brochure dependencies are not installed. Run:\n  npm ci --prefix brochures/zee99lifestyle`,
  );
  process.exit(1);
}

// Through a shell: npm is npm.cmd on Windows, which Node refuses to execFile.
execSync("npm run build", { cwd: SRC_DIR, stdio: "inherit" });

// Replace rather than merge: a file deleted from the brochure should disappear
// from the deploy too, and Worker assets bill by what is uploaded.
rmSync(OUT, { recursive: true, force: true });
cpSync(DIST, OUT, { recursive: true });

console.log(`public/${ROUTE}/ updated from brochures/zee99lifestyle/dist`);
