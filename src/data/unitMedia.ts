import type { Unit, UnitImage } from "@/data/projects";

/**
 * Interiors and drawings for the residences dialog.
 *
 * The dashboard is the source of truth (`unit.gallery`, `unit.floorPlan` — R2
 * URLs); these are the renders that ship with the site so the section is never
 * empty, and so a fresh D1 row can't blank the gallery. Built from the masters
 * by `scripts/build-unit-images.mjs`.
 */
const DIR = "/images/projects/zee99-lifestyle";

const GALLERY_FALLBACK: Record<string, UnitImage[]> = {
  studio: [
    { image: `${DIR}/studio-lounge.webp`, alt: "Lounge and sleeping area" },
    { image: `${DIR}/studio-bedroom.webp`, alt: "Bed, looking through to the kitchen" },
    { image: `${DIR}/studio-kitchen.webp`, alt: "Kitchenette and media wall" },
    { image: `${DIR}/studio-bedside.webp`, alt: "Bedside detail" },
  ],
  "one-bed": [
    { image: `${DIR}/1-bed-living.webp`, alt: "Living room and open kitchen" },
    { image: `${DIR}/1-bed-lounge.webp`, alt: "Lounge, from the entrance" },
    { image: `${DIR}/1-bed-kitchen.webp`, alt: "Kitchen and media wall" },
    { image: `${DIR}/1-bed-bedroom.webp`, alt: "Bedroom" },
    { image: `${DIR}/1-bed-bed.webp`, alt: "Bed and marble headboard wall" },
    { image: `${DIR}/1-bed-wardrobe.webp`, alt: "Fitted wardrobe" },
    { image: `${DIR}/1-bed-bedroom-media.webp`, alt: "Bedroom media wall" },
  ],
  "two-bed": [
    { image: `${DIR}/2-bed-living.webp`, alt: "Living room" },
    { image: `${DIR}/2-bed-lounge.webp`, alt: "Lounge seating" },
    { image: `${DIR}/2-bed-living-art.webp`, alt: "Living room and art wall" },
    { image: `${DIR}/2-bed-kitchen.webp`, alt: "Kitchen" },
    { image: `${DIR}/2-bed-master-bedroom.webp`, alt: "Master bedroom" },
    { image: `${DIR}/2-bed-master-dressing.webp`, alt: "Master bedroom and dressing" },
    { image: `${DIR}/2-bed-second-bedroom.webp`, alt: "Second bedroom" },
    { image: `${DIR}/2-bed-second-bedroom-media.webp`, alt: "Second bedroom media wall" },
  ],
};

const FLOOR_PLAN_FALLBACK: Record<string, string> = {
  studio: `${DIR}/studio-floor-plan.webp`,
  "one-bed": `${DIR}/1-bed-floor-plan.webp`,
  "two-bed": `${DIR}/2-bed-floor-plan.webp`,
};

/** Gallery for a unit — dashboard images when set, shipped renders otherwise. */
export function unitGallery(unit: Unit): UnitImage[] {
  const fromCms = (unit.gallery ?? []).filter((g) => g?.image);
  if (fromCms.length) {
    return fromCms.map((g, i) => ({ image: g.image, alt: g.alt || `${unit.name} — view ${i + 1}` }));
  }
  return GALLERY_FALLBACK[unit.id] ?? [];
}

/** Floor-plan drawing for a unit. */
export const unitFloorPlan = (unit: Unit): string | undefined =>
  unit.floorPlan || FLOOR_PLAN_FALLBACK[unit.id];
