/**
 * Where each shop sits on its floor plate.
 *
 * Coordinates are read off the drawings themselves (fraction of image width and
 * height, origin top-left) so the live inventory can be shown *on the plan*
 * rather than in a table beside it — which is the only way the arcade frontage
 * stays legible. Verified against the lettering on:
 *   assets/floor-plans/commercial-ground-floorplan.jpg
 *   assets/floor-plans/commercial-lowerGround-floorplan.jpg
 *
 * If either drawing is ever re-exported at a different crop, these move.
 */
export const platePos: Record<string, { x: number; y: number }> = {
  // --- Ground: nine shops, arcade along the bottom edge -------------------
  G1: { x: 0.284, y: 0.258 },
  G2: { x: 0.276, y: 0.390 },
  G3: { x: 0.276, y: 0.520 },
  G4: { x: 0.286, y: 0.668 },
  G5: { x: 0.450, y: 0.566 },
  G6: { x: 0.616, y: 0.566 },
  G7: { x: 0.856, y: 0.556 },
  G8: { x: 0.858, y: 0.376 },
  G9: { x: 0.586, y: 0.376 },

  // --- Lower Ground: thirteen shops plus the kiosk ------------------------
  L13: { x: 0.213, y: 0.140 },
  L12: { x: 0.213, y: 0.292 },
  L11: { x: 0.225, y: 0.438 },
  L4:  { x: 0.512, y: 0.420 },
  L3:  { x: 0.640, y: 0.420 },
  L2:  { x: 0.757, y: 0.420 },
  L1:  { x: 0.895, y: 0.420 },
  L10: { x: 0.108, y: 0.712 },
  L9:  { x: 0.250, y: 0.712 },
  L8:  { x: 0.386, y: 0.712 },
  L7:  { x: 0.521, y: 0.712 },
  L6:  { x: 0.660, y: 0.712 },
  L5:  { x: 0.800, y: 0.712 },
  LK1: { x: 0.436, y: 0.132 },
};

/** Shops that open directly onto the ten-foot arcade (docs/facts.md, and
 *  confirmed by the door swings drawn on the ground-floor plate). */
export const arcadeFronted = new Set(['G4', 'G5', 'G6', 'G7']);
