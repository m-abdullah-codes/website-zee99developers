import type { Commercial, CommercialFloor } from "@/data/projects";

/**
 * The commercial section as it ships.
 *
 * Same arrangement as `unitMedia.ts`: the dashboard is the source of truth
 * (`project.commercial`), and this is what the site shows until — and wherever
 * — that row says nothing, so a fresh D1 document can never blank the section.
 * The admin edits it under Projects → Zee99 Lifestyle; every field below is
 * overridable on its own, and the two `image` fields get the media picker.
 *
 * Figures are the prelaunch schedule in `brochures/zee99lifestyle/data/
 * inventory.json`, which is the client's own sheet.
 */
const DIR = "/images/projects/zee99-lifestyle";

export const COMMERCIAL: Required<Omit<Commercial, "title">> & { title: string } = {
  title: "Two floors of *shopfront.*",
  lede: "The sports complex is across the road, Safari Mall is next door, and forty-eight households live directly upstairs.",
  floors: [
    {
      id: "ground",
      name: "Ground",
      sub: "Nine shops behind a ten-foot arcade.",
      units: "9 shops",
      sqftFrom: 305,
      sqftTo: 486,
      rate: 55000,
      priceFrom: 16775000,
      image: `${DIR}/commercial-ground-floor-plan.webp`,
      alt: "Ground floor plan — nine shops from 305 to 486 sq ft around a five- and six-foot corridor, with a ten-foot covered arcade along the frontage.",
    },
    {
      id: "lower-ground",
      name: "Lower Ground",
      sub: "Small-format retail on six-foot corridors.",
      units: "13 shops + a kiosk",
      sqftFrom: 70,
      sqftTo: 390,
      rate: 35000,
      priceFrom: 2450000,
      image: `${DIR}/commercial-lower-ground-floor-plan.webp`,
      alt: "Lower ground floor plan — thirteen shops from 180 to 390 sq ft plus a 70 sq ft kiosk, on six-foot corridors, with a patio, lift and accessible bathroom.",
    },
  ],
  split: [
    { pct: 20, label: "Down" },
    { pct: 30, label: "36 monthly" },
    { pct: 20, label: "6 bi-annual" },
    { pct: 10, label: "On structure" },
    { pct: 20, label: "At possession" },
  ],
  note: "Prelaunch rates. Every commercial unit is sold on the same split.",
};

/** Dashboard content over the shipped set, field by field. */
export function commercialContent(from?: Commercial) {
  const floors = (from?.floors ?? []).filter((f) => f?.name);
  return {
    title: from?.title || COMMERCIAL.title,
    lede: from?.lede || COMMERCIAL.lede,
    floors: (floors.length ? floors : COMMERCIAL.floors).map(withPlate),
    split: from?.split?.length ? from.split : COMMERCIAL.split,
    note: from?.note ?? COMMERCIAL.note,
  };
}

/**
 * A floor's drawing — the dashboard's when set, the shipped plate otherwise.
 * Matched on `id`, then on position, so renaming a floor in the dashboard
 * leaves it with a drawing rather than a blank column.
 */
function withPlate(floor: CommercialFloor, i: number): CommercialFloor {
  if (floor.image) return floor;
  const shipped = COMMERCIAL.floors.find((f) => f.id === floor.id) ?? COMMERCIAL.floors[i];
  return { ...floor, image: shipped?.image, alt: floor.alt || shipped?.alt };
}
