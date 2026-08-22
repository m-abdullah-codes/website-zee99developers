/**
 * The e-brochure's copy and figures, as the page sees them: whatever the
 * dashboard holds, over the shipped defaults.
 *
 * Everything lives in one `brochure` row in D1's `settings` table, edited at
 * /admin → Brochure and pulled into `content/settings.json` by `npm run pull`.
 * The defaults it falls back to are in `./brochureDefaults`, which is also what
 * the dashboard starts from before the row exists.
 *
 * The merge is deliberately only two levels deep. A block the client has never
 * opened (`film`, say) comes straight from the defaults; a block they have
 * edited wins whole for the keys it carries, and keeps the default for any it
 * does not. Nothing merges *inside* an array — a list of eight specification
 * rows in D1 replaces the eight shipped ones outright, because item-by-item
 * merging of a list the client can reorder and delete has no sane answer.
 *
 * Every export below is the same name and shape the components imported when
 * this file was a plain literal, which is why none of them had to change.
 */
import settingsJson from "../../content/settings.json";
import { BROCHURE_DEFAULTS, type BrochureDoc } from "./brochureDefaults";

export type {
  AmenityGroup,
  BrochureDoc,
  BuilderProject,
  BuilderStat,
  FloorUnit,
  PathOption,
  PlatePoint,
  RoofFrame,
  ShopFloor,
  ShopUnit,
  SpecRow,
} from "./brochureDefaults";

/** Deep-partial by one level: any block may be absent, and any key inside a
 *  block may be absent, but arrays and leaves arrive whole. */
type StoredDoc = { [K in keyof BrochureDoc]?: Partial<BrochureDoc[K]> };

// `content/settings.json` is generated, so it has no `brochure` key to type
// against until the client saves one.
const stored = ((settingsJson as Record<string, unknown>).brochure ?? {}) as StoredDoc;

const block = <K extends keyof BrochureDoc>(key: K): BrochureDoc[K] => ({
  ...BROCHURE_DEFAULTS[key],
  ...(stored[key] ?? {}),
});

export const PATHS = block("paths");
export const TYPICAL_FLOOR = block("typicalFloor");
export const RESIDENCES = block("residences");
export const SPEC = block("spec");
export const BUILDING = block("building");
export const BUILDER = block("builder");
export const FILM = block("film");
export const CLOSING = block("closing");

const shopfront = block("shopfront");

export const SHOP_FLOORS = shopfront.floors;
export const PLATE_POS = shopfront.platePos;
export const ARCADE_FRONTED = shopfront.arcadeFronted;

/** The section's own copy, without the three lists that hang off it. */
export const SHOPFRONT = {
  title: shopfront.title,
  lede: shopfront.lede,
};
